# 📦 Production Deployment Guide  
Modern 3D E-commerce Platform  
Last updated: 2025-06-02  

---

## 0  Overview  

This document describes a battle-tested path to deploy the monorepo (`ecommerce-3d/`) to AWS.  
High-level architecture:  

```
┌────────────┐    HTTPS     ┌────────────────────┐        ┌──────────────┐
│   Client   │─────────────►│  CloudFront CDN    │────────►│  S3 Assets   │
└────────────┘               └────────────────────┘        └──────────────┘
        │                              │
        │  HTTPS (ALB)                 │
        ▼                              │
┌────────────────┐        TCP          │
│   ALB (web)    │─────────────────────┘
└────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│ ECS Fargate Services (web-client, admin, api)   │
└──────────────────────────────────────────────────┘
        │
        ▼
┌────────────┐     ┌───────────────┐
│   RDS PG   │     │ ElastiCache   │
└────────────┘     └───────────────┘
```

All infra resources are codified in `infra/terraform/*`.

---

## 1  Prerequisites  

1. AWS account with admin privileges (or delegated IAM role).  
2. Domain in Route 53 (e.g. `shop.example.com`).  
3. Docker 24+, Node 20+, `pnpm`, Terraform ≥ 1.6, AWS CLI ≥ 2.  
4. GitHub repository with Actions enabled & PAT to push Docker images (or ECR login via OIDC).  

---

## 2  Infrastructure Provisioning (Terraform)  

### 2.1  Configure Terraform backend & variables  

`infra/terraform/backend.tf` already references an S3 remote backend and DynamoDB lock table.  
Edit `infra/terraform/terraform.tfvars`:

```
aws_region         = "us-east-1"
domain_name        = "shop.example.com"
certificate_arn    = "arn:aws:acm:us-east-1:123456789012:certificate/…"
github_repo        = "your-org/ecommerce-3d"
image_tag          = "latest"
```

### 2.2  Bootstrap state bucket (once)

```bash
aws s3 mb s3://ecommerce-3d-tf-state
aws dynamodb create-table \
  --table-name ecommerce-3d-tf-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 2.3  Deploy core stack

```bash
cd infra/terraform
terraform init
terraform apply -var-file=terraform.tfvars
```

Outputs include:

* `ecr_repo_url`
* `ecs_cluster_name`
* `web_alb_dns`
* `cloudfront_domain`

---

## 3  Secrets & Environment Variables  

| Name | Where | Description |
|------|-------|-------------|
| `DATABASE_URL` | AWS SSM Parameter Store (SecureString) | RDS postgres URL |
| `REDIS_URL` | SSM Parameter | Redis endpoint |
| `JWT_SECRET` | AWS Secrets Manager | Auth signing key |
| `S3_BUCKET` | SSM parameter | Public bucket for product assets |
| `CLOUDFRONT_URL` | SSM parameter | CDN domain for models/images |

Terraform module `ssm-params.tf` pre-creates placeholders.  
Set values:

```bash
aws ssm put-parameter --name "/e3d/prod/DATABASE_URL" --type "SecureString" --value "postgresql://..."
```

ECS task definition references parameters via `secrets`.

---

## 4  Building & Publishing Docker Images  

GitHub Actions workflow `.github/workflows/ci.yml` already builds multi-stage image.  
Make sure repository secrets:

* `AWS_ACCOUNT_ID`
* `AWS_REGION`
* `ECR_REPOSITORY` (from TF output)
* `AWS_ROLE_TO_ASSUME` (OIDC) **or** `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`

On every push to `main`:

1. `docker build -f docker/Dockerfile -t $ECR_REPO:$SHA .`  
2. `docker push $ECR_REPO:$SHA`  
3. Update task definition image tag and deploy via `aws-actions/amazon-ecs-deploy-task-definition@v1`.  

Blue/green: target group health-checks + CodeDeploy hooks (module `ecs-bluegreen.tf` optional).

---

## 5  Database Migration Strategy  

1. Migrations live in `packages/db/prisma/migrations`.  
2. GitHub Action runs `prisma migrate deploy` **inside** a one-off ECS task after new image is healthy.  
3. Rollback: previous stable image tag kept; migrate scripts are idempotent; use `prisma migrate resolve --rolled-back`.  
4. Point-in-time recovery enabled on RDS (7 days).  

---

## 6  Object Storage & 3D Asset Pipeline  

1. **Public images**: uploaded via Admin UI → presigned POST to `s3://$S3_BUCKET/assets/img/...`.  
2. **3D models**: uploaded to `s3://$S3_BUCKET/assets/models/...` with DRACO compression.  
3. CloudFront distribution (`cf_assets`) serves `/assets/*` with `Cache-Control: immutable, max-age=31536000`.  
4. On asset update the Admin service triggers `create_invalidation` Lambda (TF module) to purge specific paths.  

---

## 7  Continuous Delivery Flow  

1. Developer merges PR to `main`.  
2. GitHub Actions:  
   a. Lint → Test → Build → Push image.  
   b. Update task definition JSON (`infra/ecs-task.json`) image to new tag.  
   c. Deploy ECS service; wait for 2 healthy tasks.  
   d. Run DB migrations job.  
3. Slack webhook notification (`SLACK_WEBHOOK_URL` secret) sends success/failure.  

---

## 8  Monitoring & Logging  

* **CloudWatch Logs**: ECS task stdout/err. Retention = 30 days.  
* **AWS X-Ray**: enabled via sidecar for tracing api requests.  
* **Sentry**: add `SENTRY_DSN` env to web-client/admin for front-end error reporting.  
* **Prometheus/Grafana** (optional): scrape ALB, RDS, Redis metrics.  

Alerts: CloudWatch Alarms for high 5xx on ALB, CPU > 80 %, RDS connections. PagerDuty integration via SNS.

---

## 9  Cost Optimisation  

| Layer | Optimisation |
|-------|--------------|
| ECS   | Use Fargate Spot for background workers; right-size CPU/memory (web 0.5 vCPU / 1 GB). |
| RDS   | Enable auto-pause on dev, reserved instances on prod. |
| CloudFront | Tiered caching; compress objects; use `minimal` logging. |
| S3    | Lifecycle to Glacier for > 90 day versions of 3D models. |
| Logs  | Set retention, use CloudWatch log insights to filter. |

---

## 10  Alternative — Vercel / PlanetScale Quick Start  

Small teams can deploy **web-client** & **admin** separately to Vercel:

```
vercel link
vercel env add DATABASE_URL
vercel env add S3_BUCKET ...
vercel --prod
```

API routes run edge functions, while Postgres lives in PlanetScale, Redis in Upstash.  
Still upload 3D assets to S3 + CloudFront.

---

## 11  Post-Deployment Checklist  

- [ ] 🟢 ALB health checks = OK  
- [ ] 🟢 `/api/healthz` responds 200  
- [ ] 🔐 HTTPS A-record points to CloudFront & ALB (WAF rules on)  
- [ ] 🗄️ RDS backups + monitoring enabled  
- [ ] 🛡️ IAM policies least privilege (task role => S3 bucket, SSM params)  
- [ ] 📧 SES verified domain for order emails  
- [ ] 🚦 Load test with k6 → > 100 RPS stable  

---

## 12  Troubleshooting  

Issue | Possible Cause | Fix
----- | -------------- | ---
`502/503` from ALB | Task not healthy | Check ECS task logs, security-group egress
Slow 3D model load | Missing DRACO decoder | Ensure `/draco/*` path in S3, cache headers
Prisma `P1001` | DB unreachable | SG rules, RDS proxy, subnet NACL
Images 403 | Wrong S3 policy | Bucket policy allow `cloudfront` OAI

---

Happy shipping! 🚀  
For questions open an issue or ping the #devops channel.
