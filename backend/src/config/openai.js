import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Send a chat completion request to OpenAI
 * @param {Object} options - { model, messages, temperature }
 * @returns {string} The assistant's response content
 */
export const openaiChat = async ({ model = DEFAULT_MODEL, messages, temperature = 0.7 }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const response = await axios.post(
    OPENAI_API_URL,
    { model, messages, temperature },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
};

export default openaiChat;
