#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/var/backups/swathi"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/swathi"}
REDIS_HOST=${REDIS_HOST:-"localhost"}
ES_HOST=${ELASTICSEARCH_URL:-"http://localhost:9200"}
S3_BUCKET=${S3_BACKUP_BUCKET:-"s3://swathi-backups"}

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting Backup Process..."

# 1. MongoDB Backup
echo "[$(date)] Dumping MongoDB..."
mongodump --uri="$MONGODB_URI" --gzip --archive="$BACKUP_DIR/mongo_$DATE.archive"

# 2. Redis Backup
# Note: Redis SAVE is blocking. For large DBs, rely on BGSAVE and appendonly configs.
echo "[$(date)] Taking Redis Snapshot..."
redis-cli -h "$REDIS_HOST" SAVE > /dev/null
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb" || echo "Warning: Could not copy Redis dump directly"

# 3. Elasticsearch Snapshot
# Assumes an S3 repository named "s3_backup" is already configured in ES.
echo "[$(date)] Triggering Elasticsearch Snapshot..."
curl -X PUT "$ES_HOST/_snapshot/s3_backup/snapshot_$DATE?wait_for_completion=true"

# 4. Upload to Cloud Storage
if command -v aws >/dev/null 2>&1; then
    echo "[$(date)] Uploading backups to $S3_BUCKET..."
    aws s3 cp "$BACKUP_DIR/mongo_$DATE.archive" "$S3_BUCKET/mongo/"
    aws s3 cp "$BACKUP_DIR/redis_$DATE.rdb" "$S3_BUCKET/redis/" || true
else
    echo "AWS CLI not found. Skipping S3 upload."
fi

# Cleanup old local backups (keep last 7 days)
echo "[$(date)] Cleaning up local backups older than 7 days..."
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "[$(date)] Backup Completed Successfully!"
