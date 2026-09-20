# Testing Standards & Performance Budgets

## 1. Performance Budgets

| Metric | Target / SLA | Enforcement Mechanism | Failure Action |
| :--- | :--- | :--- | :--- |
| **API Latency (p95)** | < 120ms | OpenTelemetry APM & Grafana Alert | Automated alert on slack/pagerduty |
| **Streaming First Byte (TTFB)** | < 80ms (SSD cache), < 250ms (S3) | RangeRequestService & PDFStreamingService | Cache warming auto-trigger |
| **Frontend SSR Load Time** | < 800ms | Lighthouse CI & TanStack Start SSR | Block PR build in GitHub Actions |
| **Largest Contentful Paint (LCP)**| < 1.8s | Chrome DevTools CWV Audit | High priority performance bug |
| **Database Query Execution** | < 25ms | MongoDB slow query profiler (>50ms logged) | Compound index requirement |
| **Reader Page Flip Latency** | < 16ms (60 FPS) | Virtualized Canvas Viewport Buffer | Memory cache adjustment |

---

## 2. Testing Standards

### 2.1 Unit Tests
- Co-located in `tests/` or `src/**/*.test.ts`.
- Mock external network calls and I/O (S3, Stripe/Razorpay, Redis).
- Fast execution (< 15 seconds total test suite run).

### 2.2 Integration Tests
- Verify API contracts against test MongoDB instance.
- Test dual-mounting (`/api/*` and `/api/v1/*`) compatibility.
- Test authentication flows, JWT refresh rotation, and RBAC authorization guards.

### 2.3 End-to-End Browser Tests
- Automated with Playwright (`tests/e2e/`).
- Critical reader user flows: Sign in → Open Magazine → Flip Page → Add Bookmark → Check Offline PWA cache.
