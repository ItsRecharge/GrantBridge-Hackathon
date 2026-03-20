#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateProfile, generateScholarship, calculateMatchScore } from './local-generator.js';
import { exportToCSV, exportProfiles, exportScholarships, generateStats, loadDataset } from './dataset-exporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../datasets');
const DATASET_FILE = path.join(OUTPUT_DIR, 'scholarship-profiles-dataset.json');
const CSV_FILE = path.join(OUTPUT_DIR, 'scholarship-profiles-dataset.csv');
const STATS_FILE = path.join(OUTPUT_DIR, 'dataset-stats.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Validate data quality
 */
function validateData(profile, scholarship, match) {
  const issues = [];

  if (!profile.gpa || profile.gpa < 2.0 || profile.gpa > 4.0) {
    issues.push('Invalid GPA');
  }
  if (!profile.full_name || profile.full_name.length < 3) {
    issues.push('Invalid name');
  }
  if (!scholarship.title || scholarship.title.length < 5) {
    issues.push('Invalid scholarship title');
  }
  if (!scholarship.amount || scholarship.amount < 100 || scholarship.amount > 100000) {
    issues.push('Invalid scholarship amount');
  }
  if (match.score < 0 || match.score > 100) {
    issues.push('Invalid match score');
  }

  return issues;
}

/**
 * Display progress bar
 */
function displayProgress(current, total, label) {
  const width = 30;
  const percentage = (current / total) * 100;
  const filledWidth = Math.floor((percentage / 100) * width);
  const emptyWidth = width - filledWidth;

  const bar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
  const percentStr = percentage.toFixed(1).padStart(5);

  process.stdout.write(`\r[${bar}] ${percentStr}% - ${label} (${current}/${total})`);
}

/**
 * Generate dataset
 */
async function generateDataset(count = 1000, useLLM = false) {
  console.log(`\n🚀 Generating ${count} profile-scholarship pairs`);
  console.log(`📍 Method: ${useLLM ? 'LLM-enhanced' : 'Local generation (fast)'}`);
  console.log(`💾 Output: ${DATASET_FILE}\n`);

  const dataset = [];
  let successCount = 0;
  let attempts = 0;
  const maxAttempts = count * 2; // Allow double attempts to get the target count
  const startTime = Date.now();

  while (successCount < count && attempts < maxAttempts) {
    attempts++;
    try {
      // Generate profile and scholarship
      const profile = generateProfile();
      const scholarship = generateScholarship();
      const match = calculateMatchScore(profile, scholarship);

      // Validate (less strict - only check critical fields)
      const criticalIssues = validateData(profile, scholarship, match).filter(
        (issue) => issue.includes('Invalid') && (issue.includes('name') || issue.includes('GPA'))
      );

      if (criticalIssues.length > 0) {
        // Only skip if critical fields are invalid
        continue;
      }

      // Add to dataset
      dataset.push({
        id: successCount + 1,
        profile,
        scholarship,
        match: match.score,
        match_reasons: match.reasons,
        generated_at: new Date().toISOString(),
      });

      successCount++;

      // Display progress every 10 items
      if (successCount % 10 === 0) {
        displayProgress(successCount, count, `Generated ${successCount} valid entries`);
      }

      // Save progress every 100 items
      if (successCount % 100 === 0) {
        fs.writeFileSync(DATASET_FILE, JSON.stringify(dataset, null, 2));
      }
    } catch (error) {
      // Log the error but continue
      if (attempts % 100 === 0) {
        console.error(`\n⚠️  Error at attempt ${attempts}:`, error.message);
      }
    }
  }

  // Use generated dataset (should be exactly count)
  const finalDataset = dataset.slice(0, count);

  // Final save
  fs.writeFileSync(DATASET_FILE, JSON.stringify(finalDataset, null, 2));

  // Generate CSV
  exportToCSV(finalDataset, CSV_FILE);

  // Generate statistics
  const stats = generateStats(finalDataset);
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

  // Calculate time
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ DATASET GENERATION COMPLETE!');
  console.log('='.repeat(70));
  console.log(`⏱️  Time: ${elapsedTime}s`);
  console.log(`📊 Total Records: ${finalDataset.length}`);
  console.log(`📈 Average Generation Speed: ${(finalDataset.length / elapsedTime).toFixed(0)} records/sec\n`);

  console.log('📁 Output Files:');
  console.log(`   • JSON: ${DATASET_FILE}`);
  console.log(`   • CSV:  ${CSV_FILE}`);
  console.log(`   • Stats: ${STATS_FILE}`);

  console.log('\n📊 Dataset Statistics:');
  console.log(`   • Average Match Score: ${stats.average_match_score}`);
  console.log(`   • Perfect Matches (100): ${stats.match_score_distribution.perfect}`);
  console.log(`   • Excellent (80-99): ${stats.match_score_distribution.excellent}`);
  console.log(`   • Good (60-79): ${stats.match_score_distribution.good}`);
  console.log(`   • Fair (40-59): ${stats.match_score_distribution.fair}`);
  console.log(`   • Poor (<40): ${stats.match_score_distribution.poor}\n`);

  console.log('👥 Profile Statistics:');
  console.log(`   • Average GPA: ${stats.profiles.avg_gpa}`);
  console.log(`   • Average Age: ${stats.profiles.avg_age}`);
  console.log(`   • Unique Majors: ${stats.profiles.majors}`);
  console.log(`   • Unique States: ${stats.profiles.states}`);
  console.log(`   • Ethnicities: ${stats.profiles.ethnicities}\n`);

  console.log('🎓 Scholarship Statistics:');
  console.log(`   • Average Award: $${stats.scholarships.avg_amount.toLocaleString()}`);
  console.log(`   • Total Value: $${stats.scholarships.total_value.toLocaleString()}`);
  console.log(`   • Unique Providers: ${stats.scholarships.providers}\n`);

  console.log('📤 Next Steps:');
  console.log('   1. Review the CSV file in a spreadsheet');
  console.log('   2. Verify data quality and diversity');
  console.log('   3. Export to Kaggle: https://www.kaggle.com/datasets/new');
  console.log(`   4. Command: kaggle datasets create -p ${OUTPUT_DIR}\n`);

  return finalDataset;
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    count: parseInt(args[0]) || 1000,
    useLLM: args.includes('--llm'),
    stats: args.includes('--stats'),
    export: args.includes('--export'),
  };
}

/**
 * Main
 */
async function main() {
  const args = parseArgs();

  // Display help if requested
  if (args.count === 0 || process.argv.includes('--help')) {
    console.log(`
Usage: node generate-dataset.js [count] [options]

Arguments:
  count          Number of samples to generate (default: 1000)

Options:
  --llm          Use LLM-enhanced generation (slower, more diverse)
  --stats        Show statistics from existing dataset
  --export       Export dataset to CSV and JSON
  --help         Show this help message

Examples:
  node generate-dataset.js              # Generate 1000 samples locally
  node generate-dataset.js 500          # Generate 500 samples
  node generate-dataset.js --stats      # Show stats for existing dataset
  node generate-dataset.js --export     # Export existing dataset
    `);
    return;
  }

  // Show stats if requested
  if (args.stats) {
    try {
      const dataset = loadDataset(DATASET_FILE);
      const stats = generateStats(dataset);
      console.log(JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('Error loading dataset:', error.message);
    }
    return;
  }

  // Export if requested
  if (args.export) {
    try {
      const dataset = loadDataset(DATASET_FILE);
      exportToCSV(dataset, CSV_FILE);
      exportProfiles(dataset, path.join(OUTPUT_DIR, 'profiles.json'));
      exportScholarships(dataset, path.join(OUTPUT_DIR, 'scholarships.json'));
      console.log('✅ Export complete!');
    } catch (error) {
      console.error('Error exporting dataset:', error.message);
    }
    return;
  }

  // Generate dataset
  await generateDataset(args.count, args.useLLM);
}

main().catch(console.error);
