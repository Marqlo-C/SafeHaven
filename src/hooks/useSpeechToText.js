import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechToText — Reliable transcription using ElevenLabs STT.
 *
 * This refactored version uses the MediaRecorder API to capture audio
 * and sends it to our server-side /api/stt endpoint for processing.
 * This works across all modern browsers (Chrome, Safari, Mobile).
 */
export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(false);
  const [loading, setLoading]       = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);

  useEffect(() => {
    // Check for MediaRecorder support
    setSupported(!!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  const startListening = useCallback(async () => {
    if (!supported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const extension = mimeType.includes('wav') ? 'wav' : 'webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await transcribeAudio(audioBlob, extension);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setListening(true);
      setTranscript(''); // Clear previous transcript
    } catch (err) {
      console.error('[STT] Could not start recording:', err);
      setListening(false);
    }
  }, [supported]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  }, []);

  const transcribeAudio = async (blob, extension) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, `recording.${extension}`);

      const res = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.transcript) {
        setTranscript(data.transcript);
      } else {
        console.error('[STT] Transcription failed:', data.error);
      }
    } catch (err) {
      console.error('[STT] API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { 
    transcript, 
    listening, 
    supported, 
    loading, // New state for transcription in progress
    startListening, 
    stopListening, 
    clearTranscript 
  };
}
