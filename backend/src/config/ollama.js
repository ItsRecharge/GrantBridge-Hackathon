import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

/**
 * Send a chat completion request to Ollama's native API
 * @param {Object} options - { model, messages, max_tokens, temperature }
 * @returns {string} The assistant's response content
 */
export const ollamaChat = async ({ model = 'llama2:7b', messages, temperature }) => {
  const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
    model,
    messages,
    stream: false,
    ...(temperature !== undefined && {
      options: { temperature },
    }),
  });

  return response.data.message.content;
};

export default ollamaChat;
