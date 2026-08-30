import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Home,
  Star,
  Sparkles,
  HelpCircle,
  Type,
  Gauge,
  CheckCircle2,
  Volume1,
  BookOpen,
} from 'lucide-react';
import { Story, Profile, ReadingSpeed, FontSizeMode } from '../types';
import { parseWords, useSpeech, WordToken } from '../hooks/useSpeech';
import { WordSpan } from './WordSpan';
import { ChunkDialog } from './ChunkDialog';
import { LegalModal, LegalDocType } from './LegalModal';
import { saveProgress, markStoryCompleted } from '../utils/progress';

interface StoryReaderProps {
  story: Story;
  initialPageIndex?: number;
  profile: Profile;
  onBackToHome: () => void;
  onStoryCompleted?: () => void;
}

const pageSlideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 50 : dir < 0 ? -50 : 0,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -50 : dir < 0 ? 50 : 0,
    opacity: 0,
    scale: 0.98,
  }),
};

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  initialPageIndex = 0,
  profile,
  onBackToHome,
  onStoryCompleted,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    return Math.min(Math.max(0, initialPageIndex), story.pages.length - 1);
  });
  const [direction, setDirection] = useState<number>(0);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [activeDifficultWord, setActiveDifficultWord] = useState<{
    word: string;
    cleanWord: string;
    chunks: string[];
  } | null>(null);
  const [fontSize, setFontSize] = useState<FontSizeMode>('large');
  const [showQuestion, setShowQuestion] = useState(false);
  const [legalModalDoc, setLegalModalDoc] = useState<LegalDocType | null>(null);

  const {
    isSupported,
    isPlaying,
    isPaused,
    currentWordIndex,
    singleWordActiveIndex,
    speed,
    setSpeed,
    selectedVoice,
    speakWord,
    readPage,
    pause,
    resume,
    stop,
  } = useSpeech();

  const totalPages = story.pages.length;
  const currentPage = story.pages[currentPageIndex];
  const isLastPage = currentPageIndex === totalPages - 1;

  // Parse words on the current page
  const parsedWords = useMemo(() => {
    if (!currentPage) return [];
    return parseWords(currentPage.text);
  }, [currentPage]);

  // Handle page turn & progress persistence
  const goToPage = useCallback(
    (newIndex: number) => {
      stop();
      setActiveDifficultWord(null);
      setShowQuestion(false);
      const clamped = Math.min(Math.max(0, newIndex), totalPages - 1);
      if (clamped !== currentPageIndex) {
        setDirection(clamped > currentPageIndex ? 1 : -1);
        setCurrentPageIndex(clamped);
        saveProgress(profile.id, story.id, clamped);
      }
    },
    [currentPageIndex, totalPages, profile.id, story.id, stop]
  );

  // Handle word clicking: difficult words open ChunkDialog, others speak aloud
  const handleWordClick = useCallback((token: WordToken) => {
    const cleanKey = token.cleanWord.toLowerCase();
    const chunks = story.difficultWords?.[cleanKey];
    if (chunks && chunks.length > 0) {
      stop();
      setActiveDifficultWord({
        word: token.word,
        cleanWord: token.cleanWord,
        chunks,
      });
    } else {
      speakWord(token.cleanWord, token.id);
    }
  }, [story.difficultWords, speakWord, stop]);

  // When story is completed on the last page
  const handleFinishStory = () => {
    stop();
    markStoryCompleted(profile.id, story.id);
    setIsCompletedModalOpen(true);

    // Fire joyful celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // Confetti fallback
    }

    if (onStoryCompleted) {
      onStoryCompleted();
    }
  };

  const handleNext = () => {
    if (isLastPage) {
      handleFinishStory();
    } else {
      goToPage(currentPageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      goToPage(currentPageIndex - 1);
    }
  };

  const handleReadPageClick = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      readPage(currentPage.text, parsedWords);
    }
  };

  // Font size class mapping - optimized for iPad and tablet readability
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'medium':
        return 'text-lg sm:text-xl md:text-2xl leading-relaxed';
      case 'xlarge':
        return 'text-2xl sm:text-3xl md:text-4xl leading-relaxed sm:leading-loose';
      case 'large':
      default:
        return 'text-xl sm:text-2xl md:text-3xl leading-relaxed';
    }
  };

  return (
    <div className="h-screen max-h-[100dvh] min-h-[100dvh] bg-[#FFF9F0] flex flex-col justify-between p-2.5 sm:p-4 md:p-5 lg:p-6 font-sans selection:bg-[#FFD93D]/40 overflow-hidden">
      {/* Header Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4 shrink-0 mb-2 sm:mb-3">
        {/* Reader Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-[#FFD93D] shadow-xs">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FF8C8C] rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner">
            {profile.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
              Reader
            </span>
            <span className="text-xs sm:text-sm md:text-base font-black text-[#4A4A4A] leading-tight">
              {profile.name}
            </span>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Speed Toggle Pill */}
          <div className="flex items-center bg-white rounded-full border-2 border-[#FFD93D] p-0.5 sm:p-1 shadow-xs">
            <button
              type="button"
              id="speed-slow-btn"
              onClick={() => {
                setSpeed('slow');
                if (isPlaying) stop();
              }}
              title="Slow speed (Turtle)"
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                speed === 'slow'
                  ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-2xs'
                  : 'text-slate-500 hover:bg-[#FFF9E5]'
              }`}
            >
              🐢
            </button>
            <button
              type="button"
              id="speed-normal-btn"
              onClick={() => {
                setSpeed('normal');
                if (isPlaying) stop();
              }}
              title="Normal speed (Rabbit)"
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                speed === 'normal'
                  ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-2xs'
                  : 'text-slate-500 hover:bg-[#FFF9E5]'
              }`}
            >
              🐰
            </button>
            <button
              type="button"
              id="speed-fast-btn"
              onClick={() => {
                setSpeed('fast');
                if (isPlaying) stop();
              }}
              title="Fast speed (Cheetah)"
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                speed === 'fast'
                  ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-2xs'
                  : 'text-slate-500 hover:bg-[#FFF9E5]'
              }`}
            >
              ⚡
            </button>
          </div>

          {/* Text Size Pill */}
          <button
            type="button"
            id="font-size-toggle-btn"
            onClick={() => {
              setFontSize((prev) => (prev === 'medium' ? 'large' : prev === 'large' ? 'xlarge' : 'medium'));
            }}
            title="Adjust text size"
            className="bg-white px-2.5 sm:px-3 py-1.5 rounded-full border-2 border-[#4D96FF] text-[#4D96FF] font-bold text-xs sm:text-sm shadow-xs hover:bg-[#F0F7FF] transition cursor-pointer flex items-center gap-1"
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{fontSize === 'medium' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}</span>
          </button>

          {/* Home / Close Button */}
          <button
            type="button"
            id="reader-home-btn"
            onClick={() => {
              stop();
              onBackToHome();
            }}
            title="Back to Library"
            className="bg-[#FF6B6B] hover:bg-[#f85757] w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-base sm:text-xl shadow-md active:scale-95 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Story Stage Card */}
      <div className="max-w-5xl mx-auto w-full flex-1 min-h-0 flex flex-col items-center justify-between">
        <section className="w-full h-full flex flex-col items-center justify-between bg-white rounded-[24px] sm:rounded-[36px] md:rounded-[44px] border-4 sm:border-6 md:border-8 border-[#FFD93D] shadow-xl p-3.5 sm:p-5 md:p-6 relative min-h-0">
          {/* Floating Story Title Badge */}
          <div className="absolute -top-3.5 sm:-top-4.5 left-4 sm:left-8 bg-[#4D96FF] text-white px-3.5 sm:px-5 py-1 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base shadow-md flex items-center gap-1.5 sm:gap-2">
            <span>{story.icon}</span>
            <span>{story.title}</span>
          </div>

          {/* Center Illustration & Words Section with subtle digital book slide animation */}
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center my-auto overflow-hidden relative px-1">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={currentPageIndex}
                custom={direction}
                variants={pageSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 350, damping: 32 },
                  opacity: { duration: 0.18 },
                  scale: { duration: 0.18 },
                }}
                className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto px-1 py-1"
              >
                {currentPage.sceneEmoji && (
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-3 md:mb-4 animate-soft-bounce select-none shrink-0">
                    {currentPage.sceneEmoji}
                  </div>
                )}

                {/* Interactive Word Tokens */}
                <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 md:gap-2.5 max-w-3xl px-1 sm:px-2">
                  {parsedWords.map((token) => {
                    const cleanKey = token.cleanWord.toLowerCase();
                    const isDifficult = Boolean(story.difficultWords?.[cleanKey]);

                    return (
                      <WordSpan
                        key={token.id}
                        token={token}
                        isDifficult={isDifficult}
                        isSpokenInPage={currentWordIndex === token.id}
                        isSingleSpoken={singleWordActiveIndex === token.id}
                        onWordClick={handleWordClick}
                        fontSizeClass={getFontSizeClass()}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Optional Comprehension Question Bar */}
          {currentPage.question && (
            <div className="w-full max-w-2xl mt-1.5 sm:mt-2 shrink-0">
              <button
                type="button"
                id="question-toggle-btn"
                onClick={() => setShowQuestion(!showQuestion)}
                className="w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-[#F0F7FF] border-2 border-[#4D96FF]/30 text-[#4D96FF] font-bold text-xs sm:text-sm hover:bg-[#E2EFFF] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{showQuestion ? 'Hide Question' : 'Thinking Question 💭'}</span>
              </button>
              {showQuestion && (
                <div className="mt-1.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FFF9E5] border-2 border-[#FFD93D] text-[#4A4A4A] text-center font-bold text-xs sm:text-sm animate-word-active">
                  {currentPage.question}
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Controls Bar */}
          <div className="w-full flex justify-between items-center mt-2 sm:mt-3 gap-2 sm:gap-4 shrink-0">
            {/* Prev Page Button */}
            <button
              type="button"
              id="prev-page-btn"
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              title="Previous Page"
              className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-3 sm:border-4 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black transition cursor-pointer active:scale-95 ${
                currentPageIndex === 0
                  ? 'border-[#E0E0E0] text-[#E0E0E0] opacity-40 cursor-not-allowed'
                  : 'border-[#6BCB77] text-[#6BCB77] hover:bg-[#6BCB77] hover:text-white shadow-[0_3px_0_#4EAF5B] sm:shadow-[0_4px_0_#4EAF5B]'
              }`}
            >
              ←
            </button>

            {/* Read to Me Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="read-page-aloud-btn"
                onClick={handleReadPageClick}
                disabled={!isSupported}
                className={`btn-tactile-blue px-4 sm:px-8 md:px-10 py-2.5 sm:py-3.5 md:py-4 rounded-2xl sm:rounded-3xl text-white text-sm sm:text-lg md:text-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
                  isPlaying ? 'bg-[#FF6B6B] shadow-[0_4px_0_#DF4B4B] sm:shadow-[0_6px_0_#DF4B4B]' : ''
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <span>🔊 READ TO ME</span>
                  </>
                )}
              </button>

              {isPlaying && (
                <button
                  type="button"
                  id="stop-reading-btn"
                  onClick={stop}
                  title="Stop audio"
                  className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white border-2 border-slate-300 text-slate-700 font-bold transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Next / Finish Page Button */}
            <button
              type="button"
              id="next-page-btn"
              onClick={handleNext}
              title={isLastPage ? 'Finish Story' : 'Next Page'}
              className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-3 sm:border-4 border-[#6BCB77] text-[#6BCB77] hover:bg-[#6BCB77] hover:text-white flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black shadow-[0_3px_0_#4EAF5B] sm:shadow-[0_4px_0_#4EAF5B] transition active:scale-95 cursor-pointer"
            >
              {isLastPage ? '⭐' : '→'}
            </button>
          </div>
        </section>
      </div>

      {/* Footer Navigation Dots & Helper Bar */}
      <footer className="mt-1 sm:mt-2 max-w-5xl mx-auto w-full flex items-center justify-between px-2 shrink-0">
        {/* Left helper tip & Legal links */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500">
          <span className="hidden sm:inline bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200">
            👆 Tap word to sound out
          </span>
          <button
            type="button"
            onClick={() => setLegalModalDoc('terms')}
            className="hover:text-[#4D96FF] hover:underline transition cursor-pointer"
          >
            Terms
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setLegalModalDoc('privacy')}
            className="hover:text-[#6BCB77] hover:underline transition cursor-pointer"
          >
            Privacy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setLegalModalDoc('disclaimer')}
            className="hover:text-[#D4A017] hover:underline transition cursor-pointer"
          >
            Disclaimer
          </button>
        </div>

        {/* Center Page Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0">
          {story.pages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              id={`page-dot-${idx}`}
              onClick={() => goToPage(idx)}
              title={`Page ${idx + 1}`}
              className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-all cursor-pointer ${
                idx === currentPageIndex
                  ? 'bg-[#6BCB77] scale-125 shadow-xs'
                  : idx < currentPageIndex
                  ? 'bg-[#6BCB77]/60'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Right Page Count Badge */}
        <div className="text-[11px] sm:text-xs font-black text-[#4A4A4A] bg-white px-2.5 py-1 rounded-full border border-[#FFD93D] shadow-2xs">
          Page {currentPageIndex + 1} of {totalPages}
        </div>
      </footer>

      {/* Word Chunking Dialog */}
      {activeDifficultWord && (
        <ChunkDialog
          word={activeDifficultWord.word}
          cleanWord={activeDifficultWord.cleanWord}
          chunks={activeDifficultWord.chunks}
          selectedVoice={selectedVoice}
          onClose={() => setActiveDifficultWord(null)}
        />
      )}

      {/* Legal Information Modal */}
      <LegalModal
        isOpen={legalModalDoc !== null}
        activeDoc={legalModalDoc || 'terms'}
        onClose={() => setLegalModalDoc(null)}
        onSelectDoc={(doc) => setLegalModalDoc(doc)}
      />

      {/* Celebration Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-word-active">
          <div className="bg-white rounded-[36px] sm:rounded-[40px] p-6 sm:p-10 max-w-lg w-full border-6 sm:border-8 border-[#FFD93D] shadow-2xl text-center relative overflow-hidden">
            <div className="text-6xl sm:text-7xl mb-3 animate-soft-bounce">🌟</div>

            <h2 className="text-2xl sm:text-4xl font-black font-heading text-[#4A4A4A] mb-2">
              Great Reading, {profile.name}!
            </h2>

            <p className="text-base sm:text-lg text-slate-600 mb-6 font-medium">
              You completed <span className="font-black text-[#4D96FF]">“{story.title}”</span> and earned a reading star!
            </p>

            <div className="inline-flex items-center gap-2 bg-[#FFF9E5] text-[#D4A017] font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl mb-6 sm:mb-8 border-2 border-[#FFD93D]">
              <CheckCircle2 className="w-5 h-5 text-[#6BCB77]" />
              <span>STORY COMPLETED!</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="read-again-btn"
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  goToPage(0);
                }}
                className="flex-1 py-3.5 sm:py-4 px-5 rounded-2xl border-4 border-[#FFD93D] bg-[#FFF9E5] text-[#D4A017] font-black text-base sm:text-lg hover:bg-[#fff3c4] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Read Again</span>
              </button>

              <button
                type="button"
                id="choose-another-story-btn"
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  onBackToHome();
                }}
                className="flex-1 py-3.5 sm:py-4 px-5 rounded-2xl btn-tactile-blue font-black text-base sm:text-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-white" />
                <span>Pick Story</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
