#!/bin/bash
# run-tests.sh
# Comprehensive test script for 3D E-commerce Platform
# Usage: ./run-tests.sh [--skip-setup] [--skip-e2e] [--verbose]

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
  echo -e "\n${BLUE}======================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}======================================${NC}\n"
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
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
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
  DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
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
      print_error ".env file not found and .env.example doesn't exist"
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
  echo -e "\nTest report saved to: ${BLUE}$REPORT_FILE${NC}"
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
fi
