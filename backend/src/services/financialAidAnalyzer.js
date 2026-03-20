import { openaiChat } from '../config/openai.js';
import logger from '../utils/logger.js';

/**
 * Generate financial aid analysis using OpenAI
 */
export const analyzeFinancialAid = async (userProfile, college) => {
  try {
    logger.info(`Analyzing financial aid for ${college.name}`);

    // Build context from user profile
    const profileContext = buildProfileContext(userProfile);
    const collegeContext = buildCollegeContext(college);

    // Create prompt
    const prompt = createAnalysisPrompt(profileContext, collegeContext);

    logger.info('Sending prompt to OpenAI...');

    const responseText = await openaiChat({
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = parseAnalysisResponse(responseText);
    logger.info('Financial aid analysis completed');

    return analysis;
  } catch (error) {
    logger.error('OpenAI financial aid analysis failed:', error.message);
    // Return default analysis if OpenAI fails
    return getDefaultAnalysis(userProfile, college);
  }
};

/**
 * Build context from user profile
 */
const buildProfileContext = (profile) => {
  return {
    income: profile.family_income || 'Not provided',
    gpa: profile.gpa_weighted || profile.gpa_unweighted || profile.gpa || 'Not provided',
    test_scores: {
      sat: profile.sat_score,
      act: profile.act_score,
    },
    state: profile.state || 'Not provided',
    first_generation: profile.special_circumstances?.first_generation || false,
    family_size: profile.household_size || 'Not provided',
  };
};

/**
 * Build context from college data
 */
const buildCollegeContext = (college) => {
  return {
    name: college.name,
    type: college.type || 'Unknown',
    state: college.state,
    website: college.url,
  };
};

/**
 * Create analysis prompt
 */
const createAnalysisPrompt = (profile, college) => {
  return `You are a financial aid counselor analyzing college affordability for a student.

Student Profile:
- Household Income: $${profile.income}
- GPA: ${profile.gpa}
- SAT Score: ${profile.test_scores.sat || 'Not provided'}
- ACT Score: ${profile.test_scores.act || 'Not provided'}
- State: ${profile.state}
- First Generation: ${profile.first_generation ? 'Yes' : 'No'}
- Family Size: ${profile.family_size}

College:
- Name: ${college.name}
- Type: ${college.type}
- State: ${college.state}

Based on this student profile and college, provide a comprehensive financial aid analysis.

You MUST respond with ONLY valid JSON in exactly this format (no other text, no markdown):
{
  "estimated_tuition": <number, annual tuition in dollars>,
  "estimated_room_board": <number, annual room and board in dollars>,
  "estimated_total_cost": <number, tuition + room_board>,
  "estimated_grants": <number, estimated total grant/scholarship aid in dollars>,
  "estimated_loans": <number, estimated loan amount in dollars>,
  "estimated_work_study": <number, estimated work-study in dollars>,
  "estimated_net_price": <number, total_cost minus grants minus work_study>,
  "estimated_demonstrated_need": <number, total_cost minus expected family contribution based on the income range provided>,
  "key_insights": [<string>, <string>, <string>],
  "recommendations": [<string>, <string>, <string>, <string>, <string>],
  "raw_analysis": "<one paragraph summary of the analysis>"
}

Use realistic estimates based on college type (public/private), location, and the student's financial profile.`;
};

/**
 * Parse OpenAI JSON response into structured data
 */
const parseAnalysisResponse = (response) => {
  try {
    // Strip markdown code fences if present
    const cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      raw_analysis: parsed.raw_analysis || response,
      estimated_tuition: parsed.estimated_tuition || null,
      estimated_room_board: parsed.estimated_room_board || null,
      estimated_total_cost: parsed.estimated_total_cost || null,
      estimated_grants: parsed.estimated_grants || null,
      estimated_loans: parsed.estimated_loans || null,
      estimated_work_study: parsed.estimated_work_study || null,
      estimated_net_price: parsed.estimated_net_price || null,
      estimated_demonstrated_need: parsed.estimated_demonstrated_need || null,
      key_insights: Array.isArray(parsed.key_insights) ? parsed.key_insights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (error) {
    logger.warn('Failed to parse OpenAI JSON response, using fallback:', error.message);
    return {
      raw_analysis: response,
      estimated_tuition: null,
      estimated_room_board: null,
      estimated_total_cost: null,
      estimated_grants: null,
      estimated_loans: null,
      estimated_work_study: null,
      estimated_net_price: null,
      key_insights: ['Financial analysis completed. Review the full analysis below.'],
      recommendations: [
        'Complete the FAFSA for federal aid consideration',
        'Contact the financial aid office for personalized estimates',
        'Look into state-specific aid programs',
      ],
    };
  }
};

/**
 * Default analysis when OpenAI is unavailable
 */
const getDefaultAnalysis = (profile, college) => {
  logger.info('Using default financial aid estimates');

  const isPrivate = college.type?.toLowerCase().includes('private');
  const avgTuition = isPrivate ? 38000 : 10000;
  const roomBoard = 15000;
  const totalCost = avgTuition + roomBoard;

  let estimatedGrants = 0;
  const income = parseInt(profile.household_income) || 50000;

  if (income < 30000) estimatedGrants = totalCost * 0.6;
  else if (income < 60000) estimatedGrants = totalCost * 0.4;
  else if (income < 100000) estimatedGrants = totalCost * 0.2;
  else estimatedGrants = 0;

  const estimatedLoans = Math.max(0, totalCost * 0.3);
  const netPrice = totalCost - estimatedGrants - estimatedLoans;

  return {
    estimated_tuition: avgTuition,
    estimated_room_board: roomBoard,
    estimated_total_cost: totalCost,
    estimated_grants: Math.round(estimatedGrants),
    estimated_loans: Math.round(estimatedLoans),
    estimated_net_price: Math.round(netPrice),
    key_insights: [
      'These are estimated figures based on college type and income level',
      'Actual aid may vary based on merit and specific institutional policies',
      'Contact the college directly for accurate estimates',
    ],
    recommendations: [
      'Complete the FAFSA as early as possible',
      'Apply for scholarships specific to your background and interests',
      'Contact the financial aid office for personalized estimates',
      'Consider part-time work or work-study opportunities',
      'Explore federal loan options if needed',
    ],
    note: 'Using default estimates - OpenAI not available',
  };
};
