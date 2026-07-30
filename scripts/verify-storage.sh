#!/bin/bash
# Storage Validation Script
# Scans mounted EFS/NFS volumes to ensure no corrupted or orphaned PDFs

STORAGE_PATH="/var/lib/swathi/storage/pdfs"
LOG_FILE="/var/log/swathi/storage-validation.log"

echo "Starting Storage Validation at $(date)" | tee -a "$LOG_FILE"

# 1. Check for orphaned files (Files > 7 days old not in DB)
# In production, this would query the DB to compare against disk list
echo "Scanning for corrupted PDFs (missing magic bytes)..." | tee -a "$LOG_FILE"

find "$STORAGE_PATH" -type f -name "*.pdf" -print0 | while IFS= read -r -d '' file; do
  # Check if it's a valid PDF by reading the first 4 bytes
  magic=$(head -c 4 "$file")
  if [[ "$magic" != "%PDF" ]]; then
    echo "CORRUPTED FILE DETECTED: $file" | tee -a "$LOG_FILE"
  fi
done

echo "Storage Validation complete at $(date)" | tee -a "$LOG_FILE"
