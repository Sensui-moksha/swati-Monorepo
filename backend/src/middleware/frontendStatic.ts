import path from 'path';
import fs from 'fs';
import express, { Application, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Configures the Express backend to serve the frontend client bundle and SSR fallback.
 * Enables the monorepo to run full-stack in a single unified deployment.
 */
export function setupFrontendFallback(app: Application): void {
  // Resolve client static distribution directory
  const candidateClientDirs = [
    process.env.FRONTEND_CLIENT_DIST,
    path.resolve(__dirname, '../../../swati-clientside/dist/client'),
    path.resolve(process.cwd(), '../swati-clientside/dist/client'),
    path.resolve(process.cwd(), 'swati-clientside/dist/client'),
    path.resolve(process.cwd(), '../dist/client'),
  ].filter(Boolean) as string[];

  const clientDistDir = candidateClientDirs.find((dir) => fs.existsSync(dir));

  // Resolve SSR server entrypoint
  const candidateServerEntries = [
    process.env.FRONTEND_SERVER_ENTRY,
    path.resolve(__dirname, '../../../swati-clientside/dist/server/server.js'),
    path.resolve(process.cwd(), '../swati-clientside/dist/server/server.js'),
    path.resolve(process.cwd(), 'swati-clientside/dist/server/server.js'),
    path.resolve(process.cwd(), '../dist/server/server.js'),
  ].filter(Boolean) as string[];

  const serverEntryPath = candidateServerEntries.find((entry) => fs.existsSync(entry));

  if (!clientDistDir && !serverEntryPath) {
    logger.info('Frontend build artifacts not found — operating in API-only mode');
    return;
  }

  logger.info(`Frontend integration active: assets=${clientDistDir || 'none'}, ssr=${serverEntryPath || 'none'}`);

  // 1. Serve static client assets (CSS, JS bundles, images, icons, manifest, service worker)
  if (clientDistDir) {
    app.use(
      express.static(clientDistDir, {
        index: false,
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
        immutable: process.env.NODE_ENV === 'production',
      })
    );
  }

  // 2. SSR / SPA Fallback Handler
  let ssrModulePromise: Promise<any> | null = null;

  const getSsrHandler = async () => {
    if (!serverEntryPath) return null;
    if (!ssrModulePromise) {
      ssrModulePromise = import(`file://${serverEntryPath}`)
        .then((m) => (m.default && typeof m.default.fetch === 'function' ? m.default : m))
        .catch((err) => {
          logger.error('Failed to load frontend SSR bundle:', err);
          return null;
        });
    }
    return ssrModulePromise;
  };

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Skip API, docs, metrics, and health routes
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/metrics') ||
      req.path.startsWith('/api-docs')
    ) {
      return next();
    }

    // Only process GET and HEAD requests for UI
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    try {
      const ssrHandler = await getSsrHandler();
      if (ssrHandler && typeof ssrHandler.fetch === 'function') {
        const fullUrl = `${req.protocol}://${req.get('host') || 'localhost'}${req.originalUrl}`;
        const webReq = new globalThis.Request(fullUrl, {
          method: req.method,
          headers: req.headers as any,
        });

        const webRes: globalThis.Response = await ssrHandler.fetch(webReq);

        res.status(webRes.status);
        webRes.headers.forEach((val, key) => {
          res.setHeader(key, val);
        });

        const html = await webRes.text();
        return res.send(html);
      }

      // If SSR handler isn't present, check for static index.html
      if (clientDistDir) {
        const indexPath = path.join(clientDistDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }

      return next();
    } catch (error) {
      logger.error('Error rendering frontend route via backend:', error);
      return next(error);
    }
  });
}
