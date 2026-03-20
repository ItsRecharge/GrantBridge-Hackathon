import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import College from './College.js';

const UserCollege = sequelize.define('UserCollege', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  college_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  application_status: {
    type: DataTypes.STRING,
    defaultValue: 'prospect',
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  added_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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
  tableName: 'user_colleges',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['college_id'],
    },
    {
      fields: ['user_id', 'college_id'],
      unique: true,
    },
  ],
});

export default UserCollege;
