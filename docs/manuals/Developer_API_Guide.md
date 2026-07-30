# Developer API & Architecture Guide

## System Architecture
The platform is built on a modern Node.js/Express backend and a React/Vite frontend, operating via a stateless microservices-oriented architecture.

### Core Technologies
- **API**: Express.js (TypeScript), Mongoose, Zod validation.
- **Databases**: MongoDB (Primary), Redis (Caching & Sessions, Queues).
- **Frontend**: React, TanStack Router, Tailwind CSS, PDF.js for rendering.
- **Background Jobs**: BullMQ (handling Recommendation matrices, NLP extraction, Email dispatches).

## API Authentication
All secured endpoints require a JWT Bearer token in the `Authorization` header.
```http
Authorization: Bearer <your_jwt_token>
```
Tokens are issued via `POST /api/auth/login`. 

## Key Services
### PDF Streaming Engine
`GET /api/streaming/:id/chunk`
The streaming engine uses HTTP Range requests to dynamically slice PDFs from the EFS mount and deliver lightweight byte-chunks to the React Reader.

### NLP Pipeline
Upon document upload, a BullMQ job fires to run TF-IDF keyword extraction and TextRank summarization via the `natural` library. This allows zero-cost, on-premise AI metadata generation without relying on external LLMs.

## Deployment & Observability
- The system supports Docker Compose for local environments and Kubernetes for production.
- **Metrics**: Available at `GET /health/metrics` (Prometheus format).
- **Tracing**: OpenTelemetry auto-instruments DB and HTTP calls, exporting to Jaeger.
