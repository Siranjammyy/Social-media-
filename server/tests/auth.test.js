import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication API Tests', () => {
  const testUser = {
    name: 'Maya Lin',
    username: 'mayalin',
    email: 'maya@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('mayalin');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('should reject registration with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const duplicateRes = await request(app).post('/api/auth/register').send({
      ...testUser,
      username: 'mayadifferent',
    });

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('should reject registration with duplicate username', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const duplicateRes = await request(app).post('/api/auth/register').send({
      ...testUser,
      email: 'different@example.com',
    });

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      identifier: 'mayalin',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      identifier: 'mayalin',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should access /api/auth/me with valid Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.username).toBe('mayalin');
  });

  it('should reject access to protected endpoint without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate via demo-login endpoint and return valid demo session', async () => {
    const res = await request(app).post('/api/auth/demo-login').send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    expect(res.body.isDemo).toBe(true);

    // Verify token can access protected /me route
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.role).toBe('admin');
  });

  it('should list available demo profiles via /api/auth/demo-users', async () => {
    const res = await request(app).get('/api/auth/demo-users');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.demoUsers)).toBe(true);
    expect(res.body.demoUsers.length).toBeGreaterThanOrEqual(4);
  });
});
