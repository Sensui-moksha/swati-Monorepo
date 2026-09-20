# Automated End-to-End Test Suite

This directory documents and runs the automated end-to-end user journeys for the Swathi Publications Digital Platform.

### Automated Test Journeys
- **Journey 1: Authentication & Zero-Trust Device Lifecycle**: `backend/src/tests/e2e/auth-journey.test.ts`
  - Max 3 active devices limit, auto-deauthorization of oldest, remote device revocation.
- **Journey 2: Commerce, Digital Subscriptions & Entitlements**: `backend/src/tests/e2e/commerce-journey.test.ts`
  - Public vs. premium content gating, plan lookup, subscription entitlement validation, order-level book access.
- **Journey 3: Enterprise DRM, Ephemeral Tokens & Dynamic Watermarks**: `backend/src/tests/e2e/drm-reader-journey.test.ts`
  - 60s ephemeral HMAC-SHA256 tokens, timingSafeEqual constant-time verification, anti-relay IP validation, signature tampering rejection, dynamic watermark embedding.
- **Journey 4: 8-Stage Editorial State Machine & Version Control**: `backend/src/tests/e2e/editorial-workflow-journey.test.ts`
  - Stage transitions, role authorization, field-level JSON delta diffs (`added`, `modified`, `deleted`), atomic rollback.
- **Journey 5: Human-in-the-Loop OCR Review Workbench**: `backend/src/tests/e2e/ocr-workbench-journey.test.ts`
  - OCR tokenization, dictionary spell checking, token-level human correction and text reconstruction, bulk approval.

### Running the Test Suite
```bash
# Run all E2E journeys
npm test --prefix backend -- e2e

# Run with test coverage
npm run test:coverage --prefix backend -- e2e
```
