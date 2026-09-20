import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { setupFrontendFallback } from '../middleware/frontendStatic';

describe('setupFrontendFallback Middleware', () => {
  let tempDir: string;
  let clientDist: string;
  let originalEnvClient: string | undefined;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'frontend-test-'));
    clientDist = path.join(tempDir, 'client');
    fs.mkdirSync(clientDist, { recursive: true });
    fs.writeFileSync(path.join(clientDist, 'index.html'), '<!DOCTYPE html><html><body>Fallback SPA</body></html>');

    originalEnvClient = process.env.FRONTEND_CLIENT_DIST;
    process.env.FRONTEND_CLIENT_DIST = clientDist;
  });

  afterAll(() => {
    process.env.FRONTEND_CLIENT_DIST = originalEnvClient;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('bypasses API routes so API handlers can process them', async () => {
    const app = express();
    setupFrontendFallback(app);

    const apiReq = {
      method: 'GET',
      path: '/api/v1/articles',
      originalUrl: '/api/v1/articles',
      headers: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendFile: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const next = jest.fn();

    const fallbackHandler = app._router.stack[app._router.stack.length - 1].handle;
    await fallbackHandler(apiReq, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('serves fallback index.html for non-API web route', async () => {
    const app = express();
    setupFrontendFallback(app);

    const webReq = {
      method: 'GET',
      path: '/articles/some-slug',
      originalUrl: '/articles/some-slug',
      headers: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendFile: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const next = jest.fn();

    const fallbackHandler = app._router.stack[app._router.stack.length - 1].handle;
    await fallbackHandler(webReq, res, next);

    expect(res.sendFile).toHaveBeenCalledWith(path.join(clientDist, 'index.html'));
  });
});
