import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
  ALLOWED_FILE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/webp,application/pdf"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("info"),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  SWAGGER_PATH: z.string().default("/api-docs"),
  PAYMENT_PROVIDER: z.string().default("dummy"),
  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),
  // PDF Streaming & Optimization
  PDF_SSD_CACHE_DIR: z.string().default("/mnt/ssd-cache/pdf"),
  PDF_OPTIMIZED_DIR: z.string().default("./storage/optimized"),
  PDF_CACHE_MAX_SIZE_GB: z.coerce.number().default(100),
  PDF_CACHE_TTL_HOURS: z.coerce.number().default(72),
  PDF_HOT_FILE_THRESHOLD: z.coerce.number().default(10),
  PDF_OPTIMIZATION_PROVIDER: z.enum(["ghostscript", "qpdf", "mupdf", "ocrmypdf", "auto"]).default("auto"),
  PDF_OPTIMIZATION_CONCURRENCY: z.coerce.number().default(2),
  PDF_PREPROCESSING_CRON: z.string().default("0 2 * * *"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

export function loadConfig(): EnvConfig {
  if (config) return config;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  config = result.data;
  return config;
}

export function getConfig(): EnvConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}

export const env = getConfig();
