import React, { useState, useEffect, useRef } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
      setInterimText(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning:', event.error);
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!supported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText('');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Web Speech API is not supported in this browser"
        className="w-9 h-9 flex items-center justify-center text-[var(--md-sys-color-outline)] opacity-40 cursor-not-allowed"
        aria-label="Microphone not supported"
      >
        <MaterialSymbol name="mic_off" size={20} />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        id="voice-journal-toggle-btn"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isListening
            ? 'bg-red-500 text-white shadow-md animate-pulse'
            : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop dictating voice reflection' : 'Dictate with voice'}
      >
        <MaterialSymbol name={isListening ? 'mic' : 'mic'} size={20} />
      </button>

      {isListening && (
        <div
          role="status"
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full text-xs whitespace-nowrap shadow-lg flex items-center gap-2 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]"
          style={{ boxShadow: 'var(--md-elevation-2)' }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-medium">Listening... speak freely</span>
          {interimText && (
            <span className="text-[var(--md-sys-color-on-surface-variant)] italic max-w-xs truncate">
              "{interimText}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};
