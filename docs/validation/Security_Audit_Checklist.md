# Security Audit & Penetration Testing Checklist

## 1. OWASP Top 10 Validation
- [ ] **A01:2021-Broken Access Control**: Ensure Users cannot access `/api/admin/*` routes.
- [ ] **A02:2021-Cryptographic Failures**: Passwords are hashed using Argon2/Bcrypt; sensitive data in Transit is strictly TLS 1.3.
- [ ] **A03:2021-Injection**: All MongoDB queries use Mongoose schemas to prevent NoSQL injection.
- [ ] **A04:2021-Insecure Design**: "Default Deny" implemented. Routes require auth unless explicitly whitelisted.
- [ ] **A05:2021-Security Misconfiguration**: Express `Helmet` is active. `X-Powered-By` header is stripped.
- [ ] **A06:2021-Vulnerable and Outdated Components**: `npm audit` run with 0 critical vulnerabilities.
- [ ] **A07:2021-Identification and Authentication Failures**: Brute force protection (Rate Limiting) applied to `/api/auth/login`.
- [ ] **A08:2021-Software and Data Integrity Failures**: PDF uploads are validated via `magic bytes`, not just extensions.
- [ ] **A09:2021-Security Logging and Monitoring Failures**: All failed logins and admin actions are written to `AuditLogs`.
- [ ] **A10:2021-Server-Side Request Forgery (SSRF)**: Any outgoing webhook/AI API calls strictly sanitize hostnames.

## 2. JWT & Session Security
- [ ] JWT Secrets are securely injected via `.env` (min 256-bit).
- [ ] Tokens have tight expiration (e.g., 15 minutes for Access Token, 7 days for Refresh Token in HttpOnly Secure Cookie).
- [ ] Concurrent login controls correctly invalidate old JWTs by matching session IDs stored in Redis.

## 3. API Penetration Validation
- [ ] Run `ZAP (Zed Attack Proxy)` automated scan against staging.
- [ ] Verify CORS policy rejects arbitrary cross-origin requests.
- [ ] Test rate limiters trigger HTTP 429 after 100 requests/minute.
