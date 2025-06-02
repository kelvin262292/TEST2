# Project Setup Guide

Modern 3D E-commerce Platform  
Author: Dennis Smith (Product Manager)  
Last updated: 2025-06-02

---

## 1  Monorepo Structure

We use a **pnpm + TurboRepo** monorepo to host all first-party code.

```
ecommerce-3d/
├── .github/              # Workflows, issue/PR templates
├── .vscode/              # Recommended extensions & settings
├── docker/               # Container build files
├── infra/                # IaC (Terraform / Pulumi)
├── turbo.json            # Turborepo pipeline config
├── package.json          # Root scripts & dev-deps
├── pnpm-workspace.yaml   # Package boundaries
└── packages/
    ├── web-client/       # Customer-facing Next.js app
    │   ├── public/
    │   └── src/
    ├── admin-dashboard/  # Admin panel (Next.js or Remix)
    │   └── src/
    ├── api/              # Backend services (tRPC/Express)
    │   └── src/
    ├── db/               # Prisma schema & migrations
    ├── shared/           # Re-usable TS utils, UI, hooks
    └── config/           # eslint, tsconfig, tailwind preset
```

Key ideas  
• **Isolation** – each package self-contained, publishes TypeScript types for others.  
• **Zero-install** – CI/CD and Docker rely on lockfile committed to repo.  
• **Single source of truth** – lint, build, test executed from root via Turborepo pipelines.

---

## 2  Technology Stack (Pinned Versions)

| Layer                  | Tech                         | Version |
|------------------------|------------------------------|---------|
| Frontend runtime       | Next.js                      | 14.x    |
| 3D Engine              | React Three Fiber            | 9.x     |
| State management       | Zustand                      | 4.x     |
| Styling                | Tailwind CSS                 | 3.4.x   |
| Backend runtime        | Node.js LTS                  | 20.x    |
| API framework          | tRPC                         | 10.x    |
| ORM                    | Prisma                       | 5.x     |
| DB                     | PostgreSQL                   | 15      |
| Cache / Session        | Redis                        | 7       |
| Container runtime      | Docker                       | 24+     |
| CI                     | GitHub Actions               | N/A     |
| Package manager        | pnpm                         | 9.x     |
| Monorepo build         | Turborepo                    | 1.13.x  |
| Linting                | ESLint                       | 9.x     |
| Formatting             | Prettier                     | 3.x     |
| Testing                | Vitest                       | 1.x     |
| Type checking          | TypeScript                   | 5.4.x   |

---

## 3  Environment Setup

### Prerequisites

1. Node.js 20+ (use `fnm`, `nvm`, or Volta)  
2. pnpm 9+ – `corepack enable && corepack prepare pnpm@9 --activate`  
3. Docker Desktop or CLI  
4. PostgreSQL & Redis locally (or use Docker compose)  
5. (Optional) AWS CLI & SAM for cloud deployments

### Bootstrap Steps

```bash
git clone git@github.com:your-org/ecommerce-3d.git
cd ecommerce-3d

# install deps
pnpm install

# generate Prisma client & DB
pnpm db:generate && pnpm db:migrate

# start all dev services
pnpm dev   # parallel: web-client, admin, api, db-watch
```

Environment variables are managed with **dotenv-vault**:

```
.env
DATABASE_URL=postgres://...
REDIS_URL=redis://...
S3_BUCKET=assets-3d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4  Package.json Configurations

### Root `package.json`

```json
{
  "name": "ecommerce-3d",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:generate": "pnpm --filter db prisma generate",
    "db:migrate": "pnpm --filter db prisma migrate dev"
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

### `packages/web-client/package.json` (excerpt)

```json
{
  "name": "@e3d/web-client",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "18.3.0",
    "three": "0.162.0",
    "@react-three/fiber": "9.1.6",
    "zustand": "^4.5.0"
  }
}
```

Similar `package.json` files live in **admin-dashboard**, **api**, and **shared** with appropriate entry scripts.

---

## 5  Docker Configuration

### 5.1 Dockerfile (multi-stage)

`docker/Dockerfile`

```dockerfile
# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --frozen-lockfile
RUN pnpm build

# ---------- runtime ----------
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node", "packages/api/dist/index.js"]
```

### 5.2 Docker Compose (local dev)

`docker/docker-compose.yml`

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: ["db-data:/var/lib/postgresql/data"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    env_file: ../.env
    ports: ["3000:3000"]
    depends_on: [db, redis]

volumes:
  db-data:
```

---

## 6  CI/CD Pipeline (GitHub Actions)

`.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test -- --run
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: ./

  deploy:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: ./
      - name: Push Docker image
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker build -f docker/Dockerfile -t your-registry/ecommerce-3d:${{ github.sha }} .
          docker push your-registry/ecommerce-3d:${{ github.sha }}
      - name: Deploy to AWS ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: infra/ecs-task.json
          service: ecommerce
          cluster: ecommerce-cluster
          wait-for-service-stability: true
```

---

## 7  Development Workflow

1. **Branching strategy**:  
   • `main` – deployable, protected  
   • `feat/*`, `fix/*` – feature branches  
2. **Commit convention**: Conventional Commits (`feat:`, `fix:`, `chore:`) enforced by Husky + Commitlint.  
3. **PR flow**:  
   • Draft PR, automatic CI runs  
   • Two approvals + passing CI required to merge  
   • Squash-merge to keep history clean  
4. **Storybook**: UI components documented in **packages/shared**; run with `pnpm storybook`.  
5. **Live reload**: Turborepo pipelines automatically watch packages and restart affected apps.

---

## 8  Code Standards & Linting

### ESLint & Prettier

`packages/config/eslint-preset.js`

```js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  settings: { react: { version: 'detect' } },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error'],
    'react/react-in-jsx-scope': 'off'
  }
};
```

`packages/config/prettier.config.js`

```js
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100
};
```

### Stylelint (Tailwind)

```json
{
  "extends": ["stylelint-config-standard", "stylelint-config-prettier"],
  "plugins": ["stylelint-order"],
  "rules": {
    "order/properties-alphabetical-order": true
  }
}
```

### Husky + Lint-staged

```bash
pnpm dlx husky-init && pnpm install
```

`.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
pnpm lint
pnpm test -- --changed
pnpm prettier --check .
```

---

## Next Steps

1. Provision AWS infrastructure via `infra/terraform`.  
2. Set up domain & SSL in Route53.  
3. Integrate 3D asset pipeline (GLTF compression, CDN).  
4. Expand CI to include security scanning (Snyk, Trivy).  

Welcome to the codebase—happy shipping! 🚀
