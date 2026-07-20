# Swathi Publications Backend

A production-ready backend API for **Swathi Publications** — a digital publishing platform for books, magazines, articles, and news. Built with Express.js, TypeScript, and MongoDB.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express 4 (TypeScript 5) |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (access + refresh tokens), OTP, 2FA, session management |
| Validation | Zod (env & request schemas) |
| Storage | Local, AWS S3, Cloudflare R2, Google Cloud Storage, Azure Blob (pluggable via factory) |
| Email | Nodemailer (SMTP, HTML templates) |
| Payments | Pluggable provider factory (ships with a dummy provider) |
| Docs | Swagger UI (auto-generated, served at `/api-docs`) |
| Testing | Jest + ts-jest (23 test files) |
| Security | Helmet, CORS, rate limiting, mongo sanitize, XSS clean, HPP |

## Features

### Authentication & Account Management
- Register / login with JWT access + refresh token pair (cookie or Bearer header).
- Email verification via link or OTP.
- Password reset via link or OTP flow.
- Two-factor authentication (enable, verify, disable, backup codes).
- Session management — list active sessions, revoke individual / all / other sessions.
- Role-based access control (`user`, `admin`, `publisher`, `editor`).

### Publishing Catalog
Full CRUD (with soft-delete & restore) for the content catalog:
- **Books** — featured, trending, new releases, popular, filter by category / genre / author / publisher, slug lookup, related books.
- **Publications** — latest, archived, slug lookup.
- **Magazine Issues** — current, archived, slug lookup.
- **Authors** — featured, slug lookup.
- **Publishers** — featured, slug lookup.
- **Genres, Series, Collections** — slug lookup, featured collections.

Write operations require `admin`, `publisher`, or `editor` role.

### Editorial & Content Workflow
- **Articles** — full lifecycle with status workflow, versioning, slug lookup, category / tag filtering.
- **News** — CRUD with publishing workflow (featured, latest, by-category).
- **Drafts** — draft management for in-progress content.
- **Editorial** — review actions (approve, reject, request-changes, assign reviewer).
- **Comments** — moderation and pinning on content.
- **Tags** — create, list, attach to content.
- **Media** — upload, list, and manage media assets.

### Reader Engagement
- **Bookmarks** — save content with custom notes, check existence, count.
- **Favorites** — add / remove / toggle, type filtering, check, count.
- **Reading History** — record reading activity, timeline, recently viewed, clear.
- **Reading Progress** — track active reads, mark complete, per-resource stats.
- **Notes** — create, search, pin, tag-based organization, count.
- **Highlights** — color-coded text highlights with notes, color distribution analysis.
- **Notifications** — system & activity notifications, mark read, TTL auto-cleanup (90 days).

### User Profile & Personalization
- Profile management (bio, location, social links).
- Preferences (theme, language, notification toggles, reading font / line height, privacy).
- Subscription status and reading statistics.
- Dashboard — overview stats, activity summary, reading goals, heatmap, recommendations.
- Global and advanced search across all content types.

### Commerce Infrastructure (`/api/v1/...`)
- **Plans** — subscription plan CRUD, feature comparison.
- **Subscriptions** — subscribe, cancel, renew, upgrade / downgrade, usage tracking.
- **Orders** — create, list, status updates, cancel, refund.
- **Payments** — initiate, confirm, refund, transaction history, provider callbacks.
- **Invoices** — generate, list, download, send.
- **Coupons** — create, validate, redeem, usage tracking.
- **Promotions** — create, schedule, activate / deactivate.
- **Webhooks** — receive and verify third-party webhook events.
- **Reports** — commerce and usage reporting.
- **Access** — content access checks and assertions.

### Storage & File Management
- **Storage** — folder & file CRUD, presigned URLs, bulk operations. Pluggable backends:
  - Local filesystem
  - Amazon S3
  - Cloudflare R2
  - Google Cloud Storage
  - Azure Blob Storage
- **Storage Sync** — synchronization jobs between providers.
- **Filesystem Scanner** — scan local directories, inspect results, manage scan jobs.
- **Filesystem Watcher** — watch directories for changes with SSE event stream.

### Administration
- **Admin** — user management (list, ban, unban, role changes), system stats.
- **Analytics** — content performance, user engagement, revenue analytics.
- **System** — health info, app settings CRUD, database stats.

## Project Structure

```text
backend/
├── src/
│   ├── app.ts                 # Express app setup, middleware, server start
│   ├── config/                # Env validation (Zod), DB connect, JWT, email, storage, Swagger
│   ├── controllers/           # 33 request handlers
│   ├── services/              # 45 business-logic services
│   ├── repositories/          # 38 data-access classes (BaseRepository pattern)
│   ├── models/                # 34 Mongoose schemas
│   ├── routes/                # 38 route modules + index.ts router
│   ├── middleware/            # auth (JWT + roles), error handler, request logger, upload, validate
│   ├── validators/            # 16 Zod validation schema files
│   ├── providers/
│   │   ├── storage/           # StorageProvider interface + 5 implementations + factory
│   │   └── DummyPaymentProvider.ts
│   ├── factories/             # paymentProviderFactory
│   ├── interfaces/            # commerce & payment TypeScript interfaces
│   ├── utils/                 # JWT, password, OTP, payment, validation helpers
│   ├── emails/                # HTML email templates
│   ├── types/                 # Custom type declarations (xss-clean, hpp, mongo-sanitize)
│   └── tests/                 # 23 Jest test files
├── .env.example               # All environment variables with documentation
├── package.json
└── tsconfig.json              # Strict TS config with path aliases (@config/*, @services/*, etc.)
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets (min 32 chars each)
```

### Run

```bash
# Development (hot-reload via tsx)
npm run dev

# Build & start production
npm run build
npm start
```

### Other Scripts

| Command | Description |
|---|---|
| `npm run lint` | Lint with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Prettier |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run docs:generate` | Generate API docs |

### Default URLs

| URL | Description |
|---|---|
| `http://localhost:3000/api` | API root |
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/api-docs` | Swagger UI (when `SWAGGER_ENABLED=true`) |

## API Reference

The API exposes **38 route modules** with **300+ endpoints** across these prefixes:

| Prefix | Module |
|---|---|
| `/api/auth` | Authentication (24 endpoints) |
| `/api/bookmarks` | Bookmarks |
| `/api/favorites` | Favorites |
| `/api/history` | Reading history |
| `/api/progress` | Reading progress |
| `/api/notes` | Notes |
| `/api/highlights` | Highlights |
| `/api/notifications` | Notifications |
| `/api/profile` | Profile & preferences |
| `/api/search` | Search |
| `/api/dashboard` | Dashboard & analytics |
| `/api/recommendations` | Recommendations |
| `/api/articles` | Articles (24 endpoints) |
| `/api/news` | News (12 endpoints) |
| `/api/drafts` | Drafts |
| `/api/editorial` | Editorial review |
| `/api/media` | Media assets |
| `/api/tags` | Tags |
| `/api/comments` | Comments |
| `/api/analytics` | Analytics |
| `/api/storage` | Storage files & folders (29 endpoints) |
| `/api/storage/sync` | Storage sync (19 endpoints) |
| `/api/storage/scanner` | Filesystem scanner (22 endpoints) |
| `/api/storage/watcher` | Filesystem watcher |
| `/api/v1/plans` | Subscription plans |
| `/api/v1/subscriptions` | Subscriptions |
| `/api/v1/orders` | Orders |
| `/api/v1/payments` | Payments (11 endpoints) |
| `/api/v1/invoices` | Invoices |
| `/api/v1/coupons` | Coupons |
| `/api/v1/promotions` | Promotions |
| `/api/v1/webhooks` | Webhooks |
| `/api/v1/reports` | Reports |
| `/api/v1/access` | Access control |
| `/api/v1/admin` | Admin (13 endpoints) |
| `/api/v1/system` | System info & settings |

For full endpoint details with parameters and payloads, see [API_ROUTES.md](./API_ROUTES.md).

## Architecture

The codebase follows a layered architecture:

```text
Routes → Controllers → Services → Repositories → Models (MongoDB)
```

- **Routes** define Express endpoints with validation and auth middleware.
- **Controllers** handle HTTP request / response; delegate to services.
- **Services** contain business logic; call repositories.
- **Repositories** encapsulate database queries; extend a shared `BaseRepository`.
- **Models** are Mongoose schemas with indexes, virtuals, and instance methods.

Cross-cutting concerns (auth, storage, payments) use the **factory / provider pattern** for pluggable backends.

## Environment Variables

All configuration is validated at startup via Zod. See [`.env.example`](./backend/.env.example) for the full list, including:

- App config (`NODE_ENV`, `PORT`, `CORS_ORIGIN`)
- MongoDB connection (`MONGODB_URI`)
- JWT secrets and expiry (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- SMTP email settings
- Cloud storage credentials (S3 / R2 / GCS / Azure — all optional)
- Rate limiting, file upload limits, logging, Swagger toggle
- Payment provider selection
