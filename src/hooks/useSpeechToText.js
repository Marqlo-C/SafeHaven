import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechToText({ lang = 'en-US' } = {}) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(false);
  const recognitionRef = useRef(null);
  const finalTextRef   = useRef('');

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || recognitionRef.current) return;

    finalTextRef.current = '';
    setTranscript('');

    const r = new SR();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTextRef.current += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTextRef.current + interim);
    };

    r.onend   = () => { recognitionRef.current = null; setListening(false); };
    r.onerror = () => { recognitionRef.current = null; setListening(false); };

    recognitionRef.current = r;
    r.start();
    setListening(true);
  }, [lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    finalTextRef.current = '';
    setTranscript('');
  }, []);

  return { transcript, listening, supported, startListening, stopListening, clearTranscript };
}
