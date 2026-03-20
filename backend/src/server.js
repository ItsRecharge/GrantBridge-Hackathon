import dotenv from 'dotenv';
import sequelize from './config/database.js';
import redis from './config/redis.js';
import app from './app.js';
import logger from './utils/logger.js';
import { ensureCollegesAreCached } from './controllers/collegeScraperController.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const getSyncOptions = () => {
  const mode = String(process.env.DB_SYNC_MODE || 'safe').toLowerCase();

  if (mode === 'alter') {
    return { alter: true };
  }

  if (mode === 'force') {
    return { force: true };
  }

  return undefined;
};

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Sync database models safely by default.
    // Use DB_SYNC_MODE=alter or DB_SYNC_MODE=force only when explicitly needed.
    const syncOptions = getSyncOptions();
    await sequelize.sync(syncOptions);

    const syncModeLabel = syncOptions?.alter
      ? 'alter'
      : syncOptions?.force
      ? 'force'
      : 'safe';
    logger.info(`Database models synchronized (mode: ${syncModeLabel})`);

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connected successfully');

    // Cache colleges from College Board
    await ensureCollegesAreCached();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
