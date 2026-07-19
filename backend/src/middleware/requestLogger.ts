import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { env } from "../config/index";

// Custom morgan token for response time in milliseconds
morgan.token("response-time-ms", (req: Request, res: Response) => {
  if (!req.socket || !res.getHeader("X-Response-Time")) {
    return "-";
  }
  return `${res.getHeader("X-Response-Time")}ms`;
});

// Custom format for development
const devFormat =
  ":method :url :status :res[content-length] - :response-time ms";

// Custom format for production (combined with IP)
const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Skip logging for health checks
const skip = (req: Request): boolean => {
  return req.path === "/health" || req.path === "/favicon.ico";
};

// Create morgan middleware
export const requestLogger = morgan(
  env.NODE_ENV === "production" ? prodFormat : devFormat,
  {
    skip,
    stream: {
      write: (message: string) => {
        // Trim the message and log it
        console.log(message.trim());
      },
    },
  },
);

// Custom request logging middleware for additional details
export const detailedRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  // Add response time header
  res.on("finish", () => {
    const duration = Date.now() - start;
    res.setHeader("X-Response-Time", duration);

    // Log slow requests (> 1000ms)
    if (duration > 1000 && env.NODE_ENV !== "test") {
      console.warn(
        `Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`,
      );
    }
  });

  next();
};
