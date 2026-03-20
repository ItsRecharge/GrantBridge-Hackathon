import { openaiChat } from '../../config/openai.js';
import redis from '../../config/redis.js';
import { College } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Search for colleges using AI and web search
 * Returns college data and caches it in Redis
 */
export const searchCollegesAI = async (query, limit = 10) => {
  // Check cache first
  const cacheKey = `colleges:search:${query.toLowerCase()}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    logger.info(`Cache hit for college search: ${query}`);
    return JSON.parse(cached);
  }

  try {
    // Use AI to generate college suggestions based on search query
    const colleges = await generateCollegeSuggestions(query, limit);

    // Cache results for 24 hours
    await redis.setex(cacheKey, 86400, JSON.stringify(colleges));

    logger.info(`Found ${colleges.length} colleges for query: ${query}`);

    return colleges;
  } catch (error) {
    logger.error('Error searching colleges:', error);
    throw new Error(`Failed to search colleges: ${error.message}`);
  }
};

/**
 * Generate college suggestions using OpenAI
 * This uses AI to suggest colleges matching the user's search
 */
export const generateCollegeSuggestions = async (query, limit = 10) => {
  try {
    const content = await openaiChat({
      messages: [
        {
          role: 'user',
          content: `Find ${limit} colleges that match this search: "${query}"

Return a JSON array of colleges with this format:
[
  {
    "name": "College Name",
    "state": "CA",
    "type": "Private",
    "url": "https://example.edu",
    "financial_aid_url": "https://example.edu/financial-aid"
  }
]

Focus on well-known, accredited universities. Include the most relevant matches.`,
        },
      ],
      temperature: 0.7,
    });

    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const colleges = JSON.parse(jsonMatch[0]);

    // Save to database
    const savedColleges = [];
    for (const college of colleges) {
      try {
        // Check if already exists
        let dbCollege = await College.findOne({
          where: { name: college.name },
        });

        if (!dbCollege) {
          dbCollege = await College.create({
            name: college.name,
            state: college.state || 'Unknown',
            type: college.type || 'Unknown',
            url: college.url,
            financial_aid_url: college.financial_aid_url,
          });
        }

        savedColleges.push(dbCollege);
      } catch (error) {
        logger.warn(`Error saving college ${college.name}:`, error.message);
      }
    }

    return savedColleges;
  } catch (error) {
    logger.error('Error generating college suggestions:', error);
    throw error;
  }
};

/**
 * Get college details from database or search for it
 */
export const getOrSearchCollege = async (collegeName) => {
  // Check database first
  let college = await College.findOne({
    where: { name: collegeName },
  });

  if (college) {
    return college;
  }

  // If not found, search for it
  const results = await searchCollegesAI(collegeName, 1);

  if (results.length > 0) {
    return results[0];
  }

  throw new Error(`College "${collegeName}" not found`);
};

/**
 * Clear college search cache
 */
export const clearCollegeCache = async (query) => {
  const cacheKey = `colleges:search:${query.toLowerCase()}`;
  await redis.del(cacheKey);
  logger.info(`Cleared cache for: ${query}`);
};
