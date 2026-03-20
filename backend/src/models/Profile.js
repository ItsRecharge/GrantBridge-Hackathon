import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ethnicity: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
  },
  citizenship_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gpa: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  gpa_weighted: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  gpa_unweighted: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
  },
  sat_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  act_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  major: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  graduation_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  current_education_level: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  high_school: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  family_income: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  household_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  num_dependents: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zip_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  extracurriculars: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
  },
  awards: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
  },
  special_circumstances: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
  self_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'profiles',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
  ],
});

export default Profile;
