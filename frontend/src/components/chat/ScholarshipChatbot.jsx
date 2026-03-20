import { useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const initialGreeting = {
  role: 'assistant',
  content: 'Hi! Ask me scholarship questions - eligibility, fit, timelines, or how to strengthen an application.',
};

export const ScholarshipChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const assistantIndexRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const updateAssistantMessage = (content) => {
    if (assistantIndexRef.current === null) return;

    setMessages(prev =>
      prev.map((msg, idx) => (idx === assistantIndexRef.current ? { ...msg, content } : msg)),
    );
  };

  const streamReply = async (question) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/scholarship/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to reach local model');
      }

      if (!response.body) {
        throw new Error('Missing response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assembled = '';

      // Read streamed text chunks and surface them live in the UI.
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        assembled += decoder.decode(value, { stream: true });
        updateAssistantMessage(assembled);
      }

      if (!assembled.trim()) {
        updateAssistantMessage('Happy to help. Try another question about scholarships or related planning.');
      }
    } catch (err) {
      if (controller.signal.aborted) {
        updateAssistantMessage('Stopped. Ask another question anytime.');
      } else {
        console.error('Chat stream error', err);
        updateAssistantMessage('Sorry, the local model is busy right now. Please try again.');
        setError('Local model is unavailable or still starting up.');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const question = input.trim();
    setInput('');

    setMessages(prev => {
      const next = [...prev, { role: 'user', content: question }, { role: 'assistant', content: '' }];
      assistantIndexRef.current = next.length - 1;
      return next;
    });

    await streamReply(question);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const stopStreaming = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const toggleOpen = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsOpen(prev => !prev);
    setError(null);
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-100/80 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-3 text-white">
            <div className="font-semibold">Scholarship Chat</div>
            <button
              type="button"
              onClick={toggleOpen}
              className="rounded-full p-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="h-80 overflow-y-auto bg-gray-50 px-4 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'assistant'
                    ? 'bg-white text-gray-800 border border-blue-100'
                    : 'ml-auto bg-blue-600 text-white'
                }`}
              >
                {msg.content || (isStreaming && idx === messages.length - 1 ? 'Thinking...' : '')}
              </div>
            ))}
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
              {error}
            </div>
          )}

          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask about eligibility, fit, deadlines, or tips"
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={isStreaming}
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Send
                </button>
                {isStreaming && (
                  <button
                    type="button"
                    onClick={stopStreaming}
                    className="rounded-xl border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-lg shadow-blue-200 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200"
        aria-label="Open scholarship chatbot"
      >
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3 3V9Z" />
          <path d="M9 12h6" />
          <path d="M9 15h3" />
        </svg>
      </button>
    </div>
  );
};

export default ScholarshipChatbot;
