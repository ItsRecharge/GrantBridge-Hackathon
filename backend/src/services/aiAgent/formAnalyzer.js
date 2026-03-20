import { openaiChat } from '../../config/openai.js';

/**
 * Analyze a college financial aid form using OpenAI
 * Takes HTML content and returns structured field data
 */
export const analyzeFinancialAidForm = async (pageContent, pageUrl) => {
  try {
    const content = await openaiChat({
      messages: [
        {
          role: 'user',
          content: `You are analyzing a college financial aid form. Extract all form fields visible in this HTML content.

For each field, provide:
- field_name: Human readable name
- field_type: text, number, select, radio, checkbox, email, etc.
- field_id: HTML id or name attribute if visible
- required: true/false if marked as required
- description: What this field is asking for

Return as JSON array of objects. Only include actual form input fields.
URL: ${pageUrl}

HTML Content:
${pageContent}`,
        },
      ],
    });

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing form:', error);
    throw new Error(`Failed to analyze form: ${error.message}`);
  }
};

/**
 * Map user profile data to form fields
 * Uses OpenAI to intelligently match profile fields to form fields
 */
export const mapProfileToFormFields = async (formFields, userProfile) => {
  try {
    const content = await openaiChat({
      messages: [
        {
          role: 'user',
          content: `You are mapping user profile data to college financial aid form fields.

Form fields:
${JSON.stringify(formFields, null, 2)}

User profile:
${JSON.stringify(userProfile, null, 2)}

For each form field, provide the value from the user profile that should fill it.
Return as JSON object where keys are field_name and values are the data to fill.
If a field has no matching profile data, use null.

Example format:
{
  "First Name": "John",
  "Annual Income": "45000",
  "State": "CA"
}`,
        },
      ],
    });

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not extract JSON mapping from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error mapping profile to form:', error);
    throw new Error(`Failed to map profile: ${error.message}`);
  }
};

/**
 * Extract financial aid results from a results page
 * Uses OpenAI to parse the page content
 */
export const extractFinancialAidResults = async (pageContent, pageUrl) => {
  try {
    const content = await openaiChat({
      messages: [
        {
          role: 'user',
          content: `You are reading a college financial aid results page. Extract the following values if visible:
- Grant Aid (scholarships/grants)
- Loan Amount
- Work-Study
- Total Cost of Attendance
- Net Price (Cost - Aid)

Return as JSON object with numeric values (numbers only, no $ or commas).
If a value is not visible, use null.

Example:
{
  "grant_aid": 25000,
  "loan_amount": 7000,
  "work_study": 3000,
  "total_cost": 60000,
  "net_price": 25000
}

Page URL: ${pageUrl}
Page Content:
${pageContent}`,
        },
      ],
    });

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not extract results JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting results:', error);
    throw new Error(`Failed to extract results: ${error.message}`);
  }
};
