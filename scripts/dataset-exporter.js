import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Simple CSV formatter
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(headers, rows) {
  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = rows.map((row) => headers.map((h) => escapeCSV(row[h])).join(',')).join('\n');
  return headerRow + '\n' + dataRows;
}

/**
 * Convert dataset JSON to CSV format
 */
export function exportToCSV(dataset, outputPath) {
  const OUTPUT_DIR = path.dirname(outputPath);

  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Flatten dataset for CSV
  const flatData = dataset.map((item, idx) => ({
    id: item.id || idx + 1,
    profile_name: item.profile.full_name,
    profile_age: item.profile.age,
    profile_gender: item.profile.gender,
    profile_ethnicity: Array.isArray(item.profile.ethnicity)
      ? item.profile.ethnicity.join('|')
      : item.profile.ethnicity,
    profile_citizenship: item.profile.citizenship_status,
    profile_gpa: item.profile.gpa,
    profile_sat_score: item.profile.sat_score || '',
    profile_act_score: item.profile.act_score || '',
    profile_major: item.profile.major,
    profile_graduation_year: item.profile.graduation_year,
    profile_family_income: item.profile.family_income,
    profile_household_size: item.profile.household_size,
    profile_state: item.profile.state,
    profile_city: item.profile.city || '',
    profile_extracurriculars: Array.isArray(item.profile.extracurriculars)
      ? item.profile.extracurriculars.join('|')
      : '',
    profile_awards: Array.isArray(item.profile.awards) ? item.profile.awards.join('|') : '',
    scholarship_title: item.scholarship.title,
    scholarship_provider: item.scholarship.provider,
    scholarship_amount: item.scholarship.amount,
    scholarship_deadline: item.scholarship.deadline,
    scholarship_min_gpa: item.scholarship.eligibility_criteria?.min_gpa || '',
    scholarship_eligible_majors: Array.isArray(
      item.scholarship.eligibility_criteria?.majors
    )
      ? item.scholarship.eligibility_criteria.majors.join('|')
      : '',
    scholarship_citizenship: item.scholarship.eligibility_criteria?.citizenship || '',
    scholarship_states: Array.isArray(item.scholarship.eligibility_criteria?.states)
      ? item.scholarship.eligibility_criteria.states.join('|')
      : '',
    match_score: item.match,
    match_reasons: Array.isArray(item.match_reasons)
      ? item.match_reasons.join('|')
      : item.match_reasons,
  }));

  const headers = Object.keys(flatData[0] || {});
  const csv = arrayToCSV(headers, flatData);
  fs.writeFileSync(outputPath, csv);

  console.log(`✅ CSV exported: ${outputPath}`);
  console.log(`📊 Records: ${flatData.length}`);
}

/**
 * Export specific dataset columns
 */
export function exportProfiles(dataset, outputPath) {
  const OUTPUT_DIR = path.dirname(outputPath);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const profiles = dataset.map((item) => item.profile);
  fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));
  console.log(`✅ Profiles exported: ${outputPath}`);
}

export function exportScholarships(dataset, outputPath) {
  const OUTPUT_DIR = path.dirname(outputPath);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const scholarships = dataset.map((item) => item.scholarship);
  fs.writeFileSync(outputPath, JSON.stringify(scholarships, null, 2));
  console.log(`✅ Scholarships exported: ${outputPath}`);
}

/**
 * Generate statistics about the dataset
 */
export function generateStats(dataset) {
  const stats = {
    total_records: dataset.length,
    average_match_score: (
      dataset.reduce((sum, item) => sum + item.match, 0) / dataset.length
    ).toFixed(2),
    match_score_distribution: {
      perfect: dataset.filter((item) => item.match === 100).length,
      excellent: dataset.filter((item) => item.match >= 80 && item.match < 100).length,
      good: dataset.filter((item) => item.match >= 60 && item.match < 80).length,
      fair: dataset.filter((item) => item.match >= 40 && item.match < 60).length,
      poor: dataset.filter((item) => item.match < 40).length,
    },
    profiles: {
      avg_gpa: (dataset.reduce((sum, item) => sum + item.profile.gpa, 0) / dataset.length).toFixed(
        2
      ),
      avg_age: Math.round(dataset.reduce((sum, item) => sum + item.profile.age, 0) / dataset.length),
      genders: [...new Set(dataset.map((item) => item.profile.gender))].length,
      ethnicities: [...new Set(dataset.flatMap((item) => item.profile.ethnicity))].length,
      majors: [...new Set(dataset.map((item) => item.profile.major))].length,
      states: [...new Set(dataset.map((item) => item.profile.state))].length,
    },
    scholarships: {
      avg_amount: Math.round(
        dataset.reduce((sum, item) => sum + item.scholarship.amount, 0) / dataset.length
      ),
      total_value: dataset.reduce((sum, item) => sum + item.scholarship.amount, 0),
      providers: [...new Set(dataset.map((item) => item.scholarship.provider))].length,
    },
  };

  return stats;
}

/**
 * Load existing dataset
 */
export function loadDataset(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export default {
  exportToCSV,
  exportProfiles,
  exportScholarships,
  generateStats,
  loadDataset,
};
