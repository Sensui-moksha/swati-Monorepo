import request from 'supertest';
import app from '../../backend/src/app'; // assuming export app
import { User } from '../../backend/src/models/User';
import { AuditLog } from '../../backend/src/models/AuditLog';

describe('Zero Trust Auth & Security Tests', () => {
  describe('Brute Force Protection', () => {
    it('should block IPs after 5 failed login attempts', async () => {
      const loginPayload = { email: 'test@example.com', password: 'wrongpassword' };
      
      // Make 5 failed requests
      for(let i=0; i<5; i++) {
        await request(app).post('/api/v1/auth/login').send(loginPayload);
      }

      // The 6th request should hit the rate limiter
      const response = await request(app).post('/api/v1/auth/login').send(loginPayload);
      
      expect(response.status).toBe(429);
      expect(response.body.message).toMatch(/Too many login attempts/);
    });
  });

  describe('Audit Logging', () => {
    it('should create an audit log on failed login', async () => {
      const beforeCount = await AuditLog.countDocuments({ action: 'FAILED_LOGIN' });
      
      await request(app).post('/api/v1/auth/login').send({
        email: 'audit@example.com',
        password: 'wrongpassword'
      });

      // Wait a tick for the setImmediate to process
      await new Promise(resolve => setTimeout(resolve, 50));

      const afterCount = await AuditLog.countDocuments({ action: 'FAILED_LOGIN' });
      expect(afterCount).toBe(beforeCount + 1);
    });
  });

  describe('Security Headers', () => {
    it('should return Helmet security headers', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
  });
});
