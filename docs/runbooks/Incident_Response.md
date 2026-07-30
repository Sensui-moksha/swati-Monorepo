# Incident Response Runbook

## Severity Levels
- **SEV-1 (Critical)**: Total platform outage, unable to stream PDFs, or widespread data corruption. 
- **SEV-2 (High)**: Major feature degraded (e.g., Search is down), but reading works.
- **SEV-3 (Medium)**: Non-critical systems degraded (e.g., Nightly analytics worker failed).

## Immediate Actions for SEV-1 (Platform Down)
1. **Acknowledge PagerDuty Alert**.
2. **Check Grafana Executive Dashboard**: Is traffic spiking? Are errors 5xx or 4xx?
3. **Check Prometheus Alerts**:
   - `HighCPUUsage`: Horizontal pod autoscaler might be failing. Verify Kubernetes/Swarm nodes.
   - `DatabaseConnectionLoss`: Connect to MongoDB Atlas console. Check for primary elections or connection limits.
4. **Isolate the Fault**:
   - If NGINX is returning 502 Bad Gateway: Check the Backend Node instances (`pm2 logs` or `kubectl logs`).
   - If Node is crashing with OOM (Out of Memory): Trigger an immediate rollback to the previous deployment tag.

## Rolling Back a Deployment
```bash
# Example Kubernetes rollback
kubectl rollout undo deployment/swathi-backend
```

## Communication
- Update Statuspage.io within 15 minutes of SEV-1 confirmation.
- Post updates to the internal #war-room Slack channel every 30 minutes.
