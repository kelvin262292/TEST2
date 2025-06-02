# ⚡ Quick-Start – Test the 3D E-commerce Monorepo

*Spend less than 10 minutes to prove everything works before you dive deeper.*

---

## 1 . Prerequisites

| Tool | Min. Version | Check |
|------|--------------|-------|
| Node.js | 20 LTS | `node -v` |
| pnpm | 9 | `pnpm -v` |
| Docker | 24 | `docker -v` |

> No global Postgres/Redis required – Docker compose spins them up for you.

---

## 2 . Clone & Install

```bash
git clone https://github.com/your-org/ecommerce-3d.git
cd ecommerce-3d

# Install all workspace deps (~2-3 min)
pnpm install
```

---

## 3 . One-time Environment Setup

```bash
# 1. Copy env template
cp .env.example .env            # adjust only if ports clash

# 2. Start database & cache in background
docker compose -f docker/docker-compose.yml up -d db redis

# 3. Generate Prisma client & run latest migrations
pnpm db:generate && pnpm db:migrate

# 4. (Optional) load demo data for UI smoke tests
pnpm db:seed
```

---

## 4 . Smoke-test the Monorepo

### A. Fast static checks (<30 s)

```bash
pnpm lint         # ESLint + Prettier
pnpm -r typecheck # TypeScript across all packages
```

### B. Unit / hook tests (Vitest)

```bash
pnpm test         # runs everywhere – expect ✅
```

### C. UI component test (shared package)

```bash
pnpm --filter @e3d/shared storybook:test
```

### D. API integration tests (SQLite in-memory)

```bash
pnpm --filter @e3d/api test
```

### E. Full suite in one go (includes E2E)

```bash
./run-tests.sh        # interactive summary + report file
```

> Want it quicker? `./run-tests.sh --skip-e2e` finishes in ~1 min.

---

## 5 . Manual Verification (Optional)

```bash
# Parallel dev servers
pnpm dev
```

Open:
* Storefront → http://localhost:3000  
* Admin   → http://localhost:3001 (login: `admin@example.com` / `admin123`)

Make sure:
1. Home page lists demo products.
2. Product detail page renders 3D viewer.
3. Admin dashboard loads charts.

---

## 6 . Clean Up

```bash
docker compose -f docker/docker-compose.yml down
pnpm clean            # remove dist & node_modules (optional)
```

---

### Next Steps

* Integrate Stripe in `.env`, run checkout flow.
* Follow `deployment-guide.md` for AWS deploy.

Happy testing 🚀
