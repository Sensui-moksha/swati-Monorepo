import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Recursively sanitizes string values in objects and arrays to prevent Cross-Site Scripting (XSS).
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = sanitizeValue(value[key]);
    }
    return value;
  }
  return value;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params against XSS.
 * Drop-in, modern, maintained replacement for the deprecated xss-clean package.
 */
export function xssSanitizer() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      sanitizeValue(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      sanitizeValue(req.params);
    }
    next();
  };
}

export default xssSanitizer;
