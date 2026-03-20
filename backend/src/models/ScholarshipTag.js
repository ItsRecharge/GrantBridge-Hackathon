import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Scholarship from './Scholarship.js';
import Tag from './Tag.js';

const ScholarshipTag = sequelize.define('ScholarshipTag', {
  scholarship_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
}, {
  tableName: 'scholarship_tags',
  timestamps: false,
});

export default ScholarshipTag;
