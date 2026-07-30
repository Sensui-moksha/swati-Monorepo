# User Acceptance Testing (UAT)

## 1. Authentication & Registration Workflow
| Test ID | Description | Pre-conditions | Action | Expected Result | Status |
|---|---|---|---|---|---|
| UAT-AUTH-01 | User Registration | No active session | User fills out registration form, submits | Account created, welcome email dispatched, JWT returned | [ ] |
| UAT-AUTH-02 | User Login | Existing account | User enters credentials | JWT token issued, redirected to Dashboard | [ ] |
| UAT-AUTH-03 | Concurrent Login Limit | User logged in on Device A | User logs in on Device B | Device B logs in, Device A is instantly invalidated (401) | [ ] |

## 2. Reader Workflow
| Test ID | Description | Pre-conditions | Action | Expected Result | Status |
|---|---|---|---|---|---|
| UAT-READ-01 | Open Publication | Logged in | Click "Read" on a PDF asset | Viewer opens, page 1 rendered | [ ] |
| UAT-READ-02 | Streaming Chunking | Large PDF (>100MB) | Scroll rapidly to page 50 | Pages 1-10 are purged from memory, chunk 5 is requested | [ ] |
| UAT-READ-03 | Add Bookmark | Viewing page 5 | Click Bookmark icon | Bookmark saved in DB, visual indicator updates | [ ] |

## 3. Subscription & Payments Workflow
| Test ID | Description | Pre-conditions | Action | Expected Result | Status |
|---|---|---|---|---|---|
| UAT-PAY-01 | Checkout Process | Basic Tier selected | Enter test card details (Stripe) | Payment succeeds, `Basic` role applied instantly | [ ] |
| UAT-PAY-02 | Paywall Enforcement | Free Tier user | Attempt to read Premium Publication | Access Denied overlay, redirect to pricing | [ ] |
| UAT-PAY-03 | Subscription Cancellation | Active subscriber | Click "Cancel Subscription" | Subscription marked as canceled at billing period end | [ ] |

## 4. Admin Publishing Workflow
| Test ID | Description | Pre-conditions | Action | Expected Result | Status |
|---|---|---|---|---|---|
| UAT-ADM-01 | Upload Publication | Admin logged in | Upload PDF via DAM dashboard | Upload succeeds, background NLP/OCR tasks triggered | [ ] |
| UAT-ADM-02 | Review OCR Extractions | NLP processing complete | Open Taxonomy Dashboard | TF-IDF keywords and TextRank summaries match text | [ ] |
| UAT-ADM-03 | View BI Analytics | Dashboard | Open Executive BI | Graphs render active streams and revenue | [ ] |
