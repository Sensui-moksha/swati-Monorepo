#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <DATE_STRING> (e.g. 2026-07-30_10-00-00)"
  exit 1
fi

DATE=$1
BACKUP_DIR="/var/backups/swathi"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/swathi"}
ES_HOST=${ELASTICSEARCH_URL:-"http://localhost:9200"}
S3_BUCKET=${S3_BACKUP_BUCKET:-"s3://swathi-backups"}

echo "[$(date)] Starting Disaster Recovery Restore..."

# 1. Download if not local
if [ ! -f "$BACKUP_DIR/mongo_$DATE.archive" ] && command -v aws >/dev/null 2>&1; then
    echo "[$(date)] Downloading backup from S3..."
    aws s3 cp "$S3_BUCKET/mongo/mongo_$DATE.archive" "$BACKUP_DIR/"
fi

# 2. Restore MongoDB
echo "[$(date)] Restoring MongoDB..."
mongorestore --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/mongo_$DATE.archive" --drop

# 3. Restore Elasticsearch
echo "[$(date)] Triggering Elasticsearch Restore..."
curl -X POST "$ES_HOST/_snapshot/s3_backup/snapshot_$DATE/_restore?wait_for_completion=true"

# 4. Cache Rebuild
echo "[$(date)] Note: Cache (Redis) is designed to rebuild organically. No Redis restore required."

echo "[$(date)] Restore Process Completed."
