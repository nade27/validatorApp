const request = require('supertest');
const express = require('express');
const app = express();
const authRoutes = require('../routes/authRoutes');

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  test('Register - missing fields should return 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ NIP: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  test('Register - duplicate NIP should return 400', async () => {
    // First register
    await request(app).post('/api/auth/register').send({
      NIP: 'testnip',
      nama: 'Test User',
      email: 'test@example.com',
      password: 'password',
      role: 'Admin',
      dept: 'IT'
    });

    // Second register with same NIP
    const res = await request(app).post('/api/auth/register').send({
      NIP: 'testnip',
      nama: 'Test User 2',
      email: 'test2@example.com',
      password: 'password',
      role: 'Admin',
      dept: 'IT'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('NIP already registered');
  });

  test('Login - missing fields should return 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ NIP: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('NIP and password are required');
  });

  test('Login - invalid credentials should return 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ NIP: 'nonexistent', password: 'wrong' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  // Additional tests for successful login can be added if needed
});
