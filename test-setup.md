# 🧪 Project Testing Guide

Modern 3D E-commerce Platform  
Last updated: 2025-06-02  

---

## 1  Overview

This document explains **how to set up, run, and extend the automated test-suite locally** so you can validate that the monorepo is healthy before adding new features.

We cover four layers of quality checks:

| Layer | Tooling | What we catch |
|-------|---------|---------------|
| Static analysis | ESLint + Prettier + TypeScript | style, obvious bugs, type errors |
| Unit tests | Vitest | pure functions, React hooks, UI logic |
| Component/visual tests | Storybook + @storybook/test | regressions in shared UI |
| Integration & E2E | Playwright (headless browser) | routes, API ↔ DB correctness |

All tests are orchestrated through **pnpm scripts** and **Turborepo** pipelines.

---

## 2  Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥ 20 | use fnm/nvm/Volta |
| pnpm | ≥ 9 | `corepack enable` |
| Docker |  ≥ 24 | Postgres + Redis containers |
| Git | any recent | for hooks/CI |

Make sure the database services are reachable:

```bash
docker compose -f docker/docker-compose.yml up -d db redis
```

---

## 3  Environment Setup

1. **Clone & install**

```bash
git clone https://github.com/your-org/ecommerce-3d.git
cd ecommerce-3d
cp .env.example .env               # fill in secrets if needed
pnpm install
```

2. **Generate Prisma client & run migrations**

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed        # optional demo data
```

3. **Bootstrap Storybook assets**

```bash
pnpm --filter @e3d/shared storybook:build
```

---

## 4  Running the Test Suites

### 4.1  Lint, Format, Type-check (fast feedback)

```bash
pnpm lint          # ESLint + Prettier
pnpm format        # auto-fix all *.ts/tsx/js/json/md
pnpm -r typecheck  # per-package `tsc --noEmit`
```

> Tip: a pre-commit hook already runs `lint-staged`; you should rarely see CI fail if hooks pass locally.

### 4.2  Unit & Hook Tests

```bash
pnpm test          # runs Vitest across all packages
pnpm test --filter web-client  # package-scoped
pnpm test:watch    # watch mode
pnpm test:coverage # generate `coverage/`
```

Vitest is configured in `vitest.config.ts` at each package root and supports:

- JSDOM renderer for React components
- `@testing-library/react` helpers (`render`, `screen`, `userEvent`)
- Snapshot testing (`expect(x).toMatchSnapshot()`)

### 4.3  Component / Visual Regression

Storybook drives visual regression via Chromatic (optional) or **@storybook/test**:

```bash
# interactive story explorer
pnpm --filter @e3d/shared storybook

# run automated interaction/visual tests
pnpm --filter @e3d/shared storybook:test
```

### 4.4  API Integration Tests

The API package exports a **tRPC caller** mock to hit router procedures without HTTP overhead.

```bash
pnpm --filter @e3d/api test
```

- Uses an **SQLite in-memory Prisma datasource** so tests are isolated and reset between runs.
- Seed helpers live in `packages/api/tests/_utils/seed.ts`.

### 4.5  End-to-End (Playwright)

Playwright tests reside in `tests/e2e/`.

```bash
pnpm e2e          # alias for `playwright test`
pnpm e2e:ui       # headed mode for debugging
```

Setup flow:

1. Spawns web-client (port 3000) & admin (3001) against **test** database.
2. Seeds minimal fixtures.
3. Executes user flows: sign-up → add-to-cart → checkout → admin marks order shipped.

Headless Chromium is default; matrix {Chromium, WebKit, Firefox} runs in CI.

---

## 5  Continuous Integration

`.github/workflows/ci.yml`

| Job | What it runs |
|-----|--------------|
| build-test | lint, type-check, unit tests, build artefacts |
| e2e | Playwright E2E on ubuntu-latest |
| deploy | only on `main` if previous jobs pass |

CI uses the same scripts listed above—your local run should match CI exactly.

---

## 6  Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Prisma P1001` during tests | Postgres not running | `docker compose up db` |
| `ECONNREFUSED 127.0.0.1:3000` in Playwright | dev servers not ready | increase `webTimeout` in `playwright.config.ts` |
| Missing env vars | `.env` not copied | `cp .env.example .env` |
| Timeouts on Windows WSL | Docker DNS | add `extra_hosts` in compose |

---

## 7  Extending the Suite

1. **New component** → write Storybook story (`*.stories.tsx`) + unit test.
2. **New API router** → export test caller, add integration test in `__tests__/`.
3. **Critical user flow** → add Playwright spec in `tests/e2e/`.

Follow the **Testing Pyramid**: many unit tests, fewer integration, minimal E2E.

---

## 8  Summary Cheat-sheet

```bash
# one-shot test everything
pnpm lint && pnpm typecheck && pnpm test && pnpm e2e

# frequently while coding
pnpm dev               # start apps
pnpm test:watch        # watch unit tests
```

Happy testing! 🚀  
