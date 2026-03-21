import axios from 'axios';

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const getClientConfig = ({ model }) => {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';

  if (azureEndpoint && azureApiKey && azureDeployment) {
    const baseUrl = azureEndpoint.replace(/\/$/, '');
    return {
      url: `${baseUrl}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureApiVersion}`,
      headers: {
        'api-key': azureApiKey,
        'Content-Type': 'application/json',
      },
      payload: {
        messages: model.messages,
        temperature: model.temperature,
      },
      provider: 'azure-openai',
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No AI provider configured. Set OPENAI_API_KEY for OpenAI, or AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_API_KEY + AZURE_OPENAI_DEPLOYMENT for Azure OpenAI.'
    );
  }

  return {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    payload: {
      model: model.name,
      messages: model.messages,
      temperature: model.temperature,
    },
    provider: 'openai',
  };
};

/**
 * Send a chat completion request to OpenAI
 * @param {Object} options - { model, messages, temperature }
 * @returns {string} The assistant's response content
 */
export const openaiChat = async ({ model = DEFAULT_MODEL, messages, temperature = 0.7 }) => {
  const config = getClientConfig({
    model: {
      name: model,
      messages,
      temperature,
    },
  });

  const response = await axios.post(
    config.url,
    config.payload,
    {
      headers: config.headers,
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
};

export default openaiChat;
