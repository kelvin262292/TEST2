# 🛍️ Modern 3D E-commerce Platform

Welcome to **ecommerce-3d**, an open-source monorepo that powers an immersive shopping experience with realtime 3D product visualisation, a customer-facing storefront, and an admin dashboard—all backed by a typed API and PostgreSQL database.

## ✨ Key Features

| Area | Highlights |
|------|------------|
| Web-Client | Next.js 14, React Three Fiber viewer, Tailwind UI, Zustand state, tRPC data fetching |
| Admin Dashboard | Next.js app with analytics, product/​order CRUD, role-based access |
| 3D Integration | glTF 2.0 pipeline, Draco & Meshopt compression, lazy-loaded environment lighting |
| API & DB | Node 20, Prisma ORM, PostgreSQL 15, Redis cache, typed end-to-end schemas |
| Dev Experience | pnpm workspace, Turborepo incremental builds, Storybook UI, Vitest tests |
| CI/CD | GitHub Actions, multi-stage Dockerfile, Terraform-ready infra examples |

---

## 🗂 Repository Structure

```
ecommerce-3d/
├── .github/            # CI workflows & templates
├── docker/             # Container & compose files
├── infra/              # IaC (Terraform / Pulumi)
├── package.json        # Root scripts & dev-deps
├── turbo.json          # Turborepo pipeline
├── pnpm-workspace.yaml #
└── packages/
    ├── web-client/        # 🛒 Customer storefront (Next.js)
    ├── admin-dashboard/   # 🛠  Admin panel
    ├── api/               # ⚙️  Backend services (tRPC / Next API routes)
    ├── db/                # 📦 Prisma schema & migrations
    ├── shared/            # 💎 Re-usable UI & utils
    └── config/            # 📏 tsconfig / eslint / tailwind presets
```

> Detailed package READMEs live in each folder; high-level docs are in `docs/`.

---

## 🧰 Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 (LTS) |
| pnpm | ≥ 9 (`corepack enable && corepack prepare pnpm@9 --activate`) |
| Docker | 24+ (for DB & production image) |
| PostgreSQL | 15 (optional if using Docker compose) |
| Redis | 7 (optional if using Docker compose) |

---

## 🚀 Getting Started (Local Dev)

```bash
# 1. Clone
git clone https://github.com/your-org/ecommerce-3d.git
cd ecommerce-3d

# 2. Install deps
pnpm install

# 3. Start Postgres & Redis in Docker
docker compose -f docker/docker-compose.yml up -d db redis

# 4. Generate Prisma client & run migrations + seed
pnpm db:generate
pnpm db:migrate
pnpm db:seed   # optional demo data

# 5. Launch all apps (parallel via Turborepo)
pnpm dev
```

Apps boot on:

| Package | Port |
|---------|------|
| Web-Client | `http://localhost:3000` |
| Admin Dashboard | `http://localhost:3001` |
| API routes | co-located in each Next.js app |

---

## 🛠 Common Scripts

Command | Purpose
--------|---------
`pnpm dev` | Run **web-client**, **admin-dashboard**, **api**, watch DB types
`pnpm build` | Production build all packages
`pnpm lint` | ESLint + Prettier check
`pnpm test` | Vitest unit tests
`pnpm storybook` | Launch UI component explorer (`packages/shared`)
`pnpm db:*` | Prisma helpers (`generate`, `migrate`, `seed`, `studio`)
`pnpm clean` | Purge node_modules / build outputs

---

## 🌳 Environment Variables

Copy `.env.example` → `.env` at repo root.

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecommerce
REDIS_URL=redis://localhost:6379
S3_BUCKET=e3d-models
NEXT_PUBLIC_APP_URL=http://localhost:3000
# …see docs/env.md for full list
```

Use **dotenv-vault** to manage multi-env secrets.

---

## 🗄️ Database & Migrations

Prisma schema lives in `packages/db/prisma/schema.prisma`.

| Action | Command |
|--------|---------|
| Dev migration | `pnpm db:migrate` |
| Deploy migration | `pnpm --filter db prisma migrate deploy` |
| Seed data | `pnpm db:seed` |
| Diagram | `pnpm --filter db prisma generate --schema visual` |

---

## 🖼 3D Assets Pipeline

1. Export model → glTF 2.0 (`.glb`)  
2. Compress with Draco + Meshopt (`gltf-pack`)  
3. Upload via Admin UI (presigned S3 POST)  
4. Serve through CloudFront with `Cache-Control: immutable`  
5. R3F viewer auto-loads DRACO decoder from `/draco/`

More details: `docs/3d-integration-technical-specs.md`.

---

## 🧑‍💻 Development Workflow

1. **Branching**:  
   * `main` – protected, always deployable  
   * `feat/*`, `fix/*`, `chore/*` – feature branches  
2. **Commits**: Conventional Commits (`feat:`, `fix:` …) enforced by Husky/commitlint.  
3. **Pull Request**:  
   * Draft PR → CI (lint + test + build)  
   * Requires two reviews & green checks  
   * Squash-merge to `main`.  
4. **CI/CD**: GitHub Actions builds, pushes Docker image, deploys via ECS (sample workflow in `.github/workflows/ci.yml`).  

---

## 📦 Monorepo Packages

| Package | Description |
|---------|-------------|
| `web-client` | Customer-facing Next.js storefront |
| `admin-dashboard` | Admin panel with analytics & product management |
| `api` | tRPC routers & auth logic (shared between apps) |
| `db` | Prisma client + migrations |
| `shared` | UI component library, hooks, utils |
| `config` | Centralized ESLint, Tailwind, TS configs |

---

## 🤝 Contributing

1. Fork & clone repo.  
2. Create a feature branch (`git checkout -b feat/my-awesome-feature`).  
3. Follow coding standards (ESLint/Prettier auto-fix).  
4. Add/​update tests where relevant.  
5. Open a Pull Request against `main`.

All contributions—code, docs, ideas—are welcome!

---

## 📄 Further Documentation

| Doc | Path |
|-----|------|
| Project Setup Guide | `docs/project-setup-guide.md` |
| Database Schema | `docs/database-schema-design.md` |
| 3D Integration Specs | `docs/3d-integration-technical-specs.md` |
| UI/UX Design System | `docs/ui-ux-wireframes-design.md` |

---

## 📝 License

MIT © 2025 San Francisco AI Factory – Built with ❤️ by the community.  
