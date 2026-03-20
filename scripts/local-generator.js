/**
 * Local Dataset Generator - No LLM Required
 * Generates realistic data using templates and randomization
 */

const FIRST_NAMES = [
  'John', 'Emma', 'Michael', 'Sarah', 'David', 'Jessica', 'James', 'Jennifer', 'Robert', 'Mary',
  'William', 'Patricia', 'Richard', 'Linda', 'Joseph', 'Barbara', 'Thomas', 'Elizabeth', 'Charles', 'Susan',
  'Christopher', 'Jessica', 'Daniel', 'Sarah', 'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Lisa',
  'Priya', 'Raj', 'Hassan', 'Amara', 'Wei', 'Kim', 'Carlos', 'Maria', 'Kenji', 'Aisha',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Patel', 'Chen', 'Kumar', 'Nguyen', 'Kim', 'Singh', 'Wang', 'Flores', 'Rivera',
];

const SCHOLARSHIP_NAMES = [
  'Merit Scholar Award',
  'Excellence in STEM',
  'Future Leaders Grant',
  'Community Service Fellowship',
  'First Generation Scholarship',
  'Diversity & Inclusion Award',
  'Women in Technology',
  'Entrepreneurship Grant',
  'Social Justice Scholarship',
  'Environmental Innovation Fund',
  'Health Sciences Award',
  'Business Excellence Scholar',
  'Arts & Humanities Grant',
  'Engineering Innovation Prize',
  'Education Leadership Award',
];

const SCHOLARSHIP_PROVIDERS = [
  'National Merit Scholarship Corporation',
  'Gates Foundation',
  'College Board',
  'American Association of University Women',
  'Hispanic Scholarship Fund',
  'Asian Pacific American Scholarship Fund',
  'United Negro College Fund',
  'Point Foundation',
  'Paul & Daisy Soros Fellowships',
  'Fulbright Program',
  'Bursar Scholarship',
  'Department of Education',
  'State Educational Agency',
  'Private Corporations',
  'University Specific',
];

const MAJORS = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Medicine/Pre-Med',
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
  'Finance',
  'Marketing',
];

const ETHNICITIES_LIST = [
  'Caucasian',
  'African American',
  'Hispanic/Latino',
  'Asian',
  'Native American',
  'Pacific Islander',
  'Middle Eastern',
  'Multi-racial',
];

const EXTRACURRICULARS_LIST = [
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
  'Debate',
  'Fencing',
  'Swimming',
  'Soccer',
  'Basketball',
  'Orchestra',
  'Band',
  'Choir',
];

const AWARDS = [
  'National Merit Scholar',
  'AP Scholar',
  'Valedictorian',
  'Salutatorian',
  'All-State Athlete',
  'County Science Fair Winner',
  'Community Service Award',
  'Leadership Award',
  'DARE Essay Winner',
  'Debate Champion',
];

const STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA'];

const CITIES = {
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'Oakland', 'Sacramento'],
  TX: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
  FL: ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'Fort Lauderdale'],
  IL: ['Chicago', 'Springfield', 'Peoria', 'Champaign'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Harrisburg'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
  GA: ['Atlanta', 'Augusta', 'Savannah', 'Athens'],
  NC: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham'],
  MI: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing'],
};

const FAMILY_INCOME_LEVELS = [
  '<$25,000',
  '$25,000-$50,000',
  '$50,000-$75,000',
  '$75,000-$100,000',
  '$100,000-$150,000',
  '>$150,000',
];

const CITIZENSHIP_STATUS = ['US Citizen', 'Permanent Resident', 'International'];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

function randomArray(array, min = 1, max = 5) {
  const count = randomRange(min, max);
  const selected = [];
  const copy = [...array];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    selected.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return selected;
}

function generateProfile() {
  const major = randomElement(MAJORS);
  const state = randomElement(STATES);
  const gpa = parseFloat((randomRange(2.0, 4.0) + Math.random()).toFixed(2));

  return {
    full_name: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
    age: randomRange(17, 25),
    gender: randomElement(['male', 'female', 'other']),
    ethnicity: randomArray(ETHNICITIES_LIST, 1, 2),
    citizenship_status: randomElement(CITIZENSHIP_STATUS),
    gpa,
    sat_score: randomBoolean(0.6) ? randomRange(1000, 1600) : null,
    act_score: randomBoolean(0.6) ? randomRange(18, 36) : null,
    major,
    graduation_year: new Date().getFullYear() + randomRange(0, 4),
    family_income: randomElement(FAMILY_INCOME_LEVELS),
    household_size: randomRange(1, 10),
    state,
    city: randomElement(CITIES[state] || ['Unknown']),
    extracurriculars: randomArray(EXTRACURRICULARS_LIST, 2, 5),
    awards: randomBoolean(0.6) ? randomArray(AWARDS, 1, 3) : [],
  };
}

function generateScholarship() {
  const majors = randomBoolean(0.7) ? [] : randomArray(MAJORS, 1, 3);
  const states = randomBoolean(0.6) ? [] : randomArray(STATES, 1, 5);
  const amount = randomRange(500, 50000);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + randomRange(30, 365));

  return {
    title: `${randomElement(SCHOLARSHIP_NAMES)} - ${randomRange(2024, 2026)}`,
    provider: randomElement(SCHOLARSHIP_PROVIDERS),
    description: `Scholarship for outstanding students pursuing higher education. ${randomBoolean()}`,
    amount,
    deadline: deadline.toISOString().split('T')[0],
    eligibility_criteria: {
      min_gpa: randomBoolean(0.7) ? parseFloat((randomRange(2.5, 3.8) + Math.random()).toFixed(2)) : null,
      majors: majors,
      citizenship: randomElement(['US Citizen', 'Any']),
      states: states,
      demographics: randomBoolean(0.5) ? randomArray(ETHNICITIES_LIST, 1, 2) : [],
      awards: randomBoolean(0.4) ? randomArray(AWARDS, 1, 2) : [],
    },
  };
}

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
  } else if (profile.gpa >= 3.0) {
    score += 10;
    reasons.push('Good GPA');
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
  } else {
    score += 5;
    reasons.push('Open to any major');
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
    }
  }

  // Demographic match
  if (
    scholarship.eligibility_criteria?.demographics &&
    scholarship.eligibility_criteria.demographics.length > 0
  ) {
    const matches = scholarship.eligibility_criteria.demographics.filter((d) =>
      profile.ethnicity.some((pe) => pe.toLowerCase().includes(d.toLowerCase()))
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
    const matches = scholarship.eligibility_criteria.awards.filter((a) =>
      profile.awards.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
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

  // Random variation to make it realistic
  const variation = randomRange(-5, 5);
  score += variation;

  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}

export { generateProfile, generateScholarship, calculateMatchScore };
