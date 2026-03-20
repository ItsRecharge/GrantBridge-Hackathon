import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Scholarship from './Scholarship.js';

const UserScholarshipMatch = sequelize.define('UserScholarshipMatch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  scholarship_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  match_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  match_reasons: {
    type: DataTypes.JSONB,
    defaultValue: [],
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
  tableName: 'user_scholarship_matches',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['match_score'],
    },
  ],
});

export default UserScholarshipMatch;
