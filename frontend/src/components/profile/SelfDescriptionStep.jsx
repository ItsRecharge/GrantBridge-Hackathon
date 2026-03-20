import { useState, useRef, useCallback } from 'react';

export const SelfDescriptionStep = ({ data, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingError, setRecordingError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = useCallback(async () => {
    setRecordingError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = blob;
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
        }
        setHasRecording(true);
        // Stop all mic tracks
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setRecordingError('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else {
        setRecordingError('Could not start recording. Your browser may not support audio recording.');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const discardRecording = useCallback(() => {
    audioBlobRef.current = null;
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    setHasRecording(false);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Tell Us About Yourself</h2>
        <p className="text-sm text-gray-500">
          Both fields are optional — share as much or as little as you'd like.
        </p>
      </div>

      {/* Voice Recording */}
      <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎙️</span>
          <h3 className="font-medium text-gray-700">Voice Recording</h3>
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <p className="text-sm text-gray-500">
          Record yourself talking about your goals, background, or anything you'd like us to know. 
          Your recording is <strong>never stored or sent</strong> — it's only used while you're on this page.
        </p>

        {recordingError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {recordingError}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          {!isRecording && !hasRecording && (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <span>⏺</span> Start Recording
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition animate-pulse"
            >
              <span>⏹</span> Stop Recording
            </button>
          )}

          {hasRecording && !isRecording && (
            <>
              <button
                type="button"
                onClick={handlePlayPause}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play Back'}
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                <span>🔄</span> Re-record
              </button>
              <button
                type="button"
                onClick={discardRecording}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
              >
                ✕ Discard
              </button>
            </>
          )}
        </div>

        {isRecording && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Recording in progress…
          </p>
        )}

        {hasRecording && !isRecording && (
          <p className="text-xs text-green-600">✓ Recording ready for playback</p>
        )}

        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>

      {/* Written Response */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">✍️</span>
          <label htmlFor="self_description" className="font-medium text-gray-700">
            Written Response
          </label>
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <textarea
          id="self_description"
          rows={5}
          value={data.self_description || ''}
          onChange={e => onChange('self_description', e.target.value)}
          placeholder="Tell us about your goals, passions, background, or what makes you unique…"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 text-right">
          {(data.self_description || '').length} characters
        </p>
      </div>

      {/* Helpful note */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <span className="text-blue-400 mt-0.5">💡</span>
        <p className="text-sm text-blue-700">
          This information helps us calculate your <strong>college and scholarship fit</strong> more accurately by understanding your personal story and aspirations beyond grades and test scores.
        </p>
      </div>
    </div>
  );
};
