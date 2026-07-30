# Production Go-Live Checklist

Complete this checklist 24 hours prior to the official launch.

## 1. Environment Configuration
- [ ] `.env.production` is populated and securely injected via secrets manager (AWS Secrets Manager / HashiCorp Vault).
- [ ] `NODE_ENV` is strictly set to `production`.
- [ ] JWT Secrets have been rotated from staging keys.
- [ ] Stripe Webhook secrets match the live Dashboard.

## 2. Infrastructure & Networking
- [ ] SSL Certificates are valid, auto-renewing (Let's Encrypt), and enforce HTTPS termination at the Load Balancer.
- [ ] CDN (Cloudflare) is in proxy mode for the frontend domain and caching is active.
- [ ] Cross-Origin Resource Sharing (CORS) strictly whitelists the production frontend URL.
- [ ] NGINX rate limiting is configured to prevent API abuse.

## 3. Data Tier
- [ ] MongoDB indexes are fully built (`userId`, `publicationId`, compound text indexes for search).
- [ ] Redis `maxmemory-policy` is set to `allkeys-lru` to prevent crashing when cache is full.
- [ ] Automated Backup Scripts are active and the first backup has been successfully restored in a test environment.

## 4. Background Workers (BullMQ)
- [ ] The NLP Worker cluster is scaled independently from the API to prevent high CPU from degrading web performance.
- [ ] Dead Letter Queues (DLQ) have alerts configured in Grafana.

## 5. Observability
- [ ] Prometheus is successfully scraping `/health/metrics`.
- [ ] Grafana dashboards are populated with real-time data.
- [ ] PagerDuty / Slack alerts are configured for SEV-1 and SEV-2 events.
