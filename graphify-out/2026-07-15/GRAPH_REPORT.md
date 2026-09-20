# Graph Report - Prototype v0  (2026-07-15)

## Corpus Check
- 51 files · ~27,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 811 nodes · 1425 edges · 56 communities (20 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ArticleRepository
- index.ts
- dependencies
- app.ts
- paths
- compilerOptions
- CategoryRepository
- auth.ts
- IUser
- TagRepository
- scripts
- MediaRepository
- NewsletterRepository
- IArticleModel
- devDependencies
- Ponytail, lazy senior dev mode
- eslint-plugin-prettier
- jest
- prettier
- ts-jest
- tsx
- @types/bcryptjs
- @types/compression
- @types/cookie-parser
- @types/cors
- @types/express
- @types/express-mongo-sanitize
- @types/helmet
- @types/hpp
- @types/jest
- @types/jsonwebtoken
- @types/morgan
- @types/multer
- @types/node
- @types/swagger-jsdoc
- @types/swagger-ui-express
- typescript
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- express-mongo-sanitize.d.ts
- hpp.d.ts
- xss-clean.d.ts
- eslint-config-prettier
- AuthService
- jwt.ts
- .badRequest
- templates.ts
- BaseRepository
- CategoryService
- .notFound
- validation.ts
- OTPService
- password.ts
- CLAUDE.md
- IUserModel
- jest

## God Nodes (most connected - your core abstractions)
1. `IUser` - 77 edges
2. `UserRepository` - 41 edges
3. `PaginationOptions` - 35 edges
4. `PaginatedResult` - 35 edges
5. `BaseRepository` - 35 edges
6. `AuthService` - 35 edges
7. `ArticleRepository` - 31 edges
8. `SessionRepository` - 31 edges
9. `ICategory` - 29 edges
10. `OTPRepository` - 28 edges

## Surprising Connections (you probably didn't know these)
- `authenticate()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `optionalAuth()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `refreshTokenAuth()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `CategoryTreeNode` --inherits--> `ICategory`  [EXTRACTED]
  backend/src/services/CategoryService.ts → backend/src/models/Category.ts
- `CategoryWithArticleCount` --inherits--> `ICategory`  [EXTRACTED]
  backend/src/services/CategoryService.ts → backend/src/models/Category.ts

## Import Cycles
- None detected.

## Communities (56 total, 36 thin omitted)

### Community 0 - "ArticleRepository"
Cohesion: 0.05
Nodes (13): IArticle, IMedia, Newsletter, ArticleFilter, ArticleRepository, BaseRepository, PaginatedResult, PaginationOptions (+5 more)

### Community 1 - "index.ts"
Cohesion: 0.06
Nodes (13): Category, categorySchema, ICategoryModel, IMediaModel, Media, mediaSchema, MediaType, ICategory (+5 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (43): dependencies, bcryptjs, compression, cookie-parser, cors, dotenv, express, express-rate-limit (+35 more)

### Community 3 - "app.ts"
Cohesion: 0.07
Nodes (35): app, limiter, startServer(), databaseConfig, connectDB(), emailConfig, env, EnvConfig (+27 more)

### Community 4 - "paths"
Cohesion: 0.06
Nodes (35): paths, @config/*, @controllers/*, @database/*, @docs/*, @emails/*, @interfaces/*, @jobs/* (+27 more)

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (33): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib (+25 more)

### Community 9 - "TagRepository"
Cohesion: 0.10
Nodes (6): ITag, ITagModel, Tag, tagSchema, TagFilter, TagRepository

### Community 10 - "scripts"
Cohesion: 0.11
Nodes (18): description, engines, node, main, name, scripts, build, db:connect (+10 more)

### Community 11 - "MediaRepository"
Cohesion: 0.12
Nodes (13): CreateOTPData, OTPFilter, VerifyOTPData, base32Decode(), generateOTP(), generateTOTP(), hashOTP(), OTPConfig (+5 more)

### Community 14 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, @types/bcryptjs, @types/nodemailer, eslint, @types/bcryptjs, @types/nodemailer

### Community 21 - "@types/bcryptjs"
Cohesion: 0.28
Nodes (4): TwoFactorVerifyData, base32Encode(), generateBackupCodes(), generateTOTPSecret()

### Community 43 - "AuthService"
Cohesion: 0.07
Nodes (7): ApiError, validate(), validateBody(), validateParams(), validateQuery(), AuthService, TwoFactorSetupData

### Community 44 - "jwt.ts"
Cohesion: 0.13
Nodes (18): DecodedToken, decodeToken(), DEFAULT_ACCESS_OPTIONS, DEFAULT_REFRESH_OPTIONS, DEFAULT_VERIFY_OPTIONS, generateAccessToken(), generateRefreshToken(), generateTokenPair() (+10 more)

### Community 45 - ".badRequest"
Cohesion: 0.19
Nodes (7): TwoFactorService, timingSafeEqual(), verifyTOTP(), validate(), validateBody(), validateParams(), validateQuery()

### Community 46 - "templates.ts"
Cohesion: 0.25
Nodes (18): accountDeactivatedTemplate(), accountDeletionTemplate(), baseLayout(), baseLayoutText(), emailChangedTemplate(), EmailTemplateData, EmailTemplateFunction, EmailTemplateKey (+10 more)

### Community 48 - "CategoryService"
Cohesion: 0.07
Nodes (15): Article, articleSchema, ArticleStatus, ICategory, IMedia, ITag, IUser, ICategory (+7 more)

### Community 50 - "validation.ts"
Cohesion: 0.18
Nodes (10): authSchemas, commonSchemas, fileSchemas, InferSchema, otpSchemas, responseSchemas, sanitize(), sanitizeInput() (+2 more)

### Community 53 - "password.ts"
Cohesion: 0.23
Nodes (9): checkPasswordStrength(), comparePassword(), hashPassword(), hasSequentialChars(), PasswordStrength, TODO: Integrate with HaveIBeenPwned API (k-anonymity model), rehashIfNeeded(), timingSafeComparePassword() (+1 more)

### Community 59 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 61 - "IUserModel"
Cohesion: 0.14
Nodes (12): authenticate(), AuthRequest, optionalAuth(), refreshTokenAuth(), IUserModel, User, userSchema, SessionFilter (+4 more)

## Knowledge Gaps
- **175 isolated node(s):** `name`, `version`, `description`, `main`, `dev` (+170 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `AuthService` to `app.ts`, `MediaRepository`, `jwt.ts`, `.badRequest`, `CategoryService`, `.notFound`, `validation.ts`, `@types/bcryptjs`, `password.ts`, `IUserModel`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `IUser` connect `IUser` to `ArticleRepository`, `index.ts`, `app.ts`, `CategoryRepository`, `auth.ts`, `eslint-config-prettier`, `.notFound`, `IUserModel`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `BaseRepository` connect `ArticleRepository` to `index.ts`, `CategoryRepository`, `IUser`, `TagRepository`, `eslint-config-prettier`, `NewsletterRepository`, `CategoryService`, `IUserModel`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _175 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ArticleRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.05246913580246913 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0620782726045884 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._