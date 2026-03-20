// Scholarship seeder - populates initial scholarship data with tags
// Run via: node -e "import('./seeders/20250228-seed-scholarships.js').then(m => m.up())"
// Or via the admin panel scrape trigger

import sequelize from '../config/database.js';
import { Scholarship, Tag, ScholarshipTag } from '../models/index.js';

const TAGS = [
  // Academic
  { id: 'tag-0001-0000-0000-000000000001', name: 'STEM', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000002', name: 'Engineering', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000003', name: 'Business', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000004', name: 'Healthcare', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000005', name: 'Education', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000006', name: 'Arts', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000007', name: 'Law', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000008', name: 'Computer Science', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000009', name: 'Mathematics', category: 'academic' },
  { id: 'tag-0001-0000-0000-000000000010', name: 'Environmental Science', category: 'academic' },
  // Demographic
  { id: 'tag-0002-0000-0000-000000000001', name: 'Women', category: 'demographic' },
  { id: 'tag-0002-0000-0000-000000000002', name: 'Minorities', category: 'demographic' },
  { id: 'tag-0002-0000-0000-000000000003', name: 'First-Generation', category: 'demographic' },
  { id: 'tag-0002-0000-0000-000000000004', name: 'Low-Income', category: 'demographic' },
  { id: 'tag-0002-0000-0000-000000000005', name: 'Veterans', category: 'demographic' },
  { id: 'tag-0002-0000-0000-000000000006', name: 'International Students', category: 'demographic' },
  // Interest
  { id: 'tag-0003-0000-0000-000000000001', name: 'Community Service', category: 'interest' },
  { id: 'tag-0003-0000-0000-000000000002', name: 'Leadership', category: 'interest' },
  { id: 'tag-0003-0000-0000-000000000003', name: 'Research', category: 'interest' },
  // Location
  { id: 'tag-0004-0000-0000-000000000001', name: 'California', category: 'location' },
  { id: 'tag-0004-0000-0000-000000000002', name: 'Texas', category: 'location' },
  { id: 'tag-0004-0000-0000-000000000003', name: 'National', category: 'location' },
];

const SCHOLARSHIPS = [
  {
    id: 'sch-00001-0000-0000-000000000001',
    title: 'Gates Scholarship',
    description: 'The Gates Scholarship is a highly selective, full scholarship for exceptional, Pell-eligible, minority high school seniors who will be first-generation college students. Recipients receive full funding for their college education.',
    amount: 50000,
    amount_text: 'Full cost of attendance (up to $50,000/yr)',
    deadline: new Date('2026-09-15'),
    url: 'https://www.thegatesscholarship.org/scholarship',
    provider: 'Bill & Melinda Gates Foundation',
    eligibility_criteria: { gpa: 3.3, status: 'High school senior', ethnicity: 'Minority' },
    is_active: true,
    tags: ['STEM', 'Minorities', 'First-Generation', 'Low-Income', 'Leadership'],
  },
  {
    id: 'sch-00001-0000-0000-000000000002',
    title: 'Coca-Cola Scholars Program',
    description: 'One of the most prestigious achievement-based scholarship programs in the United States. 150 college juniors are awarded annually based on character, leadership, and academic excellence.',
    amount: 20000,
    amount_text: '$20,000',
    deadline: new Date('2026-10-01'),
    url: 'https://www.coca-colascholarsfoundation.org/apply/',
    provider: 'Coca-Cola Scholars Foundation',
    eligibility_criteria: { gpa: 3.0, status: 'High school senior' },
    is_active: true,
    tags: ['Leadership', 'Community Service', 'National'],
  },
  {
    id: 'sch-00001-0000-0000-000000000003',
    title: 'AAUW Career Development Grant',
    description: 'Career Development Grants provide funding for women who hold a bachelor\'s degree and are preparing to advance or change careers or re-enter the workforce.',
    amount: 12000,
    amount_text: '$2,000–$12,000',
    deadline: new Date('2026-11-15'),
    url: 'https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/career-development-grants/',
    provider: 'American Association of University Women',
    eligibility_criteria: { gender: 'Female', degree: "Bachelor's" },
    is_active: true,
    tags: ['Women', 'Education', 'Leadership'],
  },
  {
    id: 'sch-00001-0000-0000-000000000004',
    title: 'National Merit Scholarship',
    description: 'The National Merit Scholarship Program is an academic competition for recognition and scholarships. High school students who take the PSAT/NMSQT may enter the competition.',
    amount: 2500,
    amount_text: '$2,500',
    deadline: new Date('2026-12-31'),
    url: 'https://www.nationalmerit.org/s/1758/start.aspx',
    provider: 'National Merit Scholarship Corporation',
    eligibility_criteria: { test: 'PSAT/NMSQT', status: 'High school student' },
    is_active: true,
    tags: ['Mathematics', 'National', 'Research'],
  },
  {
    id: 'sch-00001-0000-0000-000000000005',
    title: 'Dell Scholars Program',
    description: 'The Dell Scholars Program recognizes students who have overcome significant obstacles to pursue their educational goals. Recipients receive $20,000, a laptop, textbook credits, and case management support.',
    amount: 20000,
    amount_text: '$20,000 + laptop + textbook credits',
    deadline: new Date('2026-12-01'),
    url: 'https://www.dellscholars.org/scholarship/',
    provider: 'Michael & Susan Dell Foundation',
    eligibility_criteria: { gpa: 2.4, income: 'Low income', status: 'High school senior' },
    is_active: true,
    tags: ['First-Generation', 'Low-Income', 'STEM', 'Computer Science'],
  },
  {
    id: 'sch-00001-0000-0000-000000000006',
    title: 'Hispanic Scholarship Fund',
    description: 'HSF is the nation\'s largest not-for-profit organization supporting Hispanic American higher education. Scholarships are awarded to students of Hispanic heritage working towards their first undergraduate or graduate degree.',
    amount: 5000,
    amount_text: '$500–$5,000',
    deadline: new Date('2026-02-15'),
    url: 'https://www.hsf.net/scholarship',
    provider: 'Hispanic Scholarship Fund',
    eligibility_criteria: { ethnicity: 'Hispanic/Latino', gpa: 3.0 },
    is_active: true,
    tags: ['Minorities', 'First-Generation', 'National'],
  },
  {
    id: 'sch-00001-0000-0000-000000000007',
    title: 'Google Generation Scholarship',
    description: 'Google\'s Generation Scholarship aims to help aspiring computer scientists excel in technology and become leaders in the field. Focus is on students who serve as role models for diversity, equity, and inclusion.',
    amount: 10000,
    amount_text: '$10,000',
    deadline: new Date('2026-12-04'),
    url: 'https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship',
    provider: 'Google',
    eligibility_criteria: { major: 'Computer Science or related', gpa: 3.0 },
    is_active: true,
    tags: ['Computer Science', 'STEM', 'Minorities', 'Women', 'Leadership'],
  },
  {
    id: 'sch-00001-0000-0000-000000000008',
    title: 'Siemens Competition in Math, Science & Technology',
    description: 'The Siemens Competition honors exceptional high school students who demonstrate superior academic ability and creativity in the natural sciences, mathematics, or technology.',
    amount: 100000,
    amount_text: 'Up to $100,000',
    deadline: new Date('2026-09-30'),
    url: 'https://www.siemens-foundation.org/programs/the-siemens-competition-in-math-science-technology/',
    provider: 'Siemens Foundation',
    eligibility_criteria: { status: 'High school student', subject: 'STEM' },
    is_active: true,
    tags: ['STEM', 'Mathematics', 'Engineering', 'Research', 'National'],
  },
  {
    id: 'sch-00001-0000-0000-000000000009',
    title: 'AES Engineering Scholarships',
    description: 'AES Engineering offers scholarships to students considering a career in engineering, recognizing academic achievement and commitment to the field.',
    amount: 2500,
    amount_text: '$2,500',
    deadline: new Date('2026-10-15'),
    url: 'https://www.aesengineers.com/scholarships.htm',
    provider: 'AES Engineering',
    eligibility_criteria: { major: 'Engineering', gpa: 3.0 },
    is_active: true,
    tags: ['Engineering', 'STEM', 'Research'],
  },
  {
    id: 'sch-00001-0000-0000-000000000010',
    title: 'Jeannette Rankin Women\'s Scholarship',
    description: 'The Jeannette Rankin Women\'s Scholarship Fund supports the educational advancement of low-income women 35 years or older who are pursuing technical or vocational training, an associate\'s degree, or their first bachelor\'s degree.',
    amount: 2000,
    amount_text: 'Up to $2,000',
    deadline: new Date('2026-03-01'),
    url: 'https://rankinfoundation.org/students/apply-for-a-scholarship/',
    provider: 'Jeannette Rankin Foundation',
    eligibility_criteria: { gender: 'Female', age: '35+', income: 'Low income' },
    is_active: true,
    tags: ['Women', 'Low-Income', 'Education'],
  },
  {
    id: 'sch-00001-0000-0000-000000000011',
    title: 'Udall Undergraduate Scholarship',
    description: 'The Udall Scholarship is for college sophomores and juniors who commit to careers related to the environment, tribal public policy, or Native American health care.',
    amount: 7000,
    amount_text: '$7,000',
    deadline: new Date('2026-03-06'),
    url: 'https://www.udall.gov/OurPrograms/Scholarship/Scholarship.aspx',
    provider: 'U.S. Congress / Udall Foundation',
    eligibility_criteria: { year: 'Sophomore or Junior', major: 'Environment or Tribal Policy' },
    is_active: true,
    tags: ['Environmental Science', 'Community Service', 'National'],
  },
  {
    id: 'sch-00001-0000-0000-000000000012',
    title: 'Jack Kent Cooke Foundation College Scholarship',
    description: 'The Jack Kent Cooke Foundation College Scholarship Program is an undergraduate scholarship program available to high-achieving high school seniors with financial need who seek to attend and graduate from the nation\'s best four-year colleges and universities.',
    amount: 40000,
    amount_text: 'Up to $40,000/year',
    deadline: new Date('2026-11-20'),
    url: 'https://www.jkcf.org/our-scholarships/college-scholarship-program/',
    provider: 'Jack Kent Cooke Foundation',
    eligibility_criteria: { gpa: 3.5, status: 'High school senior', income: 'Low-to-middle income' },
    is_active: true,
    tags: ['First-Generation', 'Low-Income', 'Leadership', 'Community Service', 'National'],
  },
  {
    id: 'sch-00001-0000-0000-000000000013',
    title: 'Society of Women Engineers Scholarship',
    description: 'SWE offers scholarships to identify and recognize exceptional female engineering and computer science students. Scholarships range from $1,000 to $17,000.',
    amount: 17000,
    amount_text: '$1,000–$17,000',
    deadline: new Date('2026-02-01'),
    url: 'https://swe.org/scholarships/',
    provider: 'Society of Women Engineers',
    eligibility_criteria: { gender: 'Female', major: 'Engineering or Computer Science' },
    is_active: true,
    tags: ['Women', 'Engineering', 'Computer Science', 'STEM'],
  },
  {
    id: 'sch-00001-0000-0000-000000000014',
    title: 'Ron Brown Scholar Program',
    description: 'The Ron Brown Scholar Program seeks to identify African-American high school seniors who will make significant contributions to the society. Recipients receive $10,000/year for four years.',
    amount: 40000,
    amount_text: '$10,000/year for 4 years',
    deadline: new Date('2026-01-09'),
    url: 'https://www.ronbrown.org/section/apply/program-description',
    provider: 'Ron Brown Scholar Fund',
    eligibility_criteria: { ethnicity: 'African-American', status: 'High school senior' },
    is_active: true,
    tags: ['Minorities', 'Leadership', 'Community Service', 'National'],
  },
  {
    id: 'sch-00001-0000-0000-000000000015',
    title: 'California Student Aid Commission Cal Grant',
    description: 'Cal Grants are California\'s primary state scholarship program that helps students pay for college. Funding amounts vary based on institution type and applicant eligibility.',
    amount: 12570,
    amount_text: 'Up to $12,570',
    deadline: new Date('2026-03-02'),
    url: 'https://www.csac.ca.gov/cal-grants',
    provider: 'California Student Aid Commission',
    eligibility_criteria: { state: 'California', status: 'Undergraduate student', income: 'Income-based' },
    is_active: true,
    tags: ['California', 'Low-Income', 'First-Generation'],
  },
];

export const up = async () => {
  const transaction = await sequelize.transaction();
  try {
    const now = new Date();

    // Upsert tags
    for (const tag of TAGS) {
      await Tag.upsert(
        { ...tag, created_at: now, updated_at: now },
        { transaction }
      );
    }

    // Build tag name → id map
    const tagMap = Object.fromEntries(TAGS.map(t => [t.name, t.id]));

    // Upsert scholarships and their tag associations
    for (const { tags: tagNames, ...scholarshipData } of SCHOLARSHIPS) {
      await Scholarship.upsert(
        { ...scholarshipData, scraped_at: now, created_at: now, updated_at: now },
        { transaction }
      );

      // Associate tags
      for (const tagName of tagNames) {
        const tagId = tagMap[tagName];
        if (tagId) {
          await ScholarshipTag.upsert(
            { scholarship_id: scholarshipData.id, tag_id: tagId },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();
    console.log(`✅ Seeded ${SCHOLARSHIPS.length} scholarships and ${TAGS.length} tags`);
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Scholarship seeder failed:', err.message);
    throw err;
  }
};

export const down = async () => {
  const transaction = await sequelize.transaction();
  try {
    const ids = SCHOLARSHIPS.map(s => s.id);
    const tagIds = TAGS.map(t => t.id);

    await ScholarshipTag.destroy({ where: { scholarship_id: ids }, transaction });
    await Scholarship.destroy({ where: { id: ids }, transaction });
    await Tag.destroy({ where: { id: tagIds }, transaction });

    await transaction.commit();
    console.log('✅ Scholarship seed data removed');
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
