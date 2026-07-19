import { env } from "./index";

export const storageConfig = {
  local: {
    uploadDir: env.UPLOAD_DIR,
    maxFileSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(",").map((t) => t.trim()),
  },
  s3: {
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
    enabled: !!(
      env.S3_BUCKET &&
      env.S3_REGION &&
      env.S3_ACCESS_KEY &&
      env.S3_SECRET_KEY
    ),
  },
  useS3: !!(
    env.S3_BUCKET &&
    env.S3_REGION &&
    env.S3_ACCESS_KEY &&
    env.S3_SECRET_KEY
  ),
};
