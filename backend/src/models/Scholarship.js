import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Scholarship = sequelize.define('Scholarship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  eligibility_criteria: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
  scraped_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'scholarships',
  timestamps: false,
  indexes: [
    {
      fields: ['deadline'],
    },
    {
      fields: ['is_active'],
    },
  ],
});

export default Scholarship;
