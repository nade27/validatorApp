process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const dataRoutes = require('../routes/dataRoutes');
const authRoutes = require('../routes/authRoutes');
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Helper to generate JWT token with role
const generateToken = (role) => {
  return jwt.sign({ id: 1, NIP: '123', role: role, dept: 'dept' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Data Routes', () => {
  test('should deny access without token', async () => {
    const res = await request(app).post('/api/data/insert').send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Access token missing');
  });

  test('should deny access with invalid role', async () => {
    const token = generateToken('User');
    const res = await request(app)
      .post('/api/data/insert')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Access denied: insufficient permissions');
  });

  test('should return 400 if required fields missing', async () => {
    const token = generateToken('Admin');
    const res = await request(app)
      .post('/api/data/insert')
      .set('Authorization', `Bearer ${token}`)
      .send({ nopol: 'AB123' }); // incomplete data
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  // Additional tests for successful insert can be added here if DB is mocked or test DB is available
});
