# Graph Report - Prototype v0  (2026-07-15)

## Corpus Check
- 54 files · ~29,751 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 863 nodes · 1512 edges · 60 communities (20 shown, 40 thin omitted)
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
- ITagModel
- password.ts
- IMediaModel
- IUserModel
- @types/bcryptjs
- CLAUDE.md
- IUserModel
- jest

## God Nodes (most connected - your core abstractions)
1. `IUser` - 77 edges
2. `UserRepository` - 40 edges
3. `AuthService` - 36 edges
4. `BaseRepository` - 35 edges
5. `PaginationOptions` - 34 edges
6. `PaginatedResult` - 34 edges
7. `ArticleRepository` - 31 edges
8. `SessionRepository` - 31 edges
9. `ICategory` - 28 edges
10. `OTPRepository` - 28 edges

## Surprising Connections (you probably didn't know these)
- `refreshTokenAuth()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `CategoryTreeNode` --inherits--> `ICategory`  [EXTRACTED]
  backend/src/services/CategoryService.ts → backend/src/models/Category.ts
- `ArticleRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  backend/src/repositories/ArticleRepository.ts → backend/src/repositories/BaseRepository.ts
- `CategoryRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  backend/src/repositories/CategoryRepository.ts → backend/src/repositories/BaseRepository.ts
- `MediaRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  backend/src/repositories/MediaRepository.ts → backend/src/repositories/BaseRepository.ts

## Import Cycles
- None detected.

## Communities (60 total, 40 thin omitted)

### Community 0 - "ArticleRepository"
Cohesion: 0.08
Nodes (10): ArticleFilter, BaseRepository, CategoryFilter, MediaFilter, NewsletterFilter, OTPData, OTPFilter, SessionFilter (+2 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (43): dependencies, bcryptjs, compression, cookie-parser, cors, dotenv, express, express-rate-limit (+35 more)

### Community 3 - "app.ts"
Cohesion: 0.10
Nodes (25): app, limiter, startServer(), databaseConfig, connectDB(), env, EnvConfig, envSchema (+17 more)

### Community 4 - "paths"
Cohesion: 0.06
Nodes (35): paths, @config/*, @controllers/*, @database/*, @docs/*, @emails/*, @interfaces/*, @jobs/* (+27 more)

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (33): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib (+25 more)

### Community 10 - "scripts"
Cohesion: 0.11
Nodes (18): description, engines, node, main, name, scripts, build, db:connect (+10 more)

### Community 11 - "MediaRepository"
Cohesion: 0.06
Nodes (22): CreateOTPData, OTPFilter, OTPService, VerifyOTPData, TwoFactorService, TwoFactorVerifyData, base32Decode(), base32Encode() (+14 more)

### Community 14 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, tsx, @types/nodemailer, eslint, tsx, @types/nodemailer

### Community 17 - "jest"
Cohesion: 0.05
Nodes (6): IUserSession, SessionRepository, CreateSessionData, SessionFilter, SessionService, UpdateSessionData

### Community 20 - "tsx"
Cohesion: 0.18
Nodes (16): emailConfig, AuthTokens, ChangePasswordInput, EmailOptions, ForgotPasswordInput, LoginInput, RefreshTokenInput, RegisterInput (+8 more)

### Community 43 - "AuthService"
Cohesion: 0.06
Nodes (17): ApiError, AuthService, TwoFactorSetupData, authSchemas, commonSchemas, fileSchemas, InferSchema, otpSchemas (+9 more)

### Community 44 - "jwt.ts"
Cohesion: 0.12
Nodes (19): jwtConfig, DecodedToken, decodeToken(), DEFAULT_ACCESS_OPTIONS, DEFAULT_REFRESH_OPTIONS, DEFAULT_VERIFY_OPTIONS, generateAccessToken(), generateRefreshToken() (+11 more)

### Community 45 - ".badRequest"
Cohesion: 0.25
Nodes (3): Category, categorySchema, ICategoryModel

### Community 46 - "templates.ts"
Cohesion: 0.25
Nodes (18): accountDeactivatedTemplate(), accountDeletionTemplate(), baseLayout(), baseLayoutText(), emailChangedTemplate(), EmailTemplateData, EmailTemplateFunction, EmailTemplateKey (+10 more)

### Community 48 - "CategoryService"
Cohesion: 0.07
Nodes (15): Article, articleSchema, ArticleStatus, ICategory, IMedia, ITag, IUser, ICategory (+7 more)

### Community 50 - "validation.ts"
Cohesion: 0.36
Nodes (5): Media, mediaSchema, MediaType, Tag, tagSchema

### Community 51 - "OTPService"
Cohesion: 0.33
Nodes (5): ICategory, ITag, Newsletter, newsletterSchema, NewsletterStatus

### Community 53 - "password.ts"
Cohesion: 0.23
Nodes (9): checkPasswordStrength(), comparePassword(), hashPassword(), hasSequentialChars(), PasswordStrength, TODO: Integrate with HaveIBeenPwned API (k-anonymity model), rehashIfNeeded(), timingSafeComparePassword() (+1 more)

### Community 59 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 61 - "IUserModel"
Cohesion: 0.05
Nodes (49): authController, getClientInfo(), authenticate(), AuthRequest, optionalAuth(), refreshTokenAuth(), validate(), validateBody() (+41 more)

## Knowledge Gaps
- **193 isolated node(s):** `name`, `version`, `description`, `main`, `dev` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiError` connect `AuthService` to `app.ts`, `MediaRepository`, `jwt.ts`, `CategoryService`, `.notFound`, `tsx`, `password.ts`, `IUserModel`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `IUser` connect `IUser` to `ArticleRepository`, `auth.ts`, `eslint-config-prettier`, `jest`, `validation.ts`, `.notFound`, `tsx`, `IUserModel`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `BaseRepository` connect `ArticleRepository` to `CategoryRepository`, `IUser`, `TagRepository`, `eslint-config-prettier`, `NewsletterRepository`, `CategoryService`, `jest`, `@types/bcryptjs`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ArticleRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.07957957957957958 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._