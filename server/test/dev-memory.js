/**
 * Dev convenience: run the API against an in-memory MongoDB.
 * Useful when MongoDB isn't installed locally. Data is lost on exit.
 *
 *   npm run dev:memory
 */
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');

(async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT} (in-memory MongoDB — data resets on restart)`);
  });
})();
