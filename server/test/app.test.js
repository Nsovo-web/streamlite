import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

test('health check returns ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('register rejects a short password', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: '123' });
  assert.equal(res.status, 400);
});

test('register rejects an invalid email', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'not-an-email', password: 'longenough1' });
  assert.equal(res.status, 400);
});

test('protected routes require a cookie', async () => {
  for (const path of ['/api/profiles', '/api/movies/trending', '/api/auth/me']) {
    const res = await request(app).get(path);
    assert.equal(res.status, 401, path);
  }
});

test('unknown routes return 404', async () => {
  const res = await request(app).get('/api/nope');
  assert.equal(res.status, 404);
});