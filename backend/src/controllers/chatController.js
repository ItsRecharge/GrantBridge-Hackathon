import axios from 'axios';
import logger from '../utils/logger.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://145.132.97.45:11434';
const SCHOLARSHIP_CHAT_MODEL = process.env.SCHOLARSHIP_CHAT_MODEL || 'llama2:7b';
const SYSTEM_PROMPT = 'You are a terse scholarship advisor. Obey the user request, stay on-topic, and keep answers to <=3 short bullets (under 60 words total). No filler, no stories, no repeated intros. If you lack key info, ask one concise clarifying question instead of guessing. If off-topic, give one brief line then redirect back to scholarships/financial aid.';

export const streamScholarshipChat = async (req, res) => {
  const { question } = req.body || {};

  if (!question || !question.trim()) {
    return res.status(400).json({ message: 'question is required' });
  }

  logger.info('streamScholarshipChat start', {
    model: SCHOLARSHIP_CHAT_MODEL,
    ollama: OLLAMA_BASE_URL,
  });

  const abortController = new AbortController();

  // Abort only when the client truly aborts the request (not just when the response finishes).
  req.on('aborted', () => {
    abortController.abort();
  });

  try {
    logger.info('Preparing Ollama request');

    const payload = {
      model: SCHOLARSHIP_CHAT_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question.trim() },
      ],
      options: {
        temperature: 0.2,
      },
    };

    logger.info('Sending request to Ollama');

    const upstream = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, payload, {
      responseType: 'stream',
      signal: abortController.signal,
      timeout: 120000,
    });

    logger.info('Connected to Ollama for scholarship chat');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders?.();

    let buffer = '';
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;

      const leftover = buffer.trim();
      if (leftover) {
        try {
          const data = JSON.parse(leftover);
          const token = data.message?.content || '';

          if (token) {
            res.write(token);
          }
        } catch (parseError) {
          logger.warn(`Skipping leftover Ollama chunk: ${leftover}`);
        }
      }

      res.end();
    };

    upstream.data.on('data', (chunk) => {
      buffer += chunk.toString();

      const parts = buffer.split('\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line) continue;

        try {
          const data = JSON.parse(line);
          const token = data.message?.content || '';

          if (token) {
            res.write(token);
          }
        } catch (parseError) {
          logger.warn(`Skipping unparsable Ollama chunk: ${line}`);
        }
      }
    });

    upstream.data.on('end', finish);
    upstream.data.on('error', (streamError) => {
      logger.error('Ollama stream error', streamError);
      finish();
    });

    req.on('aborted', () => {
      upstream.data.destroy?.();
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      logger.warn('Scholarship chat request aborted by client');
      return res.end();
    }

    logger.error('Scholarship chat stream failed', error);

    if (res.headersSent) {
      return res.end();
    }

    return res.status(502).json({ message: 'Local model is unavailable right now. Please try again soon.' });
  }
};

export default {
  streamScholarshipChat,
};
