#!/bin/bash
# MongoDB Nightly Backup Script
# Should be scheduled via cron (e.g., 0 2 * * *)

set -e

BACKUP_DIR="/var/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="swathi_platform"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup for database: $DB_NAME at $TIMESTAMP"

# Perform mongodump
mongodump --db "$DB_NAME" --archive="$BACKUP_DIR/$DB_NAME_$TIMESTAMP.archive" --gzip

# Upload to S3 (assuming AWS CLI is configured)
# aws s3 cp "$BACKUP_DIR/$DB_NAME_$TIMESTAMP.archive" s3://swathi-backups/mongodb/

# Clean up local backups older than RETENTION_DAYS
find "$BACKUP_DIR" -type f -name "*.archive" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully."
