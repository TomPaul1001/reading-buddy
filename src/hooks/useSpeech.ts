import { useState, useEffect, useRef, useCallback } from 'react';
import { ReadingSpeed } from '../types';

export interface WordToken {
  id: number;
  word: string;
  cleanWord: string;
  charStart: number;
  charEnd: number;
  punctuationBefore?: string;
  punctuationAfter?: string;
}

export function parseWords(text: string): WordToken[] {
  if (!text || typeof text !== 'string') return [];

  const words: WordToken[] = [];
  // Split text while preserving indices
  // Match whitespace sequences or words
  let charIndex = 0;
  const rawParts = text.split(/(\s+)/);

  for (const part of rawParts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      charIndex += part.length;
      continue;
    }

    if (part.length > 0) {
      // Extract punctuation
      const match = part.match(/^([^\w]*)([\w'’-]+)([^\w]*)$/i);
      const cleanWord = match ? match[2] : part.replace(/[^\w]/g, '');
      const punctuationBefore = match ? match[1] : '';
      const punctuationAfter = match ? match[3] : '';

      words.push({
        id: words.length,
        word: part,
        cleanWord: cleanWord || part,
        charStart: charIndex,
        charEnd: charIndex + part.length,
        punctuationBefore,
        punctuationAfter,
      });

      charIndex += part.length;
    }
  }

  return words;
}

export function useSpeech() {
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [singleWordActiveIndex, setSingleWordActiveIndex] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speed, setSpeed] = useState<ReadingSpeed>('normal');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<WordToken[]>([]);
  const singleTimeoutRef = useRef<number | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);

  // Initialize and load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        if (!window.speechSynthesis) return;
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
          // Find best natural English voice
          const englishVoices = available.filter((v) => v.lang && v.lang.startsWith('en'));
          const preferred =
            englishVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel')) ||
            englishVoices[0] ||
            available[0];

          setSelectedVoice(preferred || null);
        }
      } catch (err) {
        console.warn('Speech voice loading error:', err);
      }
    };

    loadVoices();

    try {
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } catch {
      // Ignored
    }

    return () => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignored
      }
    };
  }, []);

  const getRate = useCallback((s: ReadingSpeed): number => {
    switch (s) {
      case 'slow':
        return 0.75;
      case 'fast':
        return 1.1;
      case 'normal':
      default:
        return 0.9;
    }
  }, []);

  // Stop any ongoing speech
  const stop = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (err) {
      console.warn('SpeechSynthesis cancel error:', err);
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    if (singleTimeoutRef.current) {
      clearTimeout(singleTimeoutRef.current);
      singleTimeoutRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(null);
    setSingleWordActiveIndex(null);
  }, []);

  // Speak a single word
  const speakWord = useCallback((cleanWord: string, wordIndex?: number) => {
    if (!isSupported || typeof window === 'undefined' || !cleanWord) return;

    stop();

    if (wordIndex !== undefined) {
      setSingleWordActiveIndex(wordIndex);
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = getRate(speed);
      utterance.pitch = 1.05; // Slightly friendly, warm pitch for kids

      utterance.onend = () => {
        setSingleWordActiveIndex(null);
      };

      utterance.onerror = () => {
        setSingleWordActiveIndex(null);
      };

      // Safety timeout in case onend doesn't fire
      singleTimeoutRef.current = window.setTimeout(() => {
        setSingleWordActiveIndex(null);
      }, 1200);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis speakWord error:', err);
      setSingleWordActiveIndex(null);
    }
  }, [isSupported, selectedVoice, speed, getRate, stop]);

  // Read entire page aloud with word-by-word boundary tracking
  const readPage = useCallback((text: string, parsedWords: WordToken[]) => {
    if (!isSupported || typeof window === 'undefined') return;

    stop();

    wordsRef.current = parsedWords;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentWordIndex(0);

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      const currentRate = getRate(speed);
      utterance.rate = currentRate;
      utterance.pitch = 1.05;

      let boundaryReceived = false;

      utterance.onboundary = (event) => {
        boundaryReceived = true;
        if (event.name === 'word' || event.charIndex !== undefined) {
          const charIdx = event.charIndex;
          // Find which token covers this character index
          const found = parsedWords.find((w) => charIdx >= w.charStart && charIdx <= w.charEnd);
          if (found) {
            setCurrentWordIndex(found.id);
          } else {
            // Find closest word by charStart
            let closest = parsedWords[0];
            let minDiff = Infinity;
            for (const w of parsedWords) {
              const diff = Math.abs(w.charStart - charIdx);
              if (diff < minDiff) {
                minDiff = diff;
                closest = w;
              }
            }
            if (closest) {
              setCurrentWordIndex(closest.id);
            }
          }
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        if (parsedWords.length > 0) {
          setCurrentWordIndex(0);
        }

        // Fallback timer in case the browser voice doesn't fire boundary events
        const approxDurationPerWordMs = 60000 / (130 * currentRate);
        let fallbackIndex = 0;

        fallbackIntervalRef.current = window.setInterval(() => {
          if (!boundaryReceived && fallbackIndex < parsedWords.length - 1) {
            fallbackIndex++;
            setCurrentWordIndex(fallbackIndex);
          }
        }, approxDurationPerWordMs);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(null);
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current);
          fallbackIntervalRef.current = null;
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(null);
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current);
          fallbackIntervalRef.current = null;
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis speak error:', err);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    }
  }, [isSupported, selectedVoice, speed, getRate, stop]);

  const pause = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis && isPlaying) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } catch (err) {
      console.warn('SpeechSynthesis pause error:', err);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis && isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } catch (err) {
      console.warn('SpeechSynthesis resume error:', err);
    }
  }, [isPaused]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentWordIndex,
    singleWordActiveIndex,
    speed,
    setSpeed,
    voices,
    selectedVoice,
    setSelectedVoice,
    speakWord,
    readPage,
    pause,
    resume,
    stop,
  };
}
