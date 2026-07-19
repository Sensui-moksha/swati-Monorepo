import { env } from "./index";

export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  from: env.SMTP_FROM || env.SMTP_USER,
  enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
};
