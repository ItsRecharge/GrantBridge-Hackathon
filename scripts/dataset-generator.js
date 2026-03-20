import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const TOTAL_SAMPLES = 1000;
const BATCH_SIZE = 1; // Process one at a time for quality control
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const USE_OPENAI = !!OPENAI_API_KEY;

// Output file
const OUTPUT_DIR = path.join(__dirname, '../datasets');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'scholarship-profiles-dataset.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Model data for variety
const MAJORS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Medicine',
  'Law',
  'Education',
  'Psychology',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Economics',
  'Political Science',
  'Nursing',
  'Architecture',
  'Environmental Science',
  'Data Science',
  'Artificial Intelligence',
];

const ETHNICITIES = [
  'Caucasian',
  'African American',
  'Hispanic/Latino',
  'Asian',
  'Native American',
  'Pacific Islander',
  'Middle Eastern',
  'Multi-racial',
];

const EXTRACURRICULARS = [
  'Debate Team',
  'Robotics Club',
  'Student Government',
  'Volunteer Work',
  'Sports',
  'Music',
  'Art',
  'Science Olympiad',
  'Model UN',
  'Coding Club',
  'Theater',
  'Chess Club',
  'Environmental Club',
  'Honor Society',
];

const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

const CITIES = {
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'Oakland'],
  TX: ['Houston', 'Dallas', 'Austin', 'San Antonio'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Albany'],
  FL: ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
};

/**
 * Call LLM to generate data
 */
async function callLLM(prompt) {
  try {
    if (USE_OPENAI) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );
      return response.data.choices[0].message.content;
    } else {
      // Try Ollama as fallback
      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/chat`,
        {
          model: 'mistral',
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        },
        { timeout: 60000 }
      );
      return response.data.message.content;
    }
  } catch (error) {
    console.error('LLM call failed:', error.message);
    return null;
  }
}

/**
 * Generate realistic profile using LLM
 */
async function generateProfile(index) {
  const prompt = `Generate a realistic student profile for a college scholarship dataset. Return ONLY valid JSON with these fields:
  {
    "full_name": "string",
    "age": number (17-25),
    "gender": "male|female|other",
    "ethnicity": ["array", "of", "ethnicities"],
    "citizenship_status": "US Citizen|Permanent Resident|International",
    "gpa": number (2.0-4.0),
    "sat_score": number (400-1600) or null,
    "act_score": number (1-36) or null,
    "major": "${MAJORS[Math.floor(Math.random() * MAJORS.length)]}",
    "graduation_year": number (${new Date().getFullYear()}-${new Date().getFullYear() + 5}),
    "family_income": "string (<$25k|$25k-$50k|$50k-$100k|>$100k)",
    "household_size": number (1-10),
    "state": "${STATES[Math.floor(Math.random() * STATES.length)]}",
    "extracurriculars": ["array", "of", "activities"],
    "awards": ["array", "of", "awards or achievements"]
  }
  Make it diverse and realistic.`;

  const response = await callLLM(prompt);
  if (!response) return null;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Failed to parse profile ${index}:`, error.message);
    return null;
  }
}

/**
 * Generate realistic scholarship using LLM
 */
async function generateScholarship(index) {
  const prompt = `Generate a realistic scholarship for a dataset. Return ONLY valid JSON with these fields:
  {
    "title": "string",
    "provider": "string",
    "description": "string (2-3 sentences)",
    "amount": number (500-50000),
    "deadline": "YYYY-MM-DD",
    "eligibility_criteria": {
      "min_gpa": number or null,
      "majors": ["array", "of", "eligible", "majors"] or [],
      "citizenship": "US Citizen|International|Any",
      "states": ["eligible", "states"] or [],
      "demographics": ["targeting", "demographics"] or [],
      "awards": ["required", "achievements"] or []
    }
  }
  Make it diverse - include merit-based, need-based, demographic-focused, and field-specific scholarships.`;

  const response = await callLLM(prompt);
  if (!response) return null;

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Failed to parse scholarship ${index}:`, error.message);
    return null;
  }
}

/**
 * Calculate match score between profile and scholarship
 */
function calculateMatchScore(profile, scholarship) {
  let score = 0;
  let reasons = [];

  // GPA match
  if (scholarship.eligibility_criteria?.min_gpa && profile.gpa) {
    if (profile.gpa >= scholarship.eligibility_criteria.min_gpa) {
      score += 25;
      reasons.push(`GPA meets requirement (${profile.gpa})`);
    } else {
      score -= 10;
    }
  } else if (profile.gpa >= 3.8) {
    score += 20;
    reasons.push('Excellent GPA');
  } else if (profile.gpa >= 3.5) {
    score += 15;
    reasons.push('Strong GPA');
  }

  // Major match
  if (
    scholarship.eligibility_criteria?.majors &&
    scholarship.eligibility_criteria.majors.length > 0
  ) {
    if (scholarship.eligibility_criteria.majors.includes(profile.major)) {
      score += 30;
      reasons.push(`Major match (${profile.major})`);
    }
  }

  // Citizenship match
  if (scholarship.eligibility_criteria?.citizenship) {
    if (scholarship.eligibility_criteria.citizenship === 'Any') {
      score += 5;
    } else if (scholarship.eligibility_criteria.citizenship === profile.citizenship_status) {
      score += 15;
      reasons.push('Citizenship requirement met');
    } else {
      score -= 20;
      reasons.push('Citizenship mismatch');
    }
  }

  // State match
  if (
    scholarship.eligibility_criteria?.states &&
    scholarship.eligibility_criteria.states.length > 0
  ) {
    if (scholarship.eligibility_criteria.states.includes(profile.state)) {
      score += 20;
      reasons.push(`State match (${profile.state})`);
    } else {
      score -= 15;
    }
  }

  // Demographic match
  if (
    scholarship.eligibility_criteria?.demographics &&
    scholarship.eligibility_criteria.demographics.length > 0
  ) {
    const demographics = Array.isArray(profile.ethnicity) ? profile.ethnicity : [profile.ethnicity];
    const matches = scholarship.eligibility_criteria.demographics.filter((d) =>
      demographics.some((pd) => pd.toLowerCase().includes(d.toLowerCase()))
    );
    if (matches.length > 0) {
      score += 15;
      reasons.push(`Demographic match: ${matches.join(', ')}`);
    }
  }

  // Award/achievement match
  if (
    scholarship.eligibility_criteria?.awards &&
    scholarship.eligibility_criteria.awards.length > 0
  ) {
    const profileAwards = profile.awards || [];
    const matches = scholarship.eligibility_criteria.awards.filter((a) =>
      profileAwards.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
    );
    if (matches.length > 0) {
      score += 15;
      reasons.push(`Achievement match: ${matches.join(', ')}`);
    }
  }

  // Extracurricular diversity bonus
  if (profile.extracurriculars && profile.extracurriculars.length >= 3) {
    score += 10;
    reasons.push('Strong extracurricular involvement');
  }

  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
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
 * Main generation loop
 */
async function generateDataset() {
  console.log(`🚀 Generating ${TOTAL_SAMPLES} profile-scholarship pairs...`);
  console.log(`Using: ${USE_OPENAI ? 'OpenAI (GPT-4o-mini)' : 'Ollama'}`);
  console.log('');

  const dataset = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= TOTAL_SAMPLES; i++) {
    try {
      // Generate profile and scholarship
      console.log(`[${i}/${TOTAL_SAMPLES}] Generating profile...`);
      const profile = await generateProfile(i);

      if (!profile) {
        console.log(`  ❌ Profile generation failed, retrying...`);
        failCount++;
        continue;
      }

      console.log(`  ✓ Profile: ${profile.full_name} (Major: ${profile.major}, GPA: ${profile.gpa})`);

      console.log(`[${i}/${TOTAL_SAMPLES}] Generating scholarship...`);
      const scholarship = await generateScholarship(i);

      if (!scholarship) {
        console.log(`  ❌ Scholarship generation failed, retrying...`);
        failCount++;
        continue;
      }

      console.log(`  ✓ Scholarship: "${scholarship.title}" ($${scholarship.amount})`);

      // Calculate match
      const match = calculateMatchScore(profile, scholarship);
      console.log(`  ✓ Match Score: ${match.score}/100 - ${match.reasons.slice(0, 2).join(', ')}`);

      // Validate
      const issues = validateData(profile, scholarship, match);
      if (issues.length > 0) {
        console.log(`  ⚠️  Validation issues: ${issues.join(', ')}`);
        console.log(`  Skipping this entry...`);
        failCount++;
        continue;
      }

      // Add to dataset
      dataset.push({
        id: i,
        profile,
        scholarship,
        match: match.score,
        match_reasons: match.reasons,
        generated_at: new Date().toISOString(),
      });

      successCount++;
      console.log(`  ✅ Added to dataset (${successCount} total)\n`);

      // Save progress every 50 items
      if (successCount % 50 === 0) {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataset, null, 2));
        console.log(`💾 Progress saved: ${successCount} samples\n`);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ❌ Error at index ${i}:`, error.message);
      failCount++;
    }
  }

  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataset, null, 2));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Dataset Generation Complete!');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log(`📊 Dataset size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review the generated dataset');
  console.log('2. Convert to CSV format if needed');
  console.log('3. Upload to Kaggle');
  console.log('');

  return dataset;
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateDataset().catch(console.error);
}

export { generateDataset, generateProfile, generateScholarship, calculateMatchScore };
