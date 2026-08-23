import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Sparkles, X, Play, RotateCcw, Puzzle, Zap } from 'lucide-react';

interface ChunkDialogProps {
  word: string;
  cleanWord: string;
  chunks: string[];
  onClose: () => void;
  selectedVoice?: SpeechSynthesisVoice | null;
}

const CHUNK_PALETTES = [
  {
    bg: 'bg-[#E2EFFF]',
    border: 'border-[#4D96FF]',
    text: 'text-[#2D76DF]',
    activeBg: 'bg-[#4D96FF]',
    activeText: 'text-white',
    ring: 'ring-[#4D96FF]/60',
  },
  {
    bg: 'bg-[#FFF9E5]',
    border: 'border-[#FFD93D]',
    text: 'text-[#B8860B]',
    activeBg: 'bg-[#FFD93D]',
    activeText: 'text-[#4A4A4A]',
    ring: 'ring-[#FFD93D]/70',
  },
  {
    bg: 'bg-[#E8F8EA]',
    border: 'border-[#6BCB77]',
    text: 'text-[#2E8B57]',
    activeBg: 'bg-[#6BCB77]',
    activeText: 'text-white',
    ring: 'ring-[#6BCB77]/60',
  },
  {
    bg: 'bg-[#FFEBEB]',
    border: 'border-[#FF6B6B]',
    text: 'text-[#D32F2F]',
    activeBg: 'bg-[#FF6B6B]',
    activeText: 'text-white',
    ring: 'ring-[#FF6B6B]/60',
  },
];

export const ChunkDialog: React.FC<ChunkDialogProps> = ({
  word,
  cleanWord,
  chunks,
  onClose,
  selectedVoice,
}) => {
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);
  const [isBlendingFullWord, setIsBlendingFullWord] = useState<boolean>(false);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);

  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const stopAllSpeech = useCallback(() => {
    clearAllTimeouts();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveChunkIndex(null);
    setIsBlendingFullWord(false);
    setIsPlayingSequence(false);
  }, [clearAllTimeouts]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, [stopAllSpeech]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopAllSpeech();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, stopAllSpeech]);

  // Speak an individual chunk
  const handleChunkClick = (chunk: string, index: number) => {
    stopAllSpeech();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    setActiveChunkIndex(index);

    const utterance = new SpeechSynthesisUtterance(chunk);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.8;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      const timer = window.setTimeout(() => {
        setActiveChunkIndex(null);
      }, 200);
      timeoutsRef.current.push(timer);
    };

    utterance.onerror = () => {
      setActiveChunkIndex(null);
    };

    // Safety fallback
    const safetyTimer = window.setTimeout(() => {
      setActiveChunkIndex(null);
    }, 1200);
    timeoutsRef.current.push(safetyTimer);

    window.speechSynthesis.speak(utterance);
  };

  // Sound out chunk by chunk in sequence, then blend the full word
  const handleReadWholeWordSequence = () => {
    stopAllSpeech();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    setIsPlayingSequence(true);

    const playStep = (index: number) => {
      if (index < chunks.length) {
        // Speak current chunk
        setActiveChunkIndex(index);
        setIsBlendingFullWord(false);

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = 0.8;
        utterance.pitch = 1.05;

        utterance.onend = () => {
          // Pause between chunks (200ms) before triggering next utterance in queue
          const pauseTimer = window.setTimeout(() => {
            playStep(index + 1);
          }, 220);
          timeoutsRef.current.push(pauseTimer);
        };

        utterance.onerror = () => {
          stopAllSpeech();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // All chunks finished! Finale: blend the full word together
        setActiveChunkIndex(null);
        setIsBlendingFullWord(true);

        const blendTimer = window.setTimeout(() => {
          const fullWordUtterance = new SpeechSynthesisUtterance(cleanWord);
          if (selectedVoice) {
            fullWordUtterance.voice = selectedVoice;
          }
          fullWordUtterance.rate = 0.95;
          fullWordUtterance.pitch = 1.05;

          fullWordUtterance.onend = () => {
            const endTimer = window.setTimeout(() => {
              setIsBlendingFullWord(false);
              setIsPlayingSequence(false);
            }, 300);
            timeoutsRef.current.push(endTimer);
          };

          fullWordUtterance.onerror = () => {
            stopAllSpeech();
          };

          window.speechSynthesis.speak(fullWordUtterance);
        }, 150);

        timeoutsRef.current.push(blendTimer);
      }
    };

    playStep(0);
  };

  // Speak the full word at natural speed
  const handleSayItFast = () => {
    stopAllSpeech();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    setIsBlendingFullWord(true);

    const utterance = new SpeechSynthesisUtterance(cleanWord);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      const timer = window.setTimeout(() => {
        setIsBlendingFullWord(false);
      }, 250);
      timeoutsRef.current.push(timer);
    };

    utterance.onerror = () => {
      setIsBlendingFullWord(false);
    };

    // Safety fallback
    const safetyTimer = window.setTimeout(() => {
      setIsBlendingFullWord(false);
    }, 1500);
    timeoutsRef.current.push(safetyTimer);

    window.speechSynthesis.speak(utterance);
  };

  const handleClose = () => {
    stopAllSpeech();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chunk-dialog-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-word-active"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-[32px] sm:rounded-[44px] p-5 sm:p-8 max-w-lg w-full max-h-[92dvh] overflow-y-auto border-4 sm:border-8 border-[#FFD93D] shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          type="button"
          id="chunk-dialog-close-btn"
          onClick={handleClose}
          title="Back to story"
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 bg-[#FF6B6B] hover:bg-[#f85757] text-white rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-md active:scale-95 transition cursor-pointer z-20"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#FFF9E5] border-2 border-[#FFD93D] text-[#D4A017] px-3.5 py-1 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider mb-3 shadow-xs">
          <Puzzle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4A017]" />
          <span>Sound It Out!</span>
        </div>

        {/* Full Word Display */}
        <div className="mb-4">
          <h2
            id="chunk-dialog-title"
            className={`text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight transition-all duration-200 ${
              isBlendingFullWord
                ? 'text-[#4D96FF] scale-105 drop-shadow-md animate-soft-bounce'
                : 'text-[#4A4A4A]'
            }`}
          >
            {cleanWord}
          </h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-1.5">
            Tap each piece to sound it out chunk by chunk!
          </p>
        </div>

        {/* Chunks Puzzle Pieces Container */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 my-4 sm:my-6 px-1">
          {chunks.map((chunk, idx) => {
            const palette = CHUNK_PALETTES[idx % CHUNK_PALETTES.length];
            const isActive = activeChunkIndex === idx;

            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-[#FFD93D] font-black text-xl sm:text-2xl select-none">
                    •
                  </span>
                )}

                <button
                  type="button"
                  id={`chunk-btn-${idx}-${chunk}`}
                  onClick={() => handleChunkClick(chunk, idx)}
                  title={`Hear "${chunk}"`}
                  className={`relative group px-4 py-2.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-3xl tracking-wide transition-all duration-150 active:scale-95 cursor-pointer shadow-md border-3 sm:border-4 ${
                    isActive
                      ? `${palette.activeBg} ${palette.activeText} border-[#4A4A4A]/20 scale-105 shadow-xl ring-3 ${palette.ring} animate-soft-bounce z-10`
                      : `${palette.bg} ${palette.text} ${palette.border} hover:scale-102 hover:shadow-md`
                  }`}
                >
                  <span className="inline-block">{chunk}</span>
                  <span className="block text-[9px] sm:text-[10px] opacity-75 uppercase tracking-wider font-bold mt-0.5">
                    Piece {idx + 1}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {/* Read Whole Word (Sound It Out Step by Step) */}
          <button
            type="button"
            id="chunk-sound-out-all-btn"
            onClick={handleReadWholeWordSequence}
            className={`flex-1 py-3 sm:py-3.5 px-4 rounded-2xl btn-tactile-blue font-black text-sm sm:text-base flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer transition ${
              isPlayingSequence ? 'ring-3 ring-[#4D96FF]/50 scale-102' : ''
            }`}
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Sound It Out</span>
          </button>

          {/* Say It Fast / Blend It */}
          <button
            type="button"
            id="chunk-say-it-fast-btn"
            onClick={handleSayItFast}
            className={`flex-1 py-3 sm:py-3.5 px-4 rounded-2xl btn-tactile-green font-black text-sm sm:text-base flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer transition ${
              isBlendingFullWord && !isPlayingSequence ? 'ring-3 ring-[#6BCB77]/50 scale-102' : ''
            }`}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Say It Fast</span>
          </button>
        </div>

        {/* Back to Story Footer Link */}
        <div className="mt-4">
          <button
            type="button"
            id="chunk-dialog-back-btn"
            onClick={handleClose}
            className="text-xs sm:text-sm font-bold text-slate-400 hover:text-[#4A4A4A] underline underline-offset-4 cursor-pointer transition"
          >
            Done with word? Return to reading
          </button>
        </div>
      </div>
    </div>
  );
};
