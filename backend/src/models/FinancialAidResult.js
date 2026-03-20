import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import College from './College.js';

const FinancialAidResult = sequelize.define('FinancialAidResult', {
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
  estimated_grant_aid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estimated_loan_amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estimated_work_study: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_cost_of_attendance: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  net_price: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  result_data: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
  form_filled_at: {
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
  tableName: 'financial_aid_results',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['college_id'],
    },
  ],
});

export default FinancialAidResult;
