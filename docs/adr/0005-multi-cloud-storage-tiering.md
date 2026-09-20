# ADR 0005: Multi-Cloud Storage Tiering and Automatic Failover

## Status
Accepted

## Context
Digital publication archives encompass hundreds of gigabytes of high-resolution historical scans alongside active, hot weekly editions. Hosting all files on high-cost primary object storage or single local SSD volumes creates either excessive cloud egress costs or storage exhaustion. Single-provider dependencies also risk outages.

## Decision
1. **Tiered Storage**:
   - Hot Layer (Current issue & active reading): Local SSD fast-cache / Cloudflare R2 (zero egress fees).
   - Warm Layer (Recent 12-month back-catalog): Amazon S3 Standard / GCS.
   - Cold Layer (Decades of historical archives): S3 Glacier / GCS Coldline.
2. **Abstract Provider Interface (`StorageProvider`)**:
   Standardized operations (`streamFile`, `uploadFile`, `getFile`, `deleteFile`, `checksum`) implemented across Local, S3, R2, Azure, GCS, and MinIO.
3. **Automatic Failover**: If primary read fails or returns 503, the storage tier transparently queries the secondary replica before failing.

## Consequences
- Optimized infrastructure cost structure with zero egress on frequent reads.
- High availability resilient to individual cloud provider outages.
