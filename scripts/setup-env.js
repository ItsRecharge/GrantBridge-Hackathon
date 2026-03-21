import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const envFiles = [
  {
    source: 'backend/.env.example',
    target: 'backend/.env',
    defaults: {
      NODE_ENV: 'development',
      PORT: '5000',
      CLIENT_URL: 'http://145.132.97.45:3000',
      DATABASE_URL: 'postgresql://postgres:postgres@145.132.97.45:5432/divergent_college',
      REDIS_URL: 'redis://145.132.97.45:6379',
      JWT_SECRET: 'dev-secret-key-change-in-production-' + Math.random().toString(36).substring(7),
      JWT_EXPIRES_IN: '7d',
      OLLAMA_BASE_URL: 'http://145.132.97.45:11434',
      PUPPETEER_HEADLESS: 'true',
      PUPPETEER_TIMEOUT: '30000',
      SCRAPING_MAX_SCHOLARSHIPS: '100',
      SCRAPING_RATE_LIMIT_MS: '2000',
    },
  },
  {
    source: 'frontend/.env.example',
    target: 'frontend/.env',
    defaults: {
      VITE_API_URL: 'http://145.132.97.45:5001/api',
    },
  },
];

function createEnvFile(source, target, defaults) {
  const sourcePath = path.join(rootDir, source);
  const targetPath = path.join(rootDir, target);

  // Check if .env already exists
  if (fs.existsSync(targetPath)) {
    console.log(`✓ ${target} already exists, skipping`);
    return;
  }

  try {
    let content = '';

    // Read the example file if it exists
    if (fs.existsSync(sourcePath)) {
      content = fs.readFileSync(sourcePath, 'utf8');
    }

    // Add any missing defaults
    for (const [key, value] of Object.entries(defaults)) {
      if (!content.includes(key)) {
        content += `${key}=${value}\n`;
      }
    }

    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✓ Created ${target}`);
  } catch (error) {
    console.error(`✗ Error creating ${target}:`, error.message);
    process.exit(1);
  }
}

console.log('Setting up environment files...\n');

for (const envFile of envFiles) {
  createEnvFile(envFile.source, envFile.target, envFile.defaults);
}

console.log('\n✓ Environment setup complete!');
console.log('\nNote: Update the following in your .env files:');
console.log('  - OLLAMA_BASE_URL: Defaults to http://145.132.97.45:11434');
