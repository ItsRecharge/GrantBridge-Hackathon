import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Scholarship from './Scholarship.js';

const UserScholarshipSwipe = sequelize.define('UserScholarshipSwipe', {
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
  swipe_direction: {
    type: DataTypes.ENUM('like', 'dislike'),
    allowNull: false,
  },
  swiped_at: {
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
  tableName: 'user_scholarship_swipes',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['scholarship_id'],
    },
    {
      fields: ['swipe_direction'],
    },
    {
      fields: ['user_id', 'scholarship_id'],
      unique: true,
    },
  ],
});

export default UserScholarshipSwipe;
