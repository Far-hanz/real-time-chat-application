/**
 * Smoke test for the auth + user endpoints.
 * Runs against an in-memory MongoDB, so no local Mongo install is needed.
 *
 *   npm run smoke
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const assert = require('assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');

const BASE = '/api';
let server;
let baseUrl;

const api = async (method, url, { token, body } = {}) => {
  const res = await fetch(`${baseUrl}${BASE}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

async function run() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  // health
  let r = await api('GET', '/health');
  assert.equal(r.status, 200, 'health check');

  // register
  r = await api('POST', '/auth/register', {
    body: { name: 'Saud', email: 'saud@test.com', password: 'secret123' },
  });
  assert.equal(r.status, 201, `register: ${JSON.stringify(r.data)}`);
  assert.ok(r.data.token, 'register returns token');
  assert.equal(r.data.user.email, 'saud@test.com');
  assert.equal(r.data.user.isOnline, true);
  assert.equal(r.data.user.password, undefined, 'password never exposed');
  const token = r.data.token;

  // duplicate email rejected
  r = await api('POST', '/auth/register', {
    body: { name: 'Saud 2', email: 'SAUD@test.com', password: 'secret123' },
  });
  assert.equal(r.status, 409, 'duplicate email rejected (case-insensitive)');

  // invalid body rejected
  r = await api('POST', '/auth/register', { body: { email: 'x@test.com' } });
  assert.equal(r.status, 400, 'missing fields rejected');

  // login wrong password
  r = await api('POST', '/auth/login', {
    body: { email: 'saud@test.com', password: 'wrongpass' },
  });
  assert.equal(r.status, 401, 'wrong password rejected');

  // login correct
  r = await api('POST', '/auth/login', {
    body: { email: 'saud@test.com', password: 'secret123' },
  });
  assert.equal(r.status, 200, 'login works');
  assert.ok(r.data.token, 'login returns token');

  // /users/me without token
  r = await api('GET', '/users/me');
  assert.equal(r.status, 401, 'protected route requires token');

  // /users/me with token
  r = await api('GET', '/users/me', { token });
  assert.equal(r.status, 200, 'me works');
  assert.equal(r.data.user.name, 'Saud');

  // update profile
  r = await api('PUT', '/users/me', {
    token,
    body: { name: 'Saud Satopay', avatar: 'https://example.com/a.png' },
  });
  assert.equal(r.status, 200, 'profile update works');
  assert.equal(r.data.user.name, 'Saud Satopay');
  assert.equal(r.data.user.avatar, 'https://example.com/a.png');

  // change password requires correct current password
  r = await api('PUT', '/users/me', {
    token,
    body: { currentPassword: 'nope', newPassword: 'newsecret123' },
  });
  assert.equal(r.status, 401, 'wrong current password rejected');

  r = await api('PUT', '/users/me', {
    token,
    body: { currentPassword: 'secret123', newPassword: 'newsecret123' },
  });
  assert.equal(r.status, 200, 'password change works');

  r = await api('POST', '/auth/login', {
    body: { email: 'saud@test.com', password: 'newsecret123' },
  });
  assert.equal(r.status, 200, 'login with new password works');

  // second user + listing
  r = await api('POST', '/auth/register', {
    body: { name: 'Farhan', email: 'farhan@test.com', password: 'secret123' },
  });
  const otherId = r.data.user._id;

  r = await api('GET', '/users', { token });
  assert.equal(r.status, 200, 'users list works');
  assert.equal(r.data.users.length, 1, 'list excludes the requester');
  assert.equal(r.data.users[0].name, 'Farhan');

  r = await api('GET', `/users/${otherId}`, { token });
  assert.equal(r.status, 200, 'get user by id works');

  r = await api('GET', '/users/not-a-valid-id', { token });
  assert.equal(r.status, 400, 'invalid id handled');

  // logout
  r = await api('POST', '/auth/logout', { token });
  assert.equal(r.status, 200, 'logout works');

  r = await api('GET', '/users/me', { token });
  assert.equal(r.data.user.isOnline, false, 'logout marks user offline');
  assert.ok(r.data.user.lastSeen, 'lastSeen recorded');

  console.log('\n✅ All auth smoke tests passed\n');

  server.close();
  await mongoose.disconnect();
  await mongo.stop();
}

run().catch(async (err) => {
  console.error('\n❌ Smoke test failed:', err.message, '\n');
  if (server) server.close();
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
