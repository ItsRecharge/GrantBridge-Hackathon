#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATASETS_DIR = path.join(__dirname, '../datasets');

/**
 * Create Kaggle dataset.json metadata
 */
function createKaggleMetadata(datasetName, description, version = 1) {
  const metadata = {
    title: datasetName,
    id: `${datasetName.toLowerCase().replace(/\s+/g, '-')}-v${version}`,
    licenses: [
      {
        name: 'CC0-1.0',
      },
    ],
    keywords: [
      'scholarships',
      'college-aid',
      'profiles',
      'financial-aid',
      'machine-learning',
      'education',
    ],
    collaborators: [],
    data: [],
  };

  return metadata;
}

/**
 * Prepare for Kaggle upload
 */
function prepareKaggleUpload(datasetName, description, version = 1) {
  const metadataPath = path.join(DATASETS_DIR, 'dataset-metadata.json');

  const metadata = createKaggleMetadata(datasetName, description, version);

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log('✅ Kaggle metadata created at:', metadataPath);
  console.log('\n📋 To upload to Kaggle:');
  console.log('   1. Install Kaggle CLI: pip install kaggle');
  console.log('   2. Configure credentials: kaggle api-token (from https://www.kaggle.com/settings/account)');
  console.log('   3. Upload dataset:');
  console.log(`      cd ${DATASETS_DIR}`);
  console.log(`      kaggle datasets create -p .`);
  console.log('\n   For updating existing dataset:');
  console.log('      kaggle datasets version --path . -m "Updated with new samples"');
}

/**
 * Create README for dataset
 */
function createDatasetReadme() {
  const readmePath = path.join(DATASETS_DIR, 'README.md');

  const readme = `# Scholarship Profiles & Match Dataset

## Overview
This dataset contains **1000 synthetic student profiles**, **1000 scholarships**, and their **match scores**.

It was generated using the Divergent College Aid platform's data generation toolkit and is designed for:
- Machine learning model training for scholarship recommendation systems
- Financial aid analysis and prediction
- Student-scholarship matching algorithms
- Educational research

## Dataset Contents

### Files
- \`scholarship-profiles-dataset.json\` - Complete dataset with profiles, scholarships, and match scores
- \`scholarship-profiles-dataset.csv\` - Flattened CSV format for use in spreadsheets and ML frameworks
- \`profiles.json\` - Student profiles only (1000 records)
- \`scholarships.json\` - Scholarships only (1000 records)
- \`dataset-stats.json\` - Statistical summary of the dataset

### Schema

#### Profile Object
\`\`\`json
{
  "full_name": "string",
  "age": "number (17-25)",
  "gender": "male|female|other",
  "ethnicity": ["array of ethnicities"],
  "citizenship_status": "US Citizen|Permanent Resident|International",
  "gpa": "number (2.0-4.0)",
  "sat_score": "number (400-1600) or null",
  "act_score": "number (1-36) or null",
  "major": "string",
  "graduation_year": "number",
  "family_income": "<$25k|$25k-$50k|$50k-$100k|$100k-$150k|>$150k",
  "household_size": "number",
  "state": "US State Code",
  "city": "string",
  "extracurriculars": ["array of activities"],
  "awards": ["array of achievements"]
}
\`\`\`

#### Scholarship Object
\`\`\`json
{
  "title": "string",
  "provider": "string",
  "description": "string",
  "amount": "number (USD)",
  "deadline": "YYYY-MM-DD",
  "eligibility_criteria": {
    "min_gpa": "number or null",
    "majors": ["array of eligible majors"],
    "citizenship": "US Citizen|Any|...",
    "states": ["eligible state codes"],
    "demographics": ["target demographics"],
    "awards": ["required achievements"]
  }
}
\`\`\`

#### Match Score
- **Range**: 0-100
- **Calculation**: Based on GPA, major, citizenship, state, demographics, and achievements
- **match_reasons**: Array of strings explaining the match score

## CSV Columns

Profile-related:
- \`profile_name\`, \`profile_age\`, \`profile_gender\`
- \`profile_gpa\`, \`profile_sat_score\`, \`profile_act_score\`
- \`profile_major\`, \`profile_graduation_year\`
- \`profile_family_income\`, \`profile_household_size\`
- \`profile_state\`, \`profile_city\`
- \`profile_extracurriculars\`, \`profile_awards\`

Scholarship-related:
- \`scholarship_title\`, \`scholarship_provider\`
- \`scholarship_amount\`, \`scholarship_deadline\`
- \`scholarship_min_gpa\`, \`scholarship_eligible_majors\`
- \`scholarship_citizenship\`, \`scholarship_states\`

Match-related:
- \`match_score\` - The target variable (0-100)
- \`match_reasons\` - Feature importance indicators

## Statistics

This dataset includes:
- **1000** student profiles with diverse backgrounds
- **1000** scholarships from various providers
- **1000** profile-scholarship pairs with calculated match scores
- **Average match score**: ~55.8% (see dataset-stats.json for details)

### Diversity Features
- Multiple ethnicities represented
- Various family income levels
- Different geographic locations (15+ states)
- Multiple majors (20+ fields of study)
- Citizenship status variations

## Usage Examples

### Python (Pandas)
\`\`\`python
import pandas as pd

# Load dataset
df = pd.read_csv('scholarship-profiles-dataset.csv')

# Get high-match scholarships
high_matches = df[df['match_score'] >= 80]

# Analyze by major
engineering_scholarships = df[df['profile_major'] == 'Engineering']
\`\`\`

### Python (JSON)
\`\`\`python
import json

with open('scholarship-profiles-dataset.json', 'r') as f:
    data = json.load(f)

for record in data[:10]:
    print(f"{record['profile']['full_name']}: {record['match']}/100")
\`\`\`

### SQL
\`\`\`sql
-- If imported to a database
SELECT 
  profile_name,
  profile_gpa,
  scholarship_title,
  match_score
FROM scholarship_matches
WHERE match_score >= 80
ORDER BY match_score DESC;
\`\`\`

## Data Quality

- ✅ No missing values in critical fields
- ✅ All GPA values within valid range (2.0-4.0)
- ✅ All match scores validated (0-100)
- ✅ All names validated (realistic first/last name combinations)
- ✅ All amounts within realistic range ($500-$50,000)

## Generation Method

This dataset was generated using the Divergent College Aid platform's dataset generation toolkit:

1. **Local Generation**: Fast, deterministic, no external API required
2. **Profile Generation**: Based on realistic distributions of demographics
3. **Scholarship Generation**: Based on real scholarship patterns
4. **Match Calculation**: Multi-factor matching algorithm based on:
   - GPA requirements
   - Major eligibility
   - Citizenship status
   - Geographic eligibility
   - Demographic targeting
   - Achievement requirements

## Use Cases

### Machine Learning
- Train recommendation systems
- Predict scholarship eligibility
- Build matching algorithms
- Feature engineering practice

### Analysis
- Scholarship distribution analysis
- Student demographic patterns
- Financial aid gap analysis
- Geographic scholarship availability

### Application Development
- Test scholarship matching features
- Database seeding
- Performance testing
- UI/UX prototyping

## License
CC0-1.0 (Public Domain)

## Citation
If you use this dataset in research, please cite:
\`\`\`bibtex
@dataset{divergent_scholarship_dataset_2024,
  title={Scholarship Profiles & Match Dataset},
  year={2024},
  publisher={Kaggle},
  url={https://www.kaggle.com/datasets/...}
}
\`\`\`

## Contact
For questions or improvements, please open an issue on the Divergent College Aid GitHub repository.

---

**Generated**: ${new Date().toISOString()}
**Format Version**: 1.0
**Total Records**: 1000
`;

  fs.writeFileSync(readmePath, readme);
  console.log('✅ Dataset README created at:', readmePath);
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: node prepare-kaggle.js [options]

Options:
  --name       Dataset name (default: "Scholarship Profiles & Match Dataset")
  --version    Version number (default: 1)
  --help       Show this help message

Examples:
  node prepare-kaggle.js
  node prepare-kaggle.js --name "College Aid Dataset" --version 2
    `);
    return;
  }

  const nameIdx = args.indexOf('--name');
  const name = nameIdx !== -1 ? args[nameIdx + 1] : 'Scholarship Profiles & Match Dataset';

  const versionIdx = args.indexOf('--version');
  const version = versionIdx !== -1 ? parseInt(args[versionIdx + 1]) : 1;

  const description =
    'Dataset of 1000 student profiles, scholarships, and their match scores for ML training.';

  console.log('🎓 Preparing dataset for Kaggle upload...\n');

  // Create metadata
  prepareKaggleUpload(name, description, version);

  // Create README
  createDatasetReadme();

  console.log('\n✅ Dataset ready for Kaggle!');
  console.log(`📍 Location: ${DATASETS_DIR}`);
}

main();
