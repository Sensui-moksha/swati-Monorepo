# Backend API Routes Reference

This document summarizes the API endpoints exposed by the backend in the repository root. It is derived from the route modules under backend/src/routes and the router mounting in backend/src/routes/index.ts.

## Base URL and entry points

- Primary API prefix: `/api`
- Health check: `/health`
- API root info: `/api/`
- Swagger documentation: the UI is mounted from the Swagger config when enabled

## Module summary

| Module | Prefix | Endpoint count | Notes |
| --- | --- | ---: | --- |
| Access | /api/v1/access | 2 | Access checks and assertions |
| Admin | /api/v1/admin | 13 | Admin user and system management |
| Analytics | /api/analytics | 6 | Analytics reporting |
| Articles | /api/articles | 24 | Article CRUD and workflow |
| Auth | /api/auth | 24 | Authentication and account management |
| Bookmarks | /api/bookmarks | 6 | User bookmark management |
| Comments | /api/comments | 6 | Comment moderation and pinning |
| Coupons | /api/v1/coupons | 8 | Coupon management |
| Dashboard | /api/dashboard | 7 | Personal dashboard data |
| Drafts | /api/drafts | 6 | Draft content management |
| Editorial | /api/editorial | 5 | Editorial review actions |
| Favorites | /api/favorites | 6 | User favorites management |
| Filesystem Scanner | /api/storage/scanner | 22 | Filesystem scan jobs and inspection |
| Filesystem Watcher | /api/storage/watcher | 7 | Filesystem watcher control and stream |
| Highlights | /api/highlights | 7 | User highlights |
| History | /api/history | 7 | Reading history tracking |
| Invoices | /api/v1/invoices | 6 | Invoice management |
| Media | /api/media | 9 | Media asset management |
| News | /api/news | 12 | News CRUD and workflow |
| Notes | /api/notes | 9 | User notes |
| Notifications | /api/notifications | 7 | User notifications |
| Orders | /api/v1/orders | 7 | Order management |
| Payments | /api/v1/payments | 11 | Payments and transaction handling |
| Plans | /api/v1/plans | 8 | Subscription plan management |
| Profile | /api/profile | 14 | Profile and account settings |
| Progress | /api/progress | 12 | Reading progress and content state |
| Promotions | /api/v1/promotions | 9 | Promotion management |
| Publishing | (defined but not mounted) | 72 | Publishing catalog routes defined in the module |
| Recommendations | /api/recommendations | 1 | Content recommendations |
| Reports | /api/v1/reports | 6 | Commerce and usage reporting |
| Search | /api/search | 2 | Search endpoints |
| Storage | /api/storage | 29 | Storage folder/file operations |
| Storage Sync | /api/storage/sync | 19 | Storage synchronization jobs |
| Subscriptions | /api/v1/subscriptions | 11 | User subscriptions |
| System | /api/v1/system | 7 | System information and settings |
| Tags | /api/tags | 6 | Tag management |
| Webhooks | /api/v1/webhooks | 3 | Webhook ingestion and verification |

## Route inventory

### Access

_Access checks and assertions_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/v1/access/check | Query: page, limit, sort, filter |
| POST | /api/v1/access/assert | Query: page, limit, sort, filter |

### Admin

_Admin user and system management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/admin/dashboard/overview | Query: page, limit, sort, filter |
| GET | /api/v1/admin/stats/users | Query: page, limit, sort, filter |
| GET | /api/v1/admin/users | Query: page, limit, sort, filter |
| GET | /api/v1/admin/users/:id | Path: id; Query: page, limit |
| PUT | /api/v1/admin/users/:id | Path: id; Query: page, limit |
| DELETE | /api/v1/admin/users/:id | Path: id; Query: page, limit |
| POST | /api/v1/admin/users/:id/activate | Path: id; Query: page, limit |
| POST | /api/v1/admin/users/:id/deactivate | Path: id; Query: page, limit |
| POST | /api/v1/admin/users/:id/verify-email | Path: id; Query: page, limit |
| GET | /api/v1/admin/sessions/active | Query: page, limit, sort, filter |
| GET | /api/v1/admin/users/:id/sessions | Path: id; Query: page, limit |
| GET | /api/v1/admin/media/stats | Query: page, limit, sort, filter |
| GET | /api/v1/admin/media/usage | Query: page, limit, sort, filter |

### Analytics

_Analytics reporting_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/analytics/overview | Query: page, limit, sort, filter |
| GET | /api/analytics/users | Query: page, limit, sort, filter |
| GET | /api/analytics/reading | Query: page, limit, sort, filter |
| GET | /api/analytics/content | Query: page, limit, sort, filter |
| GET | /api/analytics/commerce | Query: page, limit, sort, filter |
| GET | /api/analytics/export | Query: page, limit, sort, filter |

### Articles

_Article CRUD and workflow_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/articles/latest | Query: page, limit, sort, filter |
| GET | /api/articles/featured | Query: page, limit, sort, filter |
| GET | /api/articles/editors-picks | Query: page, limit, sort, filter |
| GET | /api/articles/trending | Query: page, limit, sort, filter |
| GET | /api/articles/search | Query: q, page, limit |
| GET | /api/articles/related/:id | Path: id; Query: page, limit |
| GET | /api/articles/slug/:slug | Path: slug; Query: page, limit |
| GET | /api/articles/:id/versions | Path: id; Query: page, limit |
| GET | /api/articles | Query: page, limit, sort, filter |
| GET | /api/articles/:id | Path: id; Query: page, limit |
| POST | /api/articles | Query: page, limit, sort, filter |
| PUT | /api/articles/:id | Path: id; Query: page, limit |
| DELETE | /api/articles/:id | Path: id; Query: page, limit |
| POST | /api/articles/:id/restore | Path: id; Query: page, limit |
| POST | /api/articles/:id/publish | Path: id; Query: page, limit |
| POST | /api/articles/:id/unpublish | Path: id; Query: page, limit |
| POST | /api/articles/:id/schedule | Path: id; Query: page, limit |
| POST | /api/articles/:id/archive | Path: id; Query: page, limit |
| POST | /api/articles/:id/duplicate | Path: id; Query: page, limit |
| POST | /api/articles/:id/preview | Path: id; Query: page, limit |
| POST | /api/articles/:id/submit | Path: id; Query: page, limit |
| POST | /api/articles/:id/versions | Path: id; Query: page, limit |
| POST | /api/articles/:id/versions/compare | Path: id; Query: page, limit |
| POST | /api/articles/:id/versions/:version/restore | Path: id, version; Query: page, limit |

### Auth

_Authentication and account management_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/auth/register | Query: page, limit, sort, filter |
| POST | /api/auth/login | Query: page, limit, sort, filter |
| POST | /api/auth/refresh | Query: page, limit, sort, filter |
| GET | /api/auth/verify-email | Query: page, limit, sort, filter |
| POST | /api/auth/resend-verification | Query: page, limit, sort, filter |
| POST | /api/auth/forgot-password | Query: page, limit, sort, filter |
| POST | /api/auth/reset-password | Query: page, limit, sort, filter |
| POST | /api/auth/send-password-reset-otp | Query: page, limit, sort, filter |
| POST | /api/auth/verify-password-reset-otp | Query: page, limit, sort, filter |
| POST | /api/auth/reset-password-with-otp | Query: page, limit, sort, filter |
| POST | /api/auth/logout | Query: page, limit, sort, filter |
| POST | /api/auth/change-password | Query: page, limit, sort, filter |
| POST | /api/auth/send-email-verification-otp | Query: page, limit, sort, filter |
| POST | /api/auth/verify-email-otp | Query: page, limit, sort, filter |
| POST | /api/auth/enable-2fa | Query: page, limit, sort, filter |
| POST | /api/auth/verify-2fa | Query: page, limit, sort, filter |
| POST | /api/auth/disable-2fa | Query: page, limit, sort, filter |
| POST | /api/auth/regenerate-backup-codes | Query: page, limit, sort, filter |
| GET | /api/auth/2fa-status | Query: page, limit, sort, filter |
| GET | /api/auth/sessions | Query: page, limit, sort, filter |
| DELETE | /api/auth/sessions/:sessionId | Path: sessionId; Query: page, limit |
| DELETE | /api/auth/sessions | Query: page, limit, sort, filter |
| DELETE | /api/auth/sessions/others | Query: page, limit, sort, filter |
| GET | /api/auth/me | Query: page, limit, sort, filter |

### Bookmarks

_User bookmark management_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/bookmarks | Query: page, limit, sort, filter |
| GET | /api/bookmarks | Query: page, limit, sort, filter |
| GET | /api/bookmarks/check/:resourceId | Path: resourceId; Query: page, limit |
| GET | /api/bookmarks/count | Query: page, limit, sort, filter |
| PUT | /api/bookmarks/:resourceId | Path: resourceId; Query: page, limit |
| DELETE | /api/bookmarks/:resourceId | Path: resourceId; Query: page, limit |

### Comments

_Comment moderation and pinning_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/comments | Query: page, limit, sort, filter |
| GET | /api/comments/pending | Query: page, limit, sort, filter |
| GET | /api/comments/article/:articleId | Path: articleId; Query: page, limit |
| PATCH | /api/comments/:id/moderate | Path: id; Query: page, limit |
| POST | /api/comments/:id/pin | Path: id; Query: page, limit |
| POST | /api/comments/:id/unpin | Path: id; Query: page, limit |

### Coupons

_Coupon management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/coupons | Query: page, limit, sort, filter |
| GET | /api/v1/coupons/code/:code | Path: code; Query: page, limit |
| GET | /api/v1/coupons/:id | Path: id; Query: page, limit |
| POST | /api/v1/coupons | Query: page, limit, sort, filter |
| PUT | /api/v1/coupons/:id | Path: id; Query: page, limit |
| DELETE | /api/v1/coupons/:id | Path: id; Query: page, limit |
| POST | /api/v1/coupons/:id/archive | Path: id; Query: page, limit |
| POST | /api/v1/coupons/:id/restore | Path: id; Query: page, limit |

### Dashboard

_Personal dashboard data_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/dashboard | Query: page, limit, sort, filter |
| GET | /api/dashboard/stats/reading | Query: page, limit, sort, filter |
| GET | /api/dashboard/activity | Query: page, limit, sort, filter |
| GET | /api/dashboard/goals/progress | Query: page, limit, sort, filter |
| GET | /api/dashboard/heatmap | Query: page, limit, sort, filter |
| GET | /api/dashboard/recommendations | Query: page, limit, sort, filter |
| GET | /api/dashboard/stats/detailed | Query: page, limit, sort, filter |

### Drafts

_Draft content management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/drafts | Query: page, limit, sort, filter |
| POST | /api/drafts | Query: page, limit, sort, filter |
| PUT | /api/drafts/:id | Path: id; Query: page, limit |
| POST | /api/drafts/:id/autosave | Path: id; Query: page, limit |
| POST | /api/drafts/:id/submit | Path: id; Query: page, limit |
| POST | /api/drafts/:id/review | Path: id; Query: page, limit |

### Editorial

_Editorial review actions_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/editorial/articles/:id/approve | Path: id; Query: page, limit |
| POST | /api/editorial/articles/:id/reject | Path: id; Query: page, limit |
| POST | /api/editorial/articles/:id/request-changes | Path: id; Query: page, limit |
| POST | /api/editorial/articles/:id/versions/:version/restore | Path: id, version; Query: page, limit |
| POST | /api/editorial/articles/:id/versions/compare | Path: id; Query: page, limit |

### Favorites

_User favorites management_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/favorites | Query: page, limit, sort, filter |
| GET | /api/favorites | Query: page, limit, sort, filter |
| GET | /api/favorites/check/:resourceId | Path: resourceId; Query: page, limit |
| GET | /api/favorites/count | Query: page, limit, sort, filter |
| POST | /api/favorites/toggle/:resourceId | Path: resourceId; Query: page, limit |
| DELETE | /api/favorites/:resourceId | Path: resourceId; Query: page, limit |

### Filesystem Scanner

_Filesystem scan jobs and inspection_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/storage/scanner/jobs | Query: page, limit, sort, filter |
| GET | /api/storage/scanner/jobs | Query: page, limit, sort, filter |
| GET | /api/storage/scanner/jobs/:id | Path: id; Query: page, limit |
| POST | /api/storage/scanner/jobs/:id/cancel | Path: id; Query: page, limit |
| POST | /api/storage/scanner/scan/full | Query: page, limit, sort, filter |
| POST | /api/storage/scanner/scan/incremental | Query: page, limit, sort, filter |
| POST | /api/storage/scanner/scan/targeted | Query: page, limit, sort, filter |
| POST | /api/storage/scanner/scan/deep | Query: page, limit, sort, filter |
| POST | /api/storage/scanner/schedules | Query: page, limit, sort, filter |
| GET | /api/storage/scanner/schedules | Query: page, limit, sort, filter |
| GET | /api/storage/scanner/schedules/:id | Path: id; Query: page, limit |
| PUT | /api/storage/scanner/schedules/:id | Path: id; Query: page, limit |
| DELETE | /api/storage/scanner/schedules/:id | Path: id; Query: page, limit |
| POST | /api/storage/scanner/schedules/:id/enable | Path: id; Query: page, limit |
| POST | /api/storage/scanner/schedules/:id/disable | Path: id; Query: page, limit |
| POST | /api/storage/scanner/schedules/:id/run | Path: id; Query: page, limit |
| GET | /api/storage/scanner/status | Query: page, limit, sort, filter |
| POST | /api/storage/scanner/cleanup | Query: page, limit, sort, filter |
| GET | /api/storage/scanner/folder/:path(*)/stats | Path: path; Query: page, limit |
| GET | /api/storage/scanner/folder/:path(*)/list | Path: path; Query: page, limit |
| GET | /api/storage/scanner/file/:path(*)/checksum | Path: path; Query: page, limit |
| POST | /api/storage/scanner/file/:path(*)/verify-checksum | Path: path; Query: page, limit |

### Filesystem Watcher

_Filesystem watcher control and stream_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/storage/watcher/status | Query: page, limit, sort, filter |
| POST | /api/storage/watcher/watch | Query: page, limit, sort, filter |
| DELETE | /api/storage/watcher/watch/:path(*) | Path: path; Query: page, limit |
| PUT | /api/storage/watcher/config | Query: page, limit, sort, filter |
| GET | /api/storage/watcher/events | Query: page, limit, sort, filter |
| POST | /api/storage/watcher/force-sync | Query: page, limit, sort, filter |
| GET | /api/storage/watcher/stream | Query: page, limit, sort, filter |

### Highlights

_User highlights_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/highlights | Query: page, limit, sort, filter |
| GET | /api/highlights | Query: page, limit, sort, filter |
| GET | /api/highlights/colors/distribution | Query: page, limit, sort, filter |
| GET | /api/highlights/count | Query: page, limit, sort, filter |
| GET | /api/highlights/:highlightId | Path: highlightId; Query: page, limit |
| PUT | /api/highlights/:highlightId | Path: highlightId; Query: page, limit |
| DELETE | /api/highlights/:highlightId | Path: highlightId; Query: page, limit |

### History

_Reading history tracking_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/history | Query: page, limit, sort, filter |
| GET | /api/history | Query: page, limit, sort, filter |
| GET | /api/history/recently-viewed | Query: page, limit, sort, filter |
| GET | /api/history/timeline | Query: page, limit, sort, filter |
| GET | /api/history/:resourceId | Path: resourceId; Query: page, limit |
| DELETE | /api/history/:resourceId | Path: resourceId; Query: page, limit |
| DELETE | /api/history | Query: page, limit, sort, filter |

### Invoices

_Invoice management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/invoices | Query: page, limit, sort, filter |
| GET | /api/v1/invoices/number/:invoiceNumber | Path: invoiceNumber; Query: page, limit |
| GET | /api/v1/invoices/:id | Path: id; Query: page, limit |
| GET | /api/v1/invoices/:id/history | Path: id; Query: page, limit |
| GET | /api/v1/invoices/:id/download | Path: id; Query: page, limit |
| POST | /api/v1/invoices | Query: page, limit, sort, filter |

### Media

_Media asset management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/media | Query: page, limit, sort, filter |
| GET | /api/media/recent | Query: page, limit, sort, filter |
| GET | /api/media/usage | Query: page, limit, sort, filter |
| GET | /api/media/stats | Query: page, limit, sort, filter |
| GET | /api/media/:id | Path: id; Query: page, limit |
| GET | /api/media/:id/preview | Path: id; Query: page, limit |
| PUT | /api/media/:id | Path: id; Query: page, limit |
| POST | /api/media/:id/replace | Path: id; Query: page, limit |
| DELETE | /api/media/:id | Path: id; Query: page, limit |

### News

_News CRUD and workflow_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/news/latest | Query: page, limit, sort, filter |
| GET | /api/news/featured | Query: page, limit, sort, filter |
| GET | /api/news/breaking | Query: page, limit, sort, filter |
| GET | /api/news/search | Query: q, page, limit |
| GET | /api/news | Query: page, limit, sort, filter |
| GET | /api/news/:id | Path: id; Query: page, limit |
| POST | /api/news | Query: page, limit, sort, filter |
| PUT | /api/news/:id | Path: id; Query: page, limit |
| DELETE | /api/news/:id | Path: id; Query: page, limit |
| POST | /api/news/:id/publish | Path: id; Query: page, limit |
| POST | /api/news/:id/archive | Path: id; Query: page, limit |
| POST | /api/news/:id/schedule | Path: id; Query: page, limit |

### Notes

_User notes_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/notes | Query: page, limit, sort, filter |
| GET | /api/notes | Query: page, limit, sort, filter |
| GET | /api/notes/pinned | Query: page, limit, sort, filter |
| GET | /api/notes/tags | Query: page, limit, sort, filter |
| GET | /api/notes/count | Query: page, limit, sort, filter |
| GET | /api/notes/:noteId | Path: noteId; Query: page, limit |
| PUT | /api/notes/:noteId | Path: noteId; Query: page, limit |
| POST | /api/notes/:noteId/pin | Path: noteId; Query: page, limit |
| DELETE | /api/notes/:noteId | Path: noteId; Query: page, limit |

### Notifications

_User notifications_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/notifications | Query: page, limit, sort, filter |
| GET | /api/notifications/unread/count | Query: page, limit, sort, filter |
| POST | /api/notifications/mark-all-read | Query: page, limit, sort, filter |
| POST | /api/notifications/cleanup | Query: page, limit, sort, filter |
| GET | /api/notifications/:notificationId | Path: notificationId; Query: page, limit |
| POST | /api/notifications/:notificationId/read | Path: notificationId; Query: page, limit |
| DELETE | /api/notifications/:notificationId | Path: notificationId; Query: page, limit |

### Orders

_Order management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/orders | Query: page, limit, sort, filter |
| GET | /api/v1/orders/number/:orderNumber | Path: orderNumber; Query: page, limit |
| GET | /api/v1/orders/:id | Path: id; Query: page, limit |
| GET | /api/v1/orders/:id/history | Path: id; Query: page, limit |
| POST | /api/v1/orders | Query: page, limit, sort, filter |
| PUT | /api/v1/orders/:id | Path: id; Query: page, limit |
| POST | /api/v1/orders/:id/cancel | Path: id; Query: page, limit |

### Payments

_Payments and transaction handling_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/payments | Query: page, limit, sort, filter |
| GET | /api/v1/payments/reference/:referenceNumber | Path: referenceNumber; Query: page, limit |
| GET | /api/v1/payments/:id | Path: id; Query: page, limit |
| POST | /api/v1/payments | Query: page, limit, sort, filter |
| POST | /api/v1/payments/:id/verify | Path: id; Query: page, limit |
| POST | /api/v1/payments/:id/capture | Path: id; Query: page, limit |
| POST | /api/v1/payments/:id/cancel | Path: id; Query: page, limit |
| POST | /api/v1/payments/:id/refund | Path: id; Query: page, limit |
| GET | /api/v1/payments/:id/status | Path: id; Query: page, limit |
| GET | /api/v1/payments/:id/attempts | Path: id; Query: page, limit |
| GET | /api/v1/payments/:id/audit-trail | Path: id; Query: page, limit |

### Plans

_Subscription plan management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/plans | Query: page, limit, sort, filter |
| GET | /api/v1/plans/slug/:slug | Path: slug; Query: page, limit |
| POST | /api/v1/plans | Query: page, limit, sort, filter |
| PUT | /api/v1/plans/:id | Path: id; Query: page, limit |
| DELETE | /api/v1/plans/:id | Path: id; Query: page, limit |
| POST | /api/v1/plans/:id/archive | Path: id; Query: page, limit |
| POST | /api/v1/plans/:id/restore | Path: id; Query: page, limit |
| GET | /api/v1/plans/:id | Path: id; Query: page, limit |

### Profile

_Profile and account settings_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/profile | Query: page, limit, sort, filter |
| PUT | /api/profile | Query: page, limit, sort, filter |
| PUT | /api/profile/bio | Query: page, limit, sort, filter |
| PUT | /api/profile/avatar | Query: page, limit, sort, filter |
| GET | /api/profile/preferences | Query: page, limit, sort, filter |
| PUT | /api/profile/preferences | Query: page, limit, sort, filter |
| PUT | /api/profile/preferences/theme | Query: page, limit, sort, filter |
| PUT | /api/profile/preferences/language | Query: page, limit, sort, filter |
| GET | /api/profile/reading-stats | Query: page, limit, sort, filter |
| GET | /api/profile/subscription | Query: page, limit, sort, filter |
| PUT | /api/profile/subscription/tier | Query: page, limit, sort, filter |
| GET | /api/profile/social-links | Query: page, limit, sort, filter |
| PUT | /api/profile/social-links | Query: page, limit, sort, filter |
| GET | /api/profile/public/:userId | Path: userId; Query: page, limit |

### Progress

_Reading progress and content state_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/progress | Query: page, limit, sort, filter |
| GET | /api/progress | Query: page, limit, sort, filter |
| GET | /api/progress/completed | Query: page, limit, sort, filter |
| GET | /api/progress/continue-reading | Query: page, limit, sort, filter |
| GET | /api/progress/stats | Query: page, limit, sort, filter |
| GET | /api/progress/:resourceId | Path: resourceId; Query: page, limit |
| PUT | /api/progress/:resourceId | Path: resourceId; Query: page, limit |
| POST | /api/progress/:resourceId/complete | Path: resourceId; Query: page, limit |
| DELETE | /api/progress/:resourceId | Path: resourceId; Query: page, limit |
| GET | /api/progress/content/:resourceId/:resourceType | Path: resourceId, resourceType; Query: page, limit |
| GET | /api/progress/related/:resourceId/:resourceType | Path: resourceId, resourceType; Query: page, limit |
| PUT | /api/progress/preferences | Query: page, limit, sort, filter |

### Promotions

_Promotion management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/promotions | Query: page, limit, sort, filter |
| GET | /api/v1/promotions/active | Query: page, limit, sort, filter |
| GET | /api/v1/promotions/slug/:slug | Path: slug; Query: page, limit |
| GET | /api/v1/promotions/:id | Path: id; Query: page, limit |
| POST | /api/v1/promotions | Query: page, limit, sort, filter |
| PUT | /api/v1/promotions/:id | Path: id; Query: page, limit |
| DELETE | /api/v1/promotions/:id | Path: id; Query: page, limit |
| POST | /api/v1/promotions/:id/archive | Path: id; Query: page, limit |
| POST | /api/v1/promotions/:id/restore | Path: id; Query: page, limit |

### Publishing

_Publishing catalog routes defined in the module_

> This module exists in the codebase but is not currently mounted by the main router. The paths below are the route definitions as written in the module.

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /books/featured | Query: page, limit, sort, filter |
| GET | /books/trending | Query: page, limit, sort, filter |
| GET | /books/new | Query: page, limit, sort, filter |
| GET | /books/popular | Query: page, limit, sort, filter |
| GET | /books/category/:categoryId | Path: categoryId; Query: page, limit |
| GET | /books/genre/:genreId | Path: genreId; Query: page, limit |
| GET | /books/author/:authorId | Path: authorId; Query: page, limit |
| GET | /books/publisher/:publisherId | Path: publisherId; Query: page, limit |
| GET | /books/related/:bookId | Path: bookId; Query: page, limit |
| GET | /books/slug/:slug | Path: slug; Query: page, limit |
| GET | /books/:id | Path: id; Query: page, limit |
| GET | /books | Query: page, limit, sort, filter |
| POST | /books | Query: page, limit, sort, filter |
| PUT | /books/:id | Path: id; Query: page, limit |
| DELETE | /books/:id | Path: id; Query: page, limit |
| POST | /books/:id/restore | Path: id; Query: page, limit |
| GET | /publications/latest | Query: page, limit, sort, filter |
| GET | /publications/archive | Query: page, limit, sort, filter |
| GET | /publications/slug/:slug | Path: slug; Query: page, limit |
| GET | /publications/:id | Path: id; Query: page, limit |
| GET | /publications | Query: page, limit, sort, filter |
| POST | /publications | Query: page, limit, sort, filter |
| PUT | /publications/:id | Path: id; Query: page, limit |
| DELETE | /publications/:id | Path: id; Query: page, limit |
| POST | /publications/:id/restore | Path: id; Query: page, limit |
| GET | /magazine-issues/current | Query: page, limit, sort, filter |
| GET | /magazine-issues/archive | Query: page, limit, sort, filter |
| GET | /magazine-issues/slug/:slug | Path: slug; Query: page, limit |
| GET | /magazine-issues/:id | Path: id; Query: page, limit |
| GET | /magazine-issues | Query: page, limit, sort, filter |
| POST | /magazine-issues | Query: page, limit, sort, filter |
| PUT | /magazine-issues/:id | Path: id; Query: page, limit |
| DELETE | /magazine-issues/:id | Path: id; Query: page, limit |
| POST | /magazine-issues/:id/restore | Path: id; Query: page, limit |
| GET | /authors/featured | Query: page, limit, sort, filter |
| GET | /authors/slug/:slug | Path: slug; Query: page, limit |
| GET | /authors/:id | Path: id; Query: page, limit |
| GET | /authors | Query: page, limit, sort, filter |
| POST | /authors | Query: page, limit, sort, filter |
| PUT | /authors/:id | Path: id; Query: page, limit |
| DELETE | /authors/:id | Path: id; Query: page, limit |
| POST | /authors/:id/restore | Path: id; Query: page, limit |
| GET | /publishers/featured | Query: page, limit, sort, filter |
| GET | /publishers/slug/:slug | Path: slug; Query: page, limit |
| GET | /publishers/:id | Path: id; Query: page, limit |
| GET | /publishers | Query: page, limit, sort, filter |
| POST | /publishers | Query: page, limit, sort, filter |
| PUT | /publishers/:id | Path: id; Query: page, limit |
| DELETE | /publishers/:id | Path: id; Query: page, limit |
| POST | /publishers/:id/restore | Path: id; Query: page, limit |
| GET | /genres/slug/:slug | Path: slug; Query: page, limit |
| GET | /genres/:id | Path: id; Query: page, limit |
| GET | /genres | Query: page, limit, sort, filter |
| POST | /genres | Query: page, limit, sort, filter |
| PUT | /genres/:id | Path: id; Query: page, limit |
| DELETE | /genres/:id | Path: id; Query: page, limit |
| POST | /genres/:id/restore | Path: id; Query: page, limit |
| GET | /series/slug/:slug | Path: slug; Query: page, limit |
| GET | /series/:id | Path: id; Query: page, limit |
| GET | /series | Query: page, limit, sort, filter |
| POST | /series | Query: page, limit, sort, filter |
| PUT | /series/:id | Path: id; Query: page, limit |
| DELETE | /series/:id | Path: id; Query: page, limit |
| POST | /series/:id/restore | Path: id; Query: page, limit |
| GET | /collections/featured | Query: page, limit, sort, filter |
| GET | /collections/slug/:slug | Path: slug; Query: page, limit |
| GET | /collections/:id | Path: id; Query: page, limit |
| GET | /collections | Query: page, limit, sort, filter |
| POST | /collections | Query: page, limit, sort, filter |
| PUT | /collections/:id | Path: id; Query: page, limit |
| DELETE | /collections/:id | Path: id; Query: page, limit |
| POST | /collections/:id/restore | Path: id; Query: page, limit |

### Recommendations

_Content recommendations_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/recommendations | Query: page, limit, sort, filter |

### Reports

_Commerce and usage reporting_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/reports/revenue | Query: page, limit, sort, filter |
| GET | /api/v1/reports/orders | Query: page, limit, sort, filter |
| GET | /api/v1/reports/subscriptions | Query: page, limit, sort, filter |
| GET | /api/v1/reports/invoices | Query: page, limit, sort, filter |
| GET | /api/v1/reports/coupons | Query: page, limit, sort, filter |
| GET | /api/v1/reports/transactions | Query: page, limit, sort, filter |

### Search

_Search endpoints_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/search | Query: page, limit, sort, filter |
| POST | /api/search/advanced | Query: q, page, limit |

### Storage

_Storage folder/file operations_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/storage/folders | Query: page, limit, sort, filter |
| GET | /api/storage/folders/tree | Query: page, limit, sort, filter |
| GET | /api/storage/folders/:id | Path: id; Query: page, limit |
| GET | /api/storage/folders/path/:path(*) | Path: path; Query: page, limit |
| PUT | /api/storage/folders/:id | Path: id; Query: page, limit |
| DELETE | /api/storage/folders/:id | Path: id; Query: page, limit |
| POST | /api/storage/folders/:id/move | Path: id; Query: page, limit |
| POST | /api/storage/folders/:id/rename | Path: id; Query: page, limit |
| GET | /api/storage/folders/:path(*)/contents | Path: path; Query: page, limit |
| GET | /api/storage/stats | Query: page, limit, sort, filter |
| GET | /api/storage/folders/:path(*)/size | Path: path; Query: page, limit |
| GET | /api/storage/browse | Query: page, limit, sort, filter |
| GET | /api/storage/search | Query: q, page, limit |
| GET | /api/storage/facets | Query: page, limit, sort, filter |
| GET | /api/storage/suggestions | Query: page, limit, sort, filter |
| POST | /api/storage/import | Query: page, limit, sort, filter |
| POST | /api/storage/reindex/full | Query: page, limit, sort, filter |
| POST | /api/storage/reindex/partial | Query: page, limit, sort, filter |
| POST | /api/storage/repair | Query: page, limit, sort, filter |
| GET | /api/storage/files/:path(*)/stream | Path: path; Query: page, limit |
| GET | /api/storage/files/:path(*)/download | Path: path; Query: page, limit |
| POST | /api/storage/files/upload | Query: page, limit, sort, filter |
| DELETE | /api/storage/files/:path(*) | Path: path; Query: page, limit |
| GET | /api/storage/files/:path(*)/url | Path: path; Query: page, limit |
| POST | /api/storage/files/:path(*)/presigned-url | Path: path; Query: page, limit |
| GET | /api/storage/files/:path(*)/checksum | Path: path; Query: page, limit |
| POST | /api/storage/files/:path(*)/verify-checksum | Path: path; Query: page, limit |
| GET | /api/storage/detect/missing | Query: page, limit, sort, filter |
| GET | /api/storage/detect/duplicates | Query: page, limit, sort, filter |

### Storage Sync

_Storage synchronization jobs_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/storage/sync/jobs | Query: page, limit, sort, filter |
| GET | /api/storage/sync/jobs | Query: page, limit, sort, filter |
| GET | /api/storage/sync/jobs/:id | Path: id; Query: page, limit |
| POST | /api/storage/sync/jobs/:id/cancel | Path: id; Query: page, limit |
| POST | /api/storage/sync/sync/full | Query: page, limit, sort, filter |
| POST | /api/storage/sync/sync/partial | Query: page, limit, sort, filter |
| POST | /api/storage/sync/sync/incremental | Query: page, limit, sort, filter |
| POST | /api/storage/sync/sync/repair | Query: page, limit, sort, filter |
| POST | /api/storage/sync/sync/verify | Query: page, limit, sort, filter |
| POST | /api/storage/sync/schedules | Query: page, limit, sort, filter |
| GET | /api/storage/sync/schedules | Query: page, limit, sort, filter |
| GET | /api/storage/sync/schedules/:id | Path: id; Query: page, limit |
| PUT | /api/storage/sync/schedules/:id | Path: id; Query: page, limit |
| DELETE | /api/storage/sync/schedules/:id | Path: id; Query: page, limit |
| POST | /api/storage/sync/schedules/:id/enable | Path: id; Query: page, limit |
| POST | /api/storage/sync/schedules/:id/disable | Path: id; Query: page, limit |
| POST | /api/storage/sync/schedules/:id/run | Path: id; Query: page, limit |
| GET | /api/storage/sync/status | Query: page, limit, sort, filter |
| POST | /api/storage/sync/cleanup | Query: page, limit, sort, filter |

### Subscriptions

_User subscriptions_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/subscriptions | Query: page, limit, sort, filter |
| GET | /api/v1/subscriptions/:id | Path: id; Query: page, limit |
| GET | /api/v1/subscriptions/:id/history | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions | Query: page, limit, sort, filter |
| POST | /api/v1/subscriptions/:id/renew | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions/:id/upgrade | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions/:id/downgrade | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions/:id/pause | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions/:id/resume | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions/:id/cancel | Path: id; Query: page, limit |
| POST | /api/v1/subscriptions/:id/expire | Path: id; Query: page, limit |

### System

_System information and settings_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/v1/system/info | Query: page, limit, sort, filter |
| GET | /api/v1/system/health | Query: page, limit, sort, filter |
| GET | /api/v1/system/database | Query: page, limit, sort, filter |
| GET | /api/v1/system/settings | Query: page, limit, sort, filter |
| GET | /api/v1/system/settings/:key | Path: key; Query: page, limit |
| PUT | /api/v1/system/settings/:key | Path: key; Query: page, limit |
| POST | /api/v1/system/email/test | Query: page, limit, sort, filter |

### Tags

_Tag management_

| Method | Path | Parameters |
| --- | --- | --- |
| GET | /api/tags/popular | Query: page, limit, sort, filter |
| GET | /api/tags | Query: page, limit, sort, filter |
| POST | /api/tags | Query: page, limit, sort, filter |
| PUT | /api/tags/:id | Path: id; Query: page, limit |
| DELETE | /api/tags/:id | Path: id; Query: page, limit |
| POST | /api/tags/merge | Query: page, limit, sort, filter |

### Webhooks

_Webhook ingestion and verification_

| Method | Path | Parameters |
| --- | --- | --- |
| POST | /api/v1/webhooks | Query: page, limit, sort, filter |
| POST | /api/v1/webhooks/verify | Query: page, limit, sort, filter |
| GET | /api/v1/webhooks/logs | Query: page, limit, sort, filter |
