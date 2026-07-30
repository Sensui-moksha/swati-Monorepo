# Production Deployment Guide

## Overview
This guide provides the necessary steps to deploy the Swathi platform to production using Docker Swarm or a single-node Docker setup for high availability, scaling, and disaster recovery.

## Prerequisites
1. **Server Configuration**: At least 4 CPU cores, 16GB RAM for the main node, and a 30TB attached network storage (NFS/EFS/S3).
2. **Domain**: Ensure `app.swathipublications.com` is mapped to the server's public IP.
3. **SSL/TLS**: Obtain Let's Encrypt certificates using Certbot.

## Setup Steps

### 1. Environment Configuration
Copy `.env.production.example` to `.env.production` and update the passwords and secrets.
```bash
cp .env.production.example .env.production
nano .env.production
```

### 2. Prepare Storage & Directories
```bash
mkdir -p /var/data/swathi/documents
mkdir -p /var/log/swathi
mkdir -p /var/backups/swathi
```

### 3. Deploy Stack
Bring up the production cluster:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
This will launch:
- 1 NGINX Edge Proxy
- 3 Backend API Replicas
- 2 Worker Replicas
- 1 Frontend Static container
- MongoDB, Redis, Elasticsearch, Prometheus, Grafana

### 4. Backup Automation
Add the backup script to crontab to run daily at 2:00 AM:
```bash
crontab -e
# Add the following line:
0 2 * * * /path/to/swathi/scripts/backup.sh >> /var/log/swathi/backup.log 2>&1
```

## Scaling Operations
To scale up the backend API under heavy load:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=5
```

## Monitoring
Access the Grafana dashboard at `http://<your-server-ip>:3000` (ensure this port is shielded or proxied securely if exposed externally) to view Prometheus metrics for node health, HTTP request latency, and queue processing speed.
