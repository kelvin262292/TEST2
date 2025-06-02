#!/bin/bash
# create-zip-backup.sh
# Creates a ZIP archive of the 3D E-commerce Platform project, excluding unnecessary files.
# Author: Dennis Smith
# Usage: ./create-zip-backup.sh [output_directory]

set -e # Exit on error

# --- Configuration ---
PROJECT_NAME="ecommerce-3d"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
DEFAULT_BACKUP_FILENAME="${PROJECT_NAME}-backup-${TIMESTAMP}.zip"

# Determine the project root directory (where this script is located)
PROJECT_ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Output directory for the backup
# Defaults to the parent directory of the project root
OUTPUT_DIR_PARAM="$1"
if [ -z "$OUTPUT_DIR_PARAM" ]; then
  BACKUP_OUTPUT_DIR="$(dirname "$PROJECT_ROOT_DIR")" # Parent directory
else
  BACKUP_OUTPUT_DIR="$OUTPUT_DIR_PARAM"
  mkdir -p "$BACKUP_OUTPUT_DIR" # Create if it doesn't exist
fi
BACKUP_FILE_PATH="${BACKUP_OUTPUT_DIR}/${DEFAULT_BACKUP_FILENAME}"

# Exclude patterns for the zip command
# Note: Paths are relative to the PROJECT_ROOT_DIR
EXCLUDE_PATTERNS=(
  "*.DS_Store"
  "*.log"
  "*.swp"
  "*~"
  "*.tmp"
  ".env"
  ".git/*"
  "node_modules/*"
  "packages/*/node_modules/*" # Catch any nested node_modules, though pnpm avoids this
  ".pnpm-store/*"
  "packages/*/.next/*"
  "packages/*/dist/*"
  "packages/*/build/*"
  "packages/*/coverage/*"
  "test-report-*.txt"
  "${DEFAULT_BACKUP_FILENAME}" # Exclude the backup file itself if created in project root
  "$(basename "$0")" # Exclude this script itself if it's in the root
)

# Convert exclude patterns array to zip command options
EXCLUDE_ARGS=()
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS+=("-x" "$pattern")
done

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
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

# --- Main Script ---
print_header "Creating Project Backup Archive"

# Check if zip command is available
if ! command -v zip &> /dev/null; then
  print_error "The 'zip' command is not found. Please install it to continue."
  exit 1
fi

print_info "Project Root: ${PROJECT_ROOT_DIR}"
print_info "Backup File: ${BACKUP_FILE_PATH}"
print_info "Excluding patterns:"
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  echo -e "  - ${pattern}"
done
echo ""

# Navigate to the project root directory to ensure relative paths in zip
cd "$PROJECT_ROOT_DIR"

print_info "Creating ZIP archive... This may take a few moments."

# Create the zip archive
# The `.` at the end means "zip the current directory"
if zip -r -q "${BACKUP_FILE_PATH}" . "${EXCLUDE_ARGS[@]}"; then
  print_success "Project backup created successfully!"
  print_success "Archive saved to: ${BACKUP_FILE_PATH}"
  
  # Display archive size
  ARCHIVE_SIZE=$(du -h "${BACKUP_FILE_PATH}" | cut -f1)
  print_info "Archive size: ${ARCHIVE_SIZE}"
else
  print_error "Failed to create project backup."
  # zip command usually prints errors to stderr, so no need to capture output explicitly
  exit 1
fi

# Navigate back to the original directory if needed (though script exits here)
# cd - > /dev/null

print_header "Backup Process Complete"
exit 0
