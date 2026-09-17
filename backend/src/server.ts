import app from './app';
import pool from './config/db';
import { applyMigrations } from './seeds/schema';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await applyMigrations(pool);
  } catch (err) {
    console.error('Failed to run database migrations:', err);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

