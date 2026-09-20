import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { env } from './config/index';
import { connectDB } from './config/db';
import { swaggerConfig, swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { setupFrontendFallback } from './middleware/frontendStatic';
import routes from './routes';
import './workers/SearchWorker'; // Initialize background workers
import { reportingWorker } from './workers/ReportingWorker';
import { startTracer } from './utils/tracer';
import { setupGracefulShutdown } from './utils/gracefulShutdown';
import { httpRequestDurationMicroseconds } from './utils/metrics';
import { registerDomainEventListeners } from './events/registerListeners';

// Start OpenTelemetry
startTracer();

// Initialize domain event listeners
registerDomainEventListeners();

// Start scheduled BI reports
if (env.NODE_ENV === 'production' || env.NODE_ENV === 'development') {
  reportingWorker.startJobs();
}

const app: Application = express();


// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  xssFilter: true,
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Global Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100000 : (env.RATE_LIMIT_MAX_REQUESTS || 1000),
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth Rate limiting (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/mfa/verify', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Compression
app.use(compression());

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Record HTTP metrics
app.use((req: Request, res: Response, next: Function) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const elapsed = process.hrtime(start);
    const durationSeconds = elapsed[0] + elapsed[1] / 1e9;
    httpRequestDurationMicroseconds.labels(req.method, req.route ? req.route.path : req.path, res.statusCode.toString()).observe(durationSeconds);
  });
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// API Documentation
if (swaggerConfig.enabled) {
  app.use(swaggerConfig.path, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Prototype v0 API Documentation',
  }));
}

// API Routes
app.use('/api', routes);

// Serve Frontend static assets and SSR fallback for non-API web routes
setupFrontendFallback(app);

// 404 handler for unmatched API requests
app.use(notFound);

// Global error handler
app.use(errorHandler);

import { seedIfEmpty } from './seed';

// Start server
const startServer = async (): Promise<void> => {
  try {
    const server = app.listen(env.PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║  Prototype v0 Server Started Successfully                                ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(47)}            ║
║  Port: ${String(env.PORT).padEnd(48)}                  ║
║  API URL: http://localhost:${env.PORT}/api${' '.repeat(36 - String(env.PORT).length)}      ║
║  Health: http://localhost:${env.PORT}/health${' '.repeat(32 - String(env.PORT).length)}        ║
║  Docs: http://localhost:${env.PORT}${swaggerConfig.path}${' '.repeat(38 - String(env.PORT).length - swaggerConfig.path.length)}           ║
╚══════════════════════════════════════════════════════════════════════════╝
      `);
    });

    setupGracefulShutdown(server);

    // Initialize database connection & seed non-blockingly
    connectDB()
      .then(() => seedIfEmpty())
      .catch((err) => {
        console.warn('Initial MongoDB connection deferred:', (err as Error)?.message || err);
      });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;