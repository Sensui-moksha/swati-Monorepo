# Disaster Recovery Runbook

## RPO and RTO Objectives
- **RPO (Recovery Point Objective)**: 24 Hours (Nightly Backups).
- **RTO (Recovery Time Objective)**: 4 Hours to restore full operational capability in a secondary region.

## Scenario: Total Database Loss (MongoDB)
1. **Locate Latest Backup**: Go to the S3 bucket `s3://swathi-backups/mongodb/` and find the latest `.archive.gz` file.
2. **Download Backup**: `aws s3 cp s3://swathi-backups/mongodb/swathi_platform_20260730.archive.gz .`
3. **Restore**:
   ```bash
   mongorestore --gzip --archive=swathi_platform_20260730.archive.gz --uri="mongodb+srv://new-cluster-uri"
   ```
4. **Validation**: Log into the Admin UI and verify that publications, users, and metadata are visible.

## Scenario: Storage EFS/NFS Volume Corruption
1. The raw PDFs are the most critical asset. They are synced nightly to AWS S3 Glacier.
2. Mount a fresh EFS/NFS volume to the worker nodes.
3. Initiate the S3 sync back to the local volume:
   ```bash
   aws s3 sync s3://swathi-pdf-archive-glacier /var/lib/swathi/storage/pdfs
   ```
4. Run `scripts/verify-storage.sh` to ensure no files were missed during the sync.
