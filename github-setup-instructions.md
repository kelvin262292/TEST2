# 📤 GitHub Setup Instructions  
Modern 3D E-commerce Platform  
_Last updated&nbsp;2025-06-02_

> Use this guide to upload the entire monorepo we have built to an **empty public repository** –  
> `https://github.com/kelvin262292/TEST2.git` (replace with another URL if you fork/rename).

---

## 0  Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Git  | 2.40 +  | `git --version` |
| Node | ≥ 20    | already required by project |
| pnpm | ≥ 9     | `corepack prepare pnpm@9 --activate` |
| Docker| ≥ 24   | start DB containers locally |
| GitHub CLI (gh) | optional | simplifies token/branch ops |

Create a **Personal Access Token (PAT)** with `repo` scope or enable **GitHub CLI SSH/OIDC**.

---

## 1  Prepare the Local Project Folder

```bash
# If you haven't already generated the code:
mkdir ecommerce-3d
cd ecommerce-3d
# ⬇️  put _all_ files and folders we generated earlier here
```

_Ensure the root contains:_ `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `packages/`, `docker/`, etc.

Add a sensible `.gitignore` (Node, logs, dist, .env, coverage, etc.):

```bash
npx gitignore node
echo ".env*" >> .gitignore
echo "coverage" >> .gitignore
```

---

## 2  Initialise Git & Verify Project Builds

```bash
git init -b main                # create main branch (works even if repo is empty)
git add .
git commit -m "🎉 Initial commit: 3D E-commerce monorepo"

# ‑-- smoke-test before pushing
pnpm install
docker compose -f docker/docker-compose.yml up -d db redis
pnpm db:generate && pnpm db:migrate && pnpm test
```

All tests should pass (`run-tests.sh` can generate a report).  
Fix any red tests before you continue.

---

## 3  Connect to Remote Repository

### Option A  GitHub CLI (recommended)

```bash
gh repo set-default kelvin262292/TEST2      # if cloned already, or:
gh repo create kelvin262292/TEST2 --public  # creates if it does not exist

git remote add origin https://github.com/kelvin262292/TEST2.git
```

### Option B  Manual HTTPS / SSH

```bash
git remote add origin git@github.com:kelvin262292/TEST2.git   # SSH
# or
git remote add origin https://<YOUR_GITHUB_TOKEN>@github.com/kelvin262292/TEST2.git
```

---

## 4  Push Code

```bash
# If the remote is empty it has no default branch – the first push sets it.
git push -u origin main
```

If `main` already exists but you lack permission:

```bash
git push -u origin main --force-with-lease
```

_For a safer path you can push a feature branch first:_

```bash
git checkout -b feat/initial-upload
git push -u origin feat/initial-upload

# Then open a Pull Request and merge in the GitHub UI.
```

---

## 5  Optional: Git LFS for Large 3D Assets

If any `.glb`/`.gltf` model > 50 MB:

```bash
git lfs install
git lfs track "*.glb" "*.gltf"
git add .gitattributes
git add path/to/large/models/*.glb
git commit -m "chore: track 3D models via Git LFS"
git push
```

---

## 6  Configure Repository Settings

1. **Default Branch** → `main` (repo › Settings › Branches).  
2. **Branch Protection**  
   - Require status checks: `build-test`, `e2e`.  
   - Require 1-2 reviews before merge.  
3. **Secrets & Variables** (Settings › Secrets › Actions)  
   - `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, etc.  
   - `AWS_ACCOUNT_ID`, `AWS_REGION`, etc. for deployment workflow.  
4. **Actions** → Enable workflows on first push if prompted.

---

## 7  Verify GitHub Actions CI

Workflows live in `.github/workflows/ci.yml`.

```text
build-test  ✓ lint / test / build  
e2e         ✓ Playwright (optional)  
deploy      (skipped on PRs, runs on main)
```

After the first push open **Actions** tab – make sure the `build-test` job is green.

---

## 8  Next Steps

1. **Invite collaborators** – repo › Settings › Collaborators.  
2. **Enable GitHub Pages** (optional) for Storybook documentation.  
3. Follow `deployment-guide.md` to provision AWS and connect CI secrets.  
4. Tag a release:  
   ```bash
   git tag -a v0.1.0 -m "Initial MVP"
   git push origin v0.1.0
   ```

---

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `fatal: remote origin already exists` | You added origin twice | `git remote set-url origin <url>` |
| `rejected > large file` | Asset exceeds 100 MB | Use Git LFS or S3 |
| `permission denied (publickey)` | SSH key not added | `ssh -T git@github.com`, add key in GitHub settings |
| `protected branch push failed` | Branch protection | Create PR or require status checks |

---

Happy shipping! 🚀  
If any step fails open an issue or ping @Dennis-Smith for help.
