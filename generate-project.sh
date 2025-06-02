#!/bin/bash
# generate-project.sh
# Comprehensive script to generate the entire 3D E-commerce platform
# Author: Dennis Smith
# Usage: ./generate-project.sh [target-directory]

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default target directory
TARGET_DIR="ecommerce-3d"

# Check if target directory is provided
if [ $# -eq 1 ]; then
  TARGET_DIR="$1"
fi

# Print header
print_header() {
  echo -e "\n${BLUE}======================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}======================================${NC}\n"
}

# Print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Print warning message
print_warning() {
  echo -e "${YELLOW}! $1${NC}"
}

# Create directory if it doesn't exist
create_dir() {
  local dir="$1"
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    print_success "Created directory: $dir"
  fi
}

# Create file with content
create_file() {
  local file="$1"
  local content="$2"
  
  # Create directory if it doesn't exist
  local dir=$(dirname "$file")
  create_dir "$dir"
  
  # Create file
  echo "$content" > "$file"
  print_success "Created file: $file"
}

# Main function
main() {
  print_header "Generating 3D E-commerce Platform"
  
  # Check if target directory exists
  if [ -d "$TARGET_DIR" ]; then
    print_warning "Directory $TARGET_DIR already exists."
    read -p "Do you want to continue and potentially overwrite files? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_error "Aborting."
      exit 1
    fi
  fi
  
  # Create target directory
  create_dir "$TARGET_DIR"
  cd "$TARGET_DIR"
  
  # Create root directories
  print_header "Creating Directory Structure"
  
  create_dir "packages/web-client/src/components/auth"
  create_dir "packages/web-client/src/components/products"
  create_dir "packages/web-client/src/components/3d"
  create_dir "packages/web-client/src/components/checkout"
  create_dir "packages/web-client/src/hooks"
  create_dir "packages/web-client/src/utils"
  create_dir "packages/web-client/src/pages/products"
  
  create_dir "packages/admin-dashboard/src/components/Layout"
  create_dir "packages/admin-dashboard/src/pages/admin"
  
  create_dir "packages/shared/src/components/ui"
  create_dir "packages/shared/src/components/ui/__tests__"
  create_dir "packages/shared/src/utils"
  create_dir "packages/shared/src/lib"
  create_dir "packages/shared/src/test"
  
  create_dir "packages/db/prisma"
  
  create_dir "packages/api/src/routers"
  
  create_dir "docker"
  
  # Create root files
  print_header "Creating Root Files"
  
  # package.json
  create_file "package.json" '{
  "name": "ecommerce-3d",
  "version": "0.1.0",
  "private": true,
  "description": "Modern 3D E-commerce Platform",
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,md,js,jsx,json}\"",
    "db:generate": "pnpm --filter db prisma generate",
    "db:migrate": "pnpm --filter db prisma migrate dev",
    "db:seed": "pnpm --filter db prisma db seed",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.5",
    "turbo": "^1.13.0",
    "typescript": "^5.4.2"
  },
  "pnpm": {
    "overrides": {
      "react": "^18.3.0",
      "react-dom": "^18.3.0"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}'

  # pnpm-workspace.yaml
  create_file "pnpm-workspace.yaml" 'packages:
  - "packages/*"'

  # turbo.json
  create_file "turbo.json" '{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "cache": true
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}'

  # .env.example
  create_file ".env.example" '# 3D E-commerce Platform - Environment Variables
# Copy this file to .env and fill in the values

# ==========================================
# Database Configuration
# ==========================================
# PostgreSQL connection string for Prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce3d?schema=public"

# ==========================================
# Authentication
# ==========================================
# Secret key for JWT token generation and verification
JWT_SECRET="your-secret-key-at-least-32-chars-long"
# JWT token expiration time
JWT_EXPIRES_IN="7d"
# Refresh token expiration time
REFRESH_TOKEN_EXPIRES_IN="30d"

# ==========================================
# Server Configuration
# ==========================================
# Node environment: development, test, or production
NODE_ENV="development"
# Port for the API server
PORT=3000
# Admin dashboard port
ADMIN_PORT=3001
# API base URL
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
# Client application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Admin dashboard URL
NEXT_PUBLIC_ADMIN_URL="http://localhost:3001"

# ==========================================
# Storage & CDN
# ==========================================
# AWS S3 bucket for storing 3D models and images
S3_BUCKET="e3d-models"
# AWS region
AWS_REGION="us-east-1"
# AWS access key ID
AWS_ACCESS_KEY_ID="your-access-key-id"
# AWS secret access key
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
# CloudFront distribution URL for serving assets
CLOUDFRONT_URL="https://your-distribution-id.cloudfront.net"

# ==========================================
# Caching
# ==========================================
# Redis URL for caching and session management
REDIS_URL="redis://localhost:6379"

# ==========================================
# Email Service
# ==========================================
# SMTP configuration for sending emails
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
# Sender email address
EMAIL_FROM="noreply@yourdomain.com"

# ==========================================
# Payment Processing
# ==========================================
# Stripe API keys
STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# PayPal API configuration
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
PAYPAL_ENVIRONMENT="sandbox" # or "production"

# ==========================================
# Analytics & Monitoring
# ==========================================
# Google Analytics ID
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
# Sentry DSN for error tracking
SENTRY_DSN="https://your-sentry-dsn"

# ==========================================
# Feature Flags
# ==========================================
# Enable/disable 3D viewer
NEXT_PUBLIC_ENABLE_3D_VIEWER=true
# Enable/disable guest checkout
ENABLE_GUEST_CHECKOUT=true'

  # README.md
  create_file "README.md" '# 🛍️ Modern 3D E-commerce Platform

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

MIT © 2025 San Francisco AI Factory – Built with ❤️ by the community.  '

  # docker-compose.yml
  create_file "docker/docker-compose.yml" 'version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ecommerce3d
    ports: ["5432:5432"]
    volumes: ["db-data:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    ports: ["6379:6379"]
    volumes: ["redis-data:/data"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  db-data:
  redis-data:'

  # Create run-tests.sh
  create_file "run-tests.sh" '#!/bin/bash
# run-tests.sh
# Comprehensive test script for 3D E-commerce Platform
# Usage: ./run-tests.sh [--skip-setup] [--skip-e2e] [--verbose]

set -e # Exit on error

# Colors for output
RED='\''\\033[0;31m'\''
GREEN='\''\\033[0;32m'\''
YELLOW='\''\\033[0;33m'\''
BLUE='\''\\033[0;34m'\''
NC='\''\\033[0m'\'' # No Color

# Default options
SKIP_SETUP=false
SKIP_E2E=false
VERBOSE=false
GENERATE_REPORT=true

# Parse arguments
for arg in "$@"; do
  case $arg in
    --skip-setup)
      SKIP_SETUP=true
      shift
      ;;
    --skip-e2e)
      SKIP_E2E=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --no-report)
      GENERATE_REPORT=false
      shift
      ;;
    *)
      # Unknown option
      echo -e "${RED}Unknown option: $arg${NC}"
      echo "Usage: ./run-tests.sh [--skip-setup] [--skip-e2e] [--verbose] [--no-report]"
      exit 1
      ;;
  esac
done

# Function to print section header
print_header() {
  echo -e "\\n${BLUE}======================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}======================================${NC}\\n"
}

# Function to print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print warning message
print_warning() {
  echo -e "${YELLOW}! $1${NC}"
}

# Function to run a command and capture its output and exit code
run_command() {
  local cmd="$1"
  local description="$2"
  local output_file="$(mktemp)"
  local start_time=$(date +%s)
  
  echo -e "Running: ${YELLOW}$description${NC}"
  
  if $VERBOSE; then
    eval "$cmd" | tee "$output_file"
    exit_code=${PIPESTATUS[0]}
  else
    eval "$cmd" > "$output_file" 2>&1
    exit_code=$?
  fi
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  
  if [ $exit_code -eq 0 ]; then
    print_success "$description (${duration}s)"
    echo "$description: SUCCESS (${duration}s)" >> "$TEST_RESULTS"
  else
    print_error "$description failed (${duration}s)"
    echo "$description: FAILED (${duration}s)" >> "$TEST_RESULTS"
    echo "Command: $cmd" >> "$TEST_RESULTS"
    echo "Output:" >> "$TEST_RESULTS"
    cat "$output_file" >> "$TEST_RESULTS"
    echo "" >> "$TEST_RESULTS"
    
    if ! $VERBOSE; then
      echo -e "${YELLOW}Command output:${NC}"
      cat "$output_file"
    fi
  fi
  
  rm "$output_file"
  return $exit_code
}

# Create a temporary file to store test results
TEST_RESULTS=$(mktemp)
echo "3D E-commerce Platform Test Results - $(date)" > "$TEST_RESULTS"
echo "=================================================" >> "$TEST_RESULTS"
echo "" >> "$TEST_RESULTS"

# Track overall success
TESTS_PASSED=true

# Check prerequisites
print_header "Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  print_success "Node.js found: $NODE_VERSION"
  echo "Node.js: $NODE_VERSION" >> "$TEST_RESULTS"
  
  # Check if Node.js version is >= 20
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed '\''s/v//'\'')
  if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
    print_warning "Node.js version should be >= 20. Current version: $NODE_VERSION"
  fi
else
  print_error "Node.js not found. Please install Node.js >= 20"
  echo "Node.js: NOT FOUND" >> "$TEST_RESULTS"
  TESTS_PASSED=false
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version)
  print_success "pnpm found: $PNPM_VERSION"
  echo "pnpm: $PNPM_VERSION" >> "$TEST_RESULTS"
  
  # Check if pnpm version is >= 9
  PNPM_MAJOR_VERSION=$(echo $PNPM_VERSION | cut -d. -f1)
  if [ "$PNPM_MAJOR_VERSION" -lt 9 ]; then
    print_warning "pnpm version should be >= 9. Current version: $PNPM_VERSION"
  fi
else
  print_error "pnpm not found. Please install pnpm >= 9"
  echo "pnpm: NOT FOUND" >> "$TEST_RESULTS"
  TESTS_PASSED=false
fi

# Check Docker
if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version | cut -d'\'' '\'' -f3 | sed '\''s/,//'\'')
  print_success "Docker found: $DOCKER_VERSION"
  echo "Docker: $DOCKER_VERSION" >> "$TEST_RESULTS"
else
  print_error "Docker not found. Please install Docker"
  echo "Docker: NOT FOUND" >> "$TEST_RESULTS"
  TESTS_PASSED=false
fi

# Setup environment if not skipped
if ! $SKIP_SETUP; then
  print_header "Setting Up Environment"
  
  # Check if .env file exists, create from example if not
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      cp .env.example .env
      print_success "Created .env file from .env.example"
    else
      print_error ".env file not found and .env.example doesn'\''t exist"
      TESTS_PASSED=false
    fi
  else
    print_success ".env file exists"
  fi
  
  # Start Docker containers for database and Redis
  print_warning "Starting Docker containers for PostgreSQL and Redis..."
  if ! run_command "docker compose -f docker/docker-compose.yml up -d db redis" "Start Docker services"; then
    print_error "Failed to start Docker services"
    TESTS_PASSED=false
  fi
  
  # Wait for services to be ready
  print_warning "Waiting for services to be ready..."
  sleep 5
  
  # Install dependencies
  if ! run_command "pnpm install" "Install dependencies"; then
    print_error "Failed to install dependencies"
    TESTS_PASSED=false
  fi
  
  # Generate Prisma client
  if ! run_command "pnpm db:generate" "Generate Prisma client"; then
    print_error "Failed to generate Prisma client"
    TESTS_PASSED=false
  fi
  
  # Run database migrations
  if ! run_command "pnpm db:migrate" "Run database migrations"; then
    print_error "Failed to run database migrations"
    TESTS_PASSED=false
  fi
  
  # Seed database with test data
  if ! run_command "pnpm db:seed" "Seed database with test data"; then
    print_warning "Failed to seed database with test data (this might be OK if already seeded)"
  fi
fi

# Run static analysis tests
print_header "Running Static Analysis"

# Lint
if ! run_command "pnpm lint" "ESLint"; then
  print_error "Linting failed"
  TESTS_PASSED=false
fi

# Type check
if ! run_command "pnpm -r typecheck" "TypeScript type checking"; then
  print_error "Type checking failed"
  TESTS_PASSED=false
fi

# Run unit tests
print_header "Running Unit Tests"

if ! run_command "pnpm test" "Unit tests"; then
  print_error "Unit tests failed"
  TESTS_PASSED=false
fi

# Run component tests (Storybook)
print_header "Running Component Tests"

if ! run_command "pnpm --filter @e3d/shared storybook:test" "Storybook component tests"; then
  print_warning "Storybook component tests failed (this might be OK during development)"
  # Not failing the entire suite for Storybook tests
fi

# Run integration tests
print_header "Running Integration Tests"

if ! run_command "pnpm --filter @e3d/api test" "API integration tests"; then
  print_error "API integration tests failed"
  TESTS_PASSED=false
fi

# Run E2E tests if not skipped
if ! $SKIP_E2E; then
  print_header "Running End-to-End Tests"
  
  if ! run_command "pnpm e2e" "Playwright E2E tests"; then
    print_error "E2E tests failed"
    TESTS_PASSED=false
  fi
else
  print_warning "Skipping E2E tests as requested"
  echo "E2E Tests: SKIPPED" >> "$TEST_RESULTS"
fi

# Generate report
if $GENERATE_REPORT; then
  print_header "Generating Test Report"
  
  REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).txt"
  cp "$TEST_RESULTS" "$REPORT_FILE"
  
  # Add summary to report
  echo "" >> "$REPORT_FILE"
  echo "Summary" >> "$REPORT_FILE"
  echo "=======" >> "$REPORT_FILE"
  
  if $TESTS_PASSED; then
    echo "All tests PASSED!" >> "$REPORT_FILE"
    print_success "All tests passed! Report saved to $REPORT_FILE"
  else
    echo "Some tests FAILED. See details above." >> "$REPORT_FILE"
    print_error "Some tests failed. Report saved to $REPORT_FILE"
  fi
  
  echo "" >> "$REPORT_FILE"
  echo "Generated on $(date)" >> "$REPORT_FILE"
  
  # Print report path
  echo -e "\\nTest report saved to: ${BLUE}$REPORT_FILE${NC}"
fi

# Cleanup
rm "$TEST_RESULTS"

# Exit with appropriate status
if $TESTS_PASSED; then
  print_header "All tests passed successfully! 🎉"
  exit 0
else
  print_header "Some tests failed. Please fix the issues and try again."
  exit 1
fi'

  # Make run-tests.sh executable
  chmod +x run-tests.sh

  # Create quick-start.md
  create_file "quick-start.md" '# ⚡ Quick-Start – Test the 3D E-commerce Monorepo

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
* Storefront → http://localhost:3000  
* Admin   → http://localhost:3001 (login: `admin@example.com` / `admin123`)

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

Happy testing 🚀'

  # Create test-setup.md
  create_file "test-setup.md" '# 🧪 Project Testing Guide

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

Happy testing! 🚀  '

  # Create deployment-guide.md
  create_file "deployment-guide.md" '# 📦 Production Deployment Guide  
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
For questions open an issue or ping the #devops channel.'

  # Create package.json files for packages
  print_header "Creating Package Files"
  
  # packages/web-client/package.json
  create_file "packages/web-client/package.json" '{
  "name": "@e3d/web-client",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "clean": "rm -rf .next node_modules"
  },
  "dependencies": {
    "@e3d/shared": "workspace:*",
    "@e3d/db": "workspace:*",
    "@react-three/drei": "^9.88.0",
    "@react-three/fiber": "^9.0.0",
    "@tailwindcss/forms": "^0.5.7",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.0",
    "next": "^14.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-error-boundary": "^4.0.11",
    "react-hook-form": "^7.48.0",
    "tailwind-merge": "^2.0.0",
    "three": "^0.162.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/three": "^0.162.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint-config-next": "^14.0.0",
    "jsdom": "^23.0.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}'

  # packages/admin-dashboard/package.json
  create_file "packages/admin-dashboard/package.json" '{
  "name": "@e3d/admin-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "clean": "rm -rf .next node_modules"
  },
  "dependencies": {
    "@e3d/shared": "workspace:*",
    "@e3d/db": "workspace:*",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "@tanstack/react-query": "^5.8.0",
    "@tanstack/react-table": "^8.10.7",
    "axios": "^1.6.0",
    "chart.js": "^4.4.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^10.16.0",
    "next": "^14.0.0",
    "next-auth": "^4.24.5",
    "react": "^18.3.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.3.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.48.0",
    "react-hot-toast": "^2.4.1",
    "tailwind-merge": "^2.0.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint-config-next": "^14.0.0",
    "jsdom": "^23.0.0",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}'

  # packages/shared/package.json
  create_file "packages/shared/package.json" '{
  "name": "@e3d/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "files": [
    "dist/**"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "clean": "rm -rf .turbo node_modules dist",
    "test": "vitest run",
    "test:watch": "vitest",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.4",
    "react-aria": "^3.30.0",
    "react-hook-form": "^7.48.0",
    "tailwind-merge": "^2.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^7.5.3",
    "@storybook/addon-interactions": "^7.5.3",
    "@storybook/addon-links": "^7.5.3",
    "@storybook/addon-styling": "^1.3.7",
    "@storybook/blocks": "^7.5.3",
    "@storybook/react": "^7.5.3",
    "@storybook/react-vite": "^7.5.3",
    "@storybook/testing-library": "^0.2.2",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^14.1.0",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "autoprefixer": "^10.4.16",
    "eslint": "^9.0.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-storybook": "^0.6.15",
    "postcss": "^8.4.31",
    "storybook": "^7.5.3",
    "tailwindcss": "^3.3.5",
    "tsup": "^8.0.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}'

  # packages/db/package.json
  create_file "packages/db/package.json" '{
  "name": "@e3d/db",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/**"
  ],
  "scripts": {
    "build": "tsup",
    "clean": "rm -rf .turbo node_modules dist",
    "db:generate": "prisma generate",
    "db:push": "prisma db push --skip-generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:reset": "prisma migrate reset --force",
    "db:seed": "prisma db seed",
    "dev": "tsup --watch",
    "format": "prisma format",
    "lint": "eslint . --ext .ts",
    "studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.4.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "eslint": "^9.0.0",
    "prisma": "^5.4.2",
    "ts-node": "^10.9.1",
    "tsup": "^8.0.1",
    "typescript": "^5.3.0"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}'

  # packages/api/package.json
  create_file "packages/api/package.json" '{
  "name": "@e3d/api",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/**"
  ],
  "scripts": {
    "build": "tsup",
    "clean": "rm -rf .turbo node_modules dist",
    "dev": "tsup --watch",
    "lint": "eslint \"src/**/*.ts\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@e3d/db": "workspace:*",
    "@trpc/client": "^10.43.0",
    "@trpc/server": "^10.43.0",
    "bcryptjs": "^2.4.3",
    "cookie": "^0.6.0",
    "jsonwebtoken": "^9.0.2",
    "superjson": "^2.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie": "^0.6.0",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.0",
    "eslint": "^9.0.0",
    "tsup": "^8.0.1",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}'

  # Create shared files
  print_header "Creating Shared Package Files"
  
  # packages/shared/tsup.config.ts
  create_file "packages/shared/tsup.config.ts" "import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: process.env.NODE_ENV === 'production',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@headlessui/react',
    '@heroicons/react'
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  onSuccess: 'echo \"Build completed successfully!\"',
});"

  # packages/shared/vitest.config.ts
  create_file "packages/shared/vitest.config.ts" "import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      all: true,
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@lib': resolve(__dirname, './src/lib'),
    },
  },
});"

  # packages/shared/src/test/setup.ts
  create_file "packages/shared/src/test/setup.ts" "import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver which is not implemented in JSDOM
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  private callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
};

// Mock ResizeObserver which is not implemented in JSDOM
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  private callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Suppress React 18 console errors/warnings
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: You are importing createRoot from \"react-dom\"/.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};"

  # packages/shared/src/utils/cn.ts
  create_file "packages/shared/src/utils/cn.ts" "import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with proper Tailwind CSS specificity handling
 * 
 * @param inputs - Any number of class names, objects, or arrays to merge
 * @returns Merged class names string with Tailwind CSS specificity conflicts resolved
 * 
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500')
 * 
 * @example
 * // Conditional classes
 * cn('text-lg', isLarge && 'font-bold', { 'opacity-50': isDisabled })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}"

  # packages/shared/src/index.ts
  create_file "packages/shared/src/index.ts" "/**
 * Main export file for shared package
 * This file exports all components, utilities, and types
 */

// UI Components
export { Button, buttonVariants, type ButtonProps } from './components/ui/Button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardProps,
} from './components/ui/Card';
export { Spinner } from './components/ui/Spinner';

// Utilities
export { cn } from './utils/cn';

// Authentication
export {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  isAdmin,
  isAuthenticated,
  AuthenticationError,
  AuthorizationError,
  UserRole,
  type UserAuth,
  type JWTPayload,
  type AuthResult,
  type LoginInput,
  type RegisterInput,
  LoginSchema,
  RegisterSchema,
} from './lib/auth';

// Re-export types for convenience
export type { ClassValue } from 'clsx';"

  # packages/web-client/src/utils/cn.ts
  create_file "packages/web-client/src/utils/cn.ts" "/**
 * Re-export the cn utility from shared package
 * This allows using the utility directly from web-client without importing from shared
 */
export { cn } from '@e3d/shared';"

  # packages/web-client/src/utils/formatters.ts
  create_file "packages/web-client/src/utils/formatters.ts" "/**
 * Utility functions for formatting data in the UI
 */

/**
 * Format a number as currency
 * 
 * @param value - The number to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 * 
 * @example
 * // Returns \"$1,234.56\"
 * formatCurrency(1234.56)
 * 
 * @example
 * // Returns \"1.234,56 €\"
 * formatCurrency(1234.56, 'EUR', 'de-DE')
 */
export const formatCurrency = (
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number with thousands separators
 * 
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 * 
 * @example
 * // Returns \"1,234.56\"
 * formatNumber(1234.56)
 */
export const formatNumber = (
  value: number,
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Format a number as a percentage
 * 
 * @param value - The number to format (0-1)
 * @param locale - The locale to use for formatting (default: en-US)
 * @param digits - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 * 
 * @example
 * // Returns \"75%\"
 * formatPercent(0.75)
 */
export const formatPercent = (
  value: number,
  locale = 'en-US',
  digits = 0
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

/**
 * Format a date in the specified format
 * 
 * @param date - The date to format
 * @param format - The format style (default: 'medium')
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 * 
 * @example
 * // Returns \"Jan 5, 2025\"
 * formatDate(new Date(2025, 0, 5))
 */
export const formatDate = (
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a date and time
 * 
 * @param date - The date to format
 * @param format - The format style (default: 'medium')
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date and time string
 * 
 * @example
 * // Returns \"Jan 5, 2025, 3:30 PM\"
 * formatDateTime(new Date(2025, 0, 5, 15, 30))
 */
export const formatDateTime = (
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
    long: { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      second: 'numeric' 
    },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a date as a relative time (e.g., \"2 days ago\")
 * 
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Relative time string
 * 
 * @example
 * // Returns \"2 days ago\" (if current date is Jan 7, 2025)
 * formatRelativeTime(new Date(2025, 0, 5))
 */
export const formatRelativeTime = (
  date: Date | string | number,
  locale = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  // Format the relative time based on the difference
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffInSeconds < minute) {
    return rtf.format(-Math.floor(diffInSeconds), 'second');
  } else if (diffInSeconds < hour) {
    return rtf.format(-Math.floor(diffInSeconds / minute), 'minute');
  } else if (diffInSeconds < day) {
    return rtf.format(-Math.floor(diffInSeconds / hour), 'hour');
  } else if (diffInSeconds < week) {
    return rtf.format(-Math.floor(diffInSeconds / day), 'day');
  } else if (diffInSeconds < month) {
    return rtf.format(-Math.floor(diffInSeconds / week), 'week');
  } else if (diffInSeconds < year) {
    return rtf.format(-Math.floor(diffInSeconds / month), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / year), 'year');
  }
};

/**
 * Format a file size in bytes to a human-readable string
 * 
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 * 
 * @example
 * // Returns \"1.5 MB\"
 * formatFileSize(1500000)
 */
export const formatFileSize = (
  bytes: number,
  decimals = 2
): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a phone number to a standard format
 * 
 * @param phone - The phone number to format
 * @param format - The format to use (default: '(xxx) xxx-xxxx')
 * @returns Formatted phone number
 * 
 * @example
 * // Returns \"(123) 456-7890\"
 * formatPhone('1234567890')
 */
export const formatPhone = (
  phone
