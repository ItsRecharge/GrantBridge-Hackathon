import puppeteer from 'puppeteer';
import { analyzeFinancialAidForm, mapProfileToFormFields, extractFinancialAidResults } from './formAnalyzer.js';

/**
 * Launch a Puppeteer browser instance with sensible defaults
 */
export const launchBrowser = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: parseInt(process.env.PUPPETEER_TIMEOUT || '30000'),
    });
    return browser;
  } catch (error) {
    console.error('Failed to launch browser:', error);
    throw new Error('Failed to launch browser for form filling');
  }
};

/**
 * Take a screenshot of the current page
 */
export const takeScreenshot = async (page) => {
  try {
    const screenshot = await page.screenshot({ encoding: 'base64' });
    return screenshot;
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    throw error;
  }
};

/**
 * Fill a form field intelligently based on field type
 */
export const fillFormField = async (page, fieldName, value) => {
  if (!value) return; // Skip empty values

  try {
    // Try to find by exact name
    let selector = `input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`;
    let elements = await page.$$(selector);

    if (elements.length === 0) {
      // Try to find by partial match
      selector = `input[name*="${fieldName}"], select[name*="${fieldName}"]`;
      elements = await page.$$(selector);
    }

    if (elements.length === 0) {
      console.warn(`Could not find field: ${fieldName}`);
      return false;
    }

    const element = elements[0];
    const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);

    if (tagName === 'select') {
      // Handle select dropdowns
      await element.select(String(value));
    } else if (tagName === 'input') {
      const inputType = await page.evaluate(el => el.type, element);

      if (inputType === 'checkbox' || inputType === 'radio') {
        // Handle checkboxes and radio buttons
        if (value === true || value === 'true' || value === 'yes') {
          await element.click();
        }
      } else {
        // Handle text, email, number inputs
        await element.type(String(value), { delay: 50 });
      }
    } else if (tagName === 'textarea') {
      // Handle textareas
      await element.type(String(value), { delay: 50 });
    }

    return true;
  } catch (error) {
    console.error(`Error filling field ${fieldName}:`, error);
    return false;
  }
};

/**
 * Fill multiple form fields on a page
 */
export const fillFormFields = async (page, fieldMappings) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const [fieldName, value] of Object.entries(fieldMappings)) {
    const success = await fillFormField(page, fieldName, value);
    if (success) {
      results.successful.push(fieldName);
    } else {
      results.failed.push(fieldName);
    }
  }

  return results;
};

/**
 * Submit a form on the page
 */
export const submitForm = async (page) => {
  try {
    // Find and click the submit button
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Submit")');

    if (!submitButton) {
      console.warn('No submit button found');
      return false;
    }

    await submitButton.click();

    // Wait for navigation or new content
    await Promise.race([
      page.waitForNavigation({ timeout: 10000 }).catch(() => null),
      page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 }).catch(() => null),
    ]);

    return true;
  } catch (error) {
    console.error('Error submitting form:', error);
    return false;
  }
};

/**
 * Main function: Fill and submit a college financial aid form
 */
export const fillFinancialAidForm = async (collegeUrl, userProfile) => {
  let browser = null;
  let page = null;

  try {
    // Launch browser
    browser = await launchBrowser();
    page = await browser.newPage();

    // Navigate to college URL
    console.log(`Navigating to ${collegeUrl}`);
    await page.goto(collegeUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Take screenshot and analyze form
    console.log('Taking screenshot and analyzing form...');
    const screenshot = await takeScreenshot(page);
    const formFields = await analyzeFinancialAidForm(screenshot, collegeUrl);

    console.log(`Found ${formFields.length} form fields`);

    if (formFields.length === 0) {
      throw new Error('No form fields found on page');
    }

    // Map user profile to form fields
    console.log('Mapping user profile to form fields...');
    const fieldMappings = await mapProfileToFormFields(formFields, userProfile);

    // Fill form fields
    console.log('Filling form fields...');
    const fillResults = await fillFormFields(page, fieldMappings);
    console.log(`Filled ${fillResults.successful.length} fields, ${fillResults.failed.length} failed`);

    // Submit form
    console.log('Submitting form...');
    const submitted = await submitForm(page);

    if (!submitted) {
      console.warn('Form submission may have failed');
    }

    // Wait a bit for results to load
    await page.waitForTimeout(3000);

    // Capture results screenshot
    console.log('Capturing results...');
    const resultsScreenshot = await takeScreenshot(page);

    // Extract financial aid results
    const results = await extractFinancialAidResults(resultsScreenshot, page.url());

    return {
      success: true,
      results,
      formFieldsFilled: fillResults.successful.length,
      url: page.url(),
    };
  } catch (error) {
    console.error('Error filling financial aid form:', error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
