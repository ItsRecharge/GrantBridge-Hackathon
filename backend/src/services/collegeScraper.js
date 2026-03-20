import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Scrape colleges from College Board BigFuture
 * Returns array of college objects with basic info
 */
export const scrapeCollegeBoard = async () => {
  const collegesFromScraper = [];

  try {
    logger.info('Attempting to fetch College Board colleges...');

    // Fetch the College Board page
    const response = await axios.get('https://bigfuture.collegeboard.org/colleges', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // Parse college data from HTML
    // Looking for college entries (adjust regex/parsing based on actual HTML structure)
    const collegeRegex = /<a[^>]*href="([^"]*colleges[^"]*)"[^>]*>(.*?)<\/a>/gi;
    const matches = html.matchAll(collegeRegex);

    for (const match of matches) {
      const url = match[1];
      const name = match[2]?.replace(/<[^>]*>/g, '').trim();

      if (name && url) {
        collegesFromScraper.push({
          name: name.substring(0, 255),
          website: url.startsWith('http') ? url : `https://bigfuture.collegeboard.org${url}`,
          source: 'collegeboard',
          scraped_at: new Date(),
        });
      }
    }

    logger.info(`Scraped ${collegesFromScraper.length} colleges from College Board`);
    return collegesFromScraper;
  } catch (error) {
    logger.warn('Failed to scrape College Board:', error.message);
    // Return fallback curated list if scraping fails
    return getDefaultColleges();
  }
};

/**
 * Default colleges to use as fallback
 * These are top colleges commonly searched
 */
const getDefaultColleges = () => {
  return [
    { name: 'Harvard University', website: 'https://www.harvard.edu', state: 'MA', college_type: 'Private' },
    { name: 'Stanford University', website: 'https://www.stanford.edu', state: 'CA', college_type: 'Private' },
    { name: 'MIT', website: 'https://www.mit.edu', state: 'MA', college_type: 'Private' },
    { name: 'California Institute of Technology', website: 'https://www.caltech.edu', state: 'CA', college_type: 'Private' },
    { name: 'Yale University', website: 'https://www.yale.edu', state: 'CT', college_type: 'Private' },
    { name: 'Princeton University', website: 'https://www.princeton.edu', state: 'NJ', college_type: 'Private' },
    { name: 'University of Pennsylvania', website: 'https://www.upenn.edu', state: 'PA', college_type: 'Private' },
    { name: 'Columbia University', website: 'https://www.columbia.edu', state: 'NY', college_type: 'Private' },
    { name: 'University of Chicago', website: 'https://www.uchicago.edu', state: 'IL', college_type: 'Private' },
    { name: 'Northwestern University', website: 'https://www.northwestern.edu', state: 'IL', college_type: 'Private' },
    { name: 'University of California, Berkeley', website: 'https://www.berkeley.edu', state: 'CA', college_type: 'Public' },
    { name: 'University of Michigan', website: 'https://www.umich.edu', state: 'MI', college_type: 'Public' },
    { name: 'University of Virginia', website: 'https://www.virginia.edu', state: 'VA', college_type: 'Public' },
    { name: 'UCLA', website: 'https://www.ucla.edu', state: 'CA', college_type: 'Public' },
    { name: 'University of Texas at Austin', website: 'https://www.utexas.edu', state: 'TX', college_type: 'Public' },
  ];
};

/**
 * Parse college data from HTML (enhanced parsing)
 */
const parseCollegeData = (html) => {
  const colleges = [];

  // Try multiple parsing strategies
  try {
    // Strategy 1: Look for structured data in JSON-LD or data attributes
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    const jsonMatches = html.matchAll(jsonLdRegex);

    for (const match of jsonMatches) {
      try {
        const data = JSON.parse(match[1]);
        if (data.name && (data.url || data.sameAs)) {
          colleges.push({
            name: data.name.substring(0, 255),
            website: data.url || data.sameAs,
            source: 'collegeboard',
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  } catch (error) {
    logger.warn('JSON-LD parsing failed');
  }

  return colleges.length > 0 ? colleges : getDefaultColleges();
};
