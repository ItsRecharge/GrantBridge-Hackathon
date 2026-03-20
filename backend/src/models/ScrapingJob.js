import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScrapingJob = sequelize.define('ScrapingJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  job_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  target_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  result_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'scraping_jobs',
  timestamps: false,
});

export default ScrapingJob;
