/**
 * Extract tags and eligibility criteria using seed data
 * For production, replace with actual Ollama implementation
 */
export const extractScholarshipTags = async (scholarshipData) => {
  const { title, description } = scholarshipData;

  // Default seed tags for different scholarship types
  const seedTags = {
    STEM: { category: 'academic' },
    Engineering: { category: 'academic' },
    Business: { category: 'academic' },
    Health: { category: 'academic' },
    Arts: { category: 'interest' },
    Women: { category: 'demographic' },
    'First-generation': { category: 'demographic' },
    Minorities: { category: 'demographic' },
    Veterans: { category: 'demographic' },
    Leadership: { category: 'interest' },
    'Community Service': { category: 'interest' },
    Sports: { category: 'interest' },
    'Low-income': { category: 'special' },
    Disability: { category: 'special' },
  };

  // Simple keyword matching for mock tag extraction
  const titleLower = title.toLowerCase();
  const descriptionLower = description?.toLowerCase() || '';
  const fullText = titleLower + ' ' + descriptionLower;

  const detectedTags = [];

  if (fullText.includes('stem') || fullText.includes('science') || fullText.includes('technology')) {
    detectedTags.push('STEM');
  }
  if (fullText.includes('engineer')) {
    detectedTags.push('Engineering');
  }
  if (fullText.includes('business')) {
    detectedTags.push('Business');
  }
  if (fullText.includes('health') || fullText.includes('medical') || fullText.includes('nursing')) {
    detectedTags.push('Health');
  }
  if (fullText.includes('art') || fullText.includes('music') || fullText.includes('design')) {
    detectedTags.push('Arts');
  }
  if (fullText.includes('women') || fullText.includes('girls')) {
    detectedTags.push('Women');
  }
  if (fullText.includes('first-generation') || fullText.includes('first generation')) {
    detectedTags.push('First-generation');
  }
  if (fullText.includes('minority') || fullText.includes('minorities') || fullText.includes('underrepresented')) {
    detectedTags.push('Minorities');
  }
  if (fullText.includes('veteran') || fullText.includes('military')) {
    detectedTags.push('Veterans');
  }
  if (fullText.includes('leadership')) {
    detectedTags.push('Leadership');
  }
  if (fullText.includes('community') || fullText.includes('volunteer')) {
    detectedTags.push('Community Service');
  }
  if (fullText.includes('sport') || fullText.includes('athlete')) {
    detectedTags.push('Sports');
  }
  if (fullText.includes('financial need') || fullText.includes('low-income') || fullText.includes('low income')) {
    detectedTags.push('Low-income');
  }
  if (fullText.includes('disability') || fullText.includes('disabled')) {
    detectedTags.push('Disability');
  }

  // Default tags if none detected
  if (detectedTags.length === 0) {
    detectedTags.push('Leadership', 'Community Service');
  }

  return {
    tags: detectedTags,
    eligibility: {
      education_level: ['undergraduate', 'graduate'],
    },
  };
};

/**
 * Batch extract tags for multiple scholarships
 */
export const extractTagsBatch = async (scholarships) => {
  const results = [];

  for (const scholarship of scholarships) {
    const tags = await extractScholarshipTags(scholarship);
    results.push({
      ...scholarship,
      ...tags,
    });

    // Rate limiting - wait between API calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
};
