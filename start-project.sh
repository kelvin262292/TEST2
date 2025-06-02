#!/bin/bash
# start-project.sh
# Sets up and starts the 3D E-commerce Platform for local development and testing.
# Author: Dennis Smith
# Usage: ./start-project.sh [--skip-deps] [--skip-db-setup]

set -e # Exit on error

# --- Configuration ---
PROJECT_NAME="ecommerce-3d"

# --- Helper Functions ---
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
  echo -e "\n${BLUE}======================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}======================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

print_warning() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# Parse arguments
SKIP_DEPS=false
SKIP_DB_SETUP=false

for arg in "$@"; do
  case $arg in
    --skip-deps)
      SKIP_DEPS=true
      shift
      ;;
    --skip-db-setup)
      SKIP_DB_SETUP=true
      shift
      ;;
    *)
      print_warning "Unknown option: $arg"
      ;;
  esac
done

# --- Main Script ---
print_header "Starting 3D E-commerce Platform"

# 1. Check Prerequisites
print_header "1. Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  print_success "Node.js found: $NODE_VERSION"
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
  if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
    print_warning "Node.js version should be >= 20. Current version: $NODE_VERSION. Please upgrade."
  fi
else
  print_error "Node.js not found. Please install Node.js >= 20."
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version)
  print_success "pnpm found: $PNPM_VERSION"
  PNPM_MAJOR_VERSION=$(echo $PNPM_VERSION | cut -d. -f1)
  if [ "$PNPM_MAJOR_VERSION" -lt 9 ]; then
    print_warning "pnpm version should be >= 9. Current version: $PNPM_VERSION. Please upgrade."
  fi
else
  print_error "pnpm not found. Please install pnpm >= 9 (e.g., corepack enable && corepack prepare pnpm@9 --activate)."
fi

# Check Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
  DOCKER_COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | sed 's/,//')
  print_success "Docker found: $DOCKER_VERSION"
  print_success "Docker Compose found: $DOCKER_COMPOSE_VERSION"
else
  print_error "Docker or Docker Compose not found. Please install them."
fi

# 2. Environment File Setup
print_header "2. Setting Up Environment File"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    print_warning ".env file not found. Copying from .env.example..."
    cp .env.example .env
    print_success "Created .env file. Please review and update it with your actual secrets if needed."
  else
    print_error ".env.example not found. Cannot create .env file. Please ensure .env.example exists."
  fi
else
  print_success ".env file already exists."
fi

# 3. Install Dependencies
if [ "$SKIP_DEPS" = false ]; then
  print_header "3. Installing Dependencies"
  if pnpm install; then
    print_success "Dependencies installed successfully."
  else
    print_error "Failed to install dependencies. Please check pnpm logs."
  fi
else
  print_warning "Skipping dependency installation as requested."
fi

# 4. Start Docker Services (Database & Cache)
if [ "$SKIP_DB_SETUP" = false ]; then
  print_header "4. Starting Database & Cache Services (Docker)"
  print_warning "Starting Docker containers for PostgreSQL and Redis in the background..."
  if docker-compose -f docker/docker-compose.yml up -d db redis; then
    print_success "Docker services (db, redis) started."
  else
    print_error "Failed to start Docker services. Check Docker logs."
  fi

  print_warning "Waiting for database and Redis to be ready (up to 30 seconds)..."
  MAX_RETRIES=6
  RETRY_INTERVAL=5
  DB_READY=false
  REDIS_READY=false

  for i in $(seq 1 $MAX_RETRIES); do
    if docker-compose -f docker/docker-compose.yml exec -T db pg_isready -U postgres -q; then
      DB_READY=true
      print_success "PostgreSQL is ready."
    else
      print_warning "PostgreSQL not ready yet (attempt $i/$MAX_RETRIES)..."
    fi

    if docker-compose -f docker/docker-compose.yml exec -T redis redis-cli ping | grep -q PONG; then
      REDIS_READY=true
      print_success "Redis is ready."
    else
      print_warning "Redis not ready yet (attempt $i/$MAX_RETRIES)..."
    fi
    
    if [ "$DB_READY" = true ] && [ "$REDIS_READY" = true ]; then
      break
    fi
    
    if [ $i -lt $MAX_RETRIES ]; then
      sleep $RETRY_INTERVAL
    fi
  done

  if [ "$DB_READY" = false ] || [ "$REDIS_READY" = false ]; then
    print_error "Database or Redis did not become ready in time. Please check Docker container logs."
  fi

  # 5. Database Setup (Prisma Migrations & Seed)
  print_header "5. Setting Up Database"
  print_warning "Generating Prisma client..."
  if pnpm db:generate; then
    print_success "Prisma client generated."
  else
    print_error "Failed to generate Prisma client."
  fi

  print_warning "Running database migrations..."
  if pnpm db:migrate; then
    print_success "Database migrations applied."
  else
    print_error "Failed to apply database migrations. Check Prisma logs."
  fi

  print_warning "Seeding database with sample data..."
  if pnpm db:seed; then
    print_success "Database seeded successfully."
  else
    print_warning "Failed to seed database. This might be okay if it was already seeded or if there are no seed data."
  fi
else
  print_warning "Skipping database setup (Docker services, migrations, seed) as requested."
fi

# 6. Start Development Servers
print_header "6. Starting Development Servers"
print_warning "Starting all applications (Web Client, Admin Dashboard, API)..."
print_warning "This command will run in the foreground. Press Ctrl+C to stop."
echo -e "${YELLOW}Web Client will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}Admin Dashboard will be available at: http://localhost:3001${NC}"
echo -e "${YELLOW}API (via tRPC) will be available through the client applications.${NC}"
echo ""

# Start all dev servers
if pnpm dev; then
  print_success "Development servers started."
else
  print_error "Failed to start development servers. Check Turborepo logs."
fi

print_header "Project Startup Complete (or attempted)"
print_warning "If servers are running, you can now access the applications at the URLs above."
print_warning "If you encounter issues, please check the console output for errors."
exit 0
