import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FinancialAidReport = sequelize.define('FinancialAidReport', {
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
  college_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Financial estimates (in dollars)
  estimated_tuition: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estimated_room_board: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estimated_total_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estimated_grants: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estimated_loans: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estimated_work_study: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estimated_net_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  // AI Analysis
  ai_analysis: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
    comment: 'Contains AI insights about affordability, aid eligibility, etc.',
  },
  // Recommendations
  recommendations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    comment: 'Array of recommendations from AI',
  },
  // Analysis details
  analysis_basis: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User profile data used for analysis',
  },
  report_html: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Formatted HTML report',
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
  tableName: 'financial_aid_reports',
  timestamps: false,
});

export default FinancialAidReport;
