import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const College = sequelize.define('College', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  financial_aid_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  form_selector_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'manual',
    comment: 'manual, collegeboard, or other source',
  },
  scraped_at: {
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
  tableName: 'colleges',
  timestamps: false,
});

export default College;
