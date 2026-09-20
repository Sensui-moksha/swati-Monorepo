# Graph Report - Prototype v0  (2026-07-14)

## Corpus Check
- 36 files · ~12,522 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 493 nodes · 750 edges · 42 communities (10 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
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

## God Nodes (most connected - your core abstractions)
1. `ArticleRepository` - 31 edges
2. `BaseRepository` - 31 edges
3. `IArticle` - 26 edges
4. `PaginationOptions` - 24 edges
5. `PaginatedResult` - 24 edges
6. `compilerOptions` - 24 edges
7. `IUser` - 23 edges
8. `UserRepository` - 22 edges
9. `TagRepository` - 21 edges
10. `CategoryRepository` - 20 edges

## Surprising Connections (you probably didn't know these)
- `authenticate()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `optionalAuth()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `refreshTokenAuth()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts
- `CategoryRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  backend/src/repositories/CategoryRepository.ts → backend/src/repositories/BaseRepository.ts
- `MediaRepository` --inherits--> `BaseRepository`  [EXTRACTED]
  backend/src/repositories/MediaRepository.ts → backend/src/repositories/BaseRepository.ts

## Import Cycles
- None detected.

## Communities (42 total, 32 thin omitted)

### Community 0 - "ArticleRepository"
Cohesion: 0.06
Nodes (11): IArticle, ArticleFilter, ArticleRepository, BaseRepository, PaginatedResult, PaginationOptions, CategoryFilter, MediaFilter (+3 more)

### Community 1 - "index.ts"
Cohesion: 0.05
Nodes (16): Category, categorySchema, ICategoryModel, IMediaModel, Media, mediaSchema, MediaType, ICategory (+8 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (43): dependencies, bcryptjs, compression, cookie-parser, cors, dotenv, express, express-rate-limit (+35 more)

### Community 3 - "app.ts"
Cohesion: 0.09
Nodes (27): app, limiter, startServer(), databaseConfig, connectDB(), emailConfig, env, EnvConfig (+19 more)

### Community 4 - "paths"
Cohesion: 0.06
Nodes (35): paths, @config/*, @controllers/*, @database/*, @docs/*, @emails/*, @interfaces/*, @jobs/* (+27 more)

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (33): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib (+25 more)

### Community 6 - "CategoryRepository"
Cohesion: 0.13
Nodes (9): Article, articleSchema, ArticleStatus, ICategory, IMedia, ITag, IUser, ICategory (+1 more)

### Community 7 - "auth.ts"
Cohesion: 0.10
Nodes (12): authenticate(), AuthRequest, optionalAuth(), refreshTokenAuth(), ApiError, validate(), validateBody(), validateParams() (+4 more)

### Community 10 - "scripts"
Cohesion: 0.11
Nodes (18): description, engines, node, main, name, scripts, build, db:connect (+10 more)

### Community 14 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, eslint-config-prettier, @types/nodemailer, eslint, eslint-config-prettier, @types/nodemailer

## Knowledge Gaps
- **139 isolated node(s):** `name`, `version`, `description`, `main`, `dev` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BaseRepository` connect `ArticleRepository` to `CategoryRepository`, `IUser`, `TagRepository`, `MediaRepository`, `NewsletterRepository`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `User` connect `auth.ts` to `ArticleRepository`, `index.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`, `eslint-plugin-prettier`, `jest`, `prettier`, `ts-jest`, `tsx`, `@types/bcryptjs`, `@types/compression`, `@types/cookie-parser`, `@types/cors`, `@types/express`, `@types/express-mongo-sanitize`, `@types/helmet`, `@types/hpp`, `@types/jest`, `@types/jsonwebtoken`, `@types/morgan`, `@types/multer`, `@types/node`, `@types/swagger-jsdoc`, `@types/swagger-ui-express`, `typescript`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ArticleRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05180388529139685 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._