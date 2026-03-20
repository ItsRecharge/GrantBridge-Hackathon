import User from './User.js';
import Profile from './Profile.js';
import College from './College.js';
import Scholarship from './Scholarship.js';
import Tag from './Tag.js';
import ScholarshipTag from './ScholarshipTag.js';
import FinancialAidResult from './FinancialAidResult.js';
import FinancialAidReport from './FinancialAidReport.js';
import UserScholarshipMatch from './UserScholarshipMatch.js';
import ScrapingJob from './ScrapingJob.js';
import UserCollege from './UserCollege.js';
import UserScholarshipSwipe from './UserScholarshipSwipe.js';

// Define relationships after all models are imported
// Profile relationships
Profile.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasOne(Profile, { foreignKey: 'user_id' });

// UserCollege relationships
UserCollege.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserCollege.belongsTo(College, { foreignKey: 'college_id', onDelete: 'CASCADE' });
User.hasMany(UserCollege, { foreignKey: 'user_id' });
College.hasMany(UserCollege, { foreignKey: 'college_id' });

// UserScholarshipSwipe relationships
UserScholarshipSwipe.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserScholarshipSwipe.belongsTo(Scholarship, { foreignKey: 'scholarship_id', onDelete: 'CASCADE' });
User.hasMany(UserScholarshipSwipe, { foreignKey: 'user_id' });
Scholarship.hasMany(UserScholarshipSwipe, { foreignKey: 'scholarship_id' });

// FinancialAidResult relationships
FinancialAidResult.belongsTo(User, { foreignKey: 'user_id' });
FinancialAidResult.belongsTo(College, { foreignKey: 'college_id' });
User.hasMany(FinancialAidResult, { foreignKey: 'user_id' });
College.hasMany(FinancialAidResult, { foreignKey: 'college_id' });

// UserScholarshipMatch relationships
UserScholarshipMatch.belongsTo(User, { foreignKey: 'user_id' });
UserScholarshipMatch.belongsTo(Scholarship, { foreignKey: 'scholarship_id' });
User.hasMany(UserScholarshipMatch, { foreignKey: 'user_id' });
Scholarship.hasMany(UserScholarshipMatch, { foreignKey: 'scholarship_id' });

// ScholarshipTag relationships (many-to-many)
Scholarship.belongsToMany(Tag, {
  through: ScholarshipTag,
  foreignKey: 'scholarship_id',
  otherKey: 'tag_id',
});
Tag.belongsToMany(Scholarship, {
  through: ScholarshipTag,
  foreignKey: 'tag_id',
  otherKey: 'scholarship_id',
});

export {
  User,
  Profile,
  College,
  Scholarship,
  Tag,
  ScholarshipTag,
  FinancialAidResult,
  FinancialAidReport,
  UserScholarshipMatch,
  ScrapingJob,
  UserCollege,
  UserScholarshipSwipe,
};
