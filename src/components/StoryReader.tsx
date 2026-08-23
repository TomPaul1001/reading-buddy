import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
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
import { parseWords, useSpeech } from '../hooks/useSpeech';
import { WordSpan } from './WordSpan';
import { saveProgress, markStoryCompleted } from '../utils/progress';

interface StoryReaderProps {
  story: Story;
  initialPageIndex?: number;
  profile: Profile;
  onBackToHome: () => void;
  onStoryCompleted?: () => void;
}

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
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSizeMode>('large');
  const [showQuestion, setShowQuestion] = useState(false);

  const {
    isSupported,
    isPlaying,
    isPaused,
    currentWordIndex,
    singleWordActiveIndex,
    speed,
    setSpeed,
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
  const goToPage = useCallback((newIndex: number) => {
    stop();
    setShowQuestion(false);
    const clamped = Math.min(Math.max(0, newIndex), totalPages - 1);
    setCurrentPageIndex(clamped);
    saveProgress(profile.id, story.id, clamped);
  }, [totalPages, profile.id, story.id, stop]);

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

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'medium':
        return 'text-xl sm:text-2xl leading-relaxed sm:leading-loose';
      case 'xlarge':
        return 'text-3xl sm:text-4xl leading-loose';
      case 'large':
      default:
        return 'text-2xl sm:text-3xl leading-relaxed sm:leading-loose';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#FFD93D]/40">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4 mb-6 sm:mb-8">
        {/* Reader Profile Pill */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 border-[#FFD93D] shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FF8C8C] rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-inner">
            {profile.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
              Reader
            </span>
            <span className="text-base sm:text-xl font-black text-[#4A4A4A]">
              {profile.name}’s Buddy
            </span>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Speed Toggle Pill */}
          <div className="flex items-center bg-white rounded-full border-2 border-[#FFD93D] p-1 shadow-sm">
            <button
              type="button"
              id="speed-slow-btn"
              onClick={() => {
                setSpeed('slow');
                if (isPlaying) stop();
              }}
              title="Slow speed (Turtle)"
              className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold transition ${
                speed === 'slow'
                  ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-xs'
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
              className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold transition ${
                speed === 'normal'
                  ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-xs'
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
              className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold transition ${
                speed === 'fast'
                  ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-xs'
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
            className="bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border-2 border-[#4D96FF] text-[#4D96FF] font-bold text-xs sm:text-sm shadow-sm hover:bg-[#F0F7FF] transition cursor-pointer flex items-center gap-1"
          >
            <Type className="w-4 h-4" />
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
            className="bg-[#FF6B6B] hover:bg-[#f85757] w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl shadow-md active:scale-95 transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch my-auto">
        {/* Central Story Stage Card */}
        <section className="flex-[3] bg-white rounded-[36px] sm:rounded-[48px] border-4 sm:border-8 border-[#FFD93D] shadow-2xl p-6 sm:p-12 flex flex-col items-center justify-between relative min-h-[480px]">
          {/* Floating Story Title Badge */}
          <div className="absolute -top-5 sm:-top-6 left-6 sm:left-12 bg-[#4D96FF] text-white px-6 sm:px-8 py-2 rounded-2xl font-black text-base sm:text-lg shadow-md flex items-center gap-2">
            <span>{story.icon}</span>
            <span>{story.title}</span>
          </div>

          {/* Center Illustration & Words */}
          <div className="flex-1 flex flex-col items-center justify-center w-full my-6">
            {currentPage.sceneEmoji && (
              <div className="text-6xl sm:text-8xl mb-6 sm:mb-8 animate-soft-bounce select-none">
                {currentPage.sceneEmoji}
              </div>
            )}

            {/* Interactive Word Tokens */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5 max-w-3xl px-2">
              {parsedWords.map((token) => (
                <WordSpan
                  key={token.id}
                  token={token}
                  isSpokenInPage={currentWordIndex === token.id}
                  isSingleSpoken={singleWordActiveIndex === token.id}
                  onWordClick={(t) => speakWord(t.cleanWord, t.id)}
                  fontSizeClass={getFontSizeClass()}
                />
              ))}
            </div>
          </div>

          {/* Optional Comprehension Question Bar */}
          {currentPage.question && (
            <div className="w-full mb-6">
              <button
                type="button"
                id="question-toggle-btn"
                onClick={() => setShowQuestion(!showQuestion)}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#F0F7FF] border-2 border-[#4D96FF]/30 text-[#4D96FF] font-bold text-sm sm:text-base hover:bg-[#E2EFFF] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showQuestion ? 'Hide Question' : 'Thinking Question 💭'}</span>
              </button>
              {showQuestion && (
                <div className="mt-2 p-3.5 rounded-2xl bg-[#FFF9E5] border-2 border-[#FFD93D] text-[#4A4A4A] text-center font-bold text-sm sm:text-base animate-word-active">
                  {currentPage.question}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls Bar */}
          <div className="w-full flex justify-between items-center mt-4 gap-3">
            {/* Prev Page Button */}
            <button
              type="button"
              id="prev-page-btn"
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full border-4 flex items-center justify-center text-3xl font-black transition cursor-pointer active:scale-95 ${
                currentPageIndex === 0
                  ? 'border-[#E0E0E0] text-[#E0E0E0] opacity-50 cursor-not-allowed'
                  : 'border-[#6BCB77] text-[#6BCB77] hover:bg-[#6BCB77] hover:text-white shadow-[0_4px_0_#4EAF5B]'
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
                className={`btn-tactile-blue px-6 sm:px-12 py-3.5 sm:py-5 rounded-3xl text-white text-lg sm:text-2xl font-black transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase ${
                  isPlaying ? 'bg-[#FF6B6B] shadow-[0_6px_0_#DF4B4B]' : ''
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6" />
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
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 font-bold transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Next / Finish Page Button */}
            <button
              type="button"
              id="next-page-btn"
              onClick={handleNext}
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border-4 border-[#6BCB77] text-[#6BCB77] hover:bg-[#6BCB77] hover:text-white flex items-center justify-center text-3xl font-black shadow-[0_4px_0_#4EAF5B] transition active:scale-95 cursor-pointer"
            >
              {isLastPage ? '⭐' : '→'}
            </button>
          </div>
        </section>

        {/* Side Companion Info Widgets (Artistic Flair Layout) */}
        <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-4 sm:gap-6">
          {/* Page Badge */}
          <div className="bg-[#6BCB77] rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 text-white shadow-lg flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🌟</div>
            <div className="text-xl sm:text-2xl font-black uppercase">
              PAGE {currentPageIndex + 1}
            </div>
            <div className="text-xs sm:text-sm opacity-90 font-bold uppercase tracking-widest">
              of {totalPages}
            </div>
          </div>

          {/* Interactive Tap Tip Widget */}
          <div className="bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 border-4 border-[#FFD93D] shadow-lg flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">👆</div>
            <div className="text-sm sm:text-base font-bold text-[#4A4A4A] uppercase tracking-wide">
              Tap Any Word
            </div>
            <div className="text-lg sm:text-xl font-black text-[#FF6B6B] mt-0.5">
              HEAR IT ALOUD
            </div>
          </div>

          {/* Reader Cheer Widget */}
          <div className="bg-[#4D96FF] rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 text-white shadow-lg flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📈</div>
            <div className="text-lg sm:text-xl font-black">Great Job!</div>
            <div className="text-xs sm:text-sm opacity-90 font-medium">
              Keep building fluency!
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Page Dots */}
      <footer className="mt-6 flex justify-center">
        <div className="flex gap-2.5 sm:gap-3">
          {story.pages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              id={`page-dot-${idx}`}
              onClick={() => goToPage(idx)}
              title={`Page ${idx + 1}`}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all cursor-pointer ${
                idx <= currentPageIndex
                  ? 'bg-[#6BCB77] scale-110 shadow-xs'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </footer>

      {/* Celebration Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-word-active">
          <div className="bg-white rounded-[40px] p-6 sm:p-10 max-w-lg w-full border-8 border-[#FFD93D] shadow-2xl text-center relative overflow-hidden">
            <div className="text-7xl mb-3 animate-soft-bounce">🌟</div>

            <h2 className="text-3xl sm:text-4xl font-black font-heading text-[#4A4A4A] mb-2">
              Great Reading, {profile.name}!
            </h2>

            <p className="text-lg text-slate-600 mb-6 font-medium">
              You completed <span className="font-black text-[#4D96FF]">“{story.title}”</span> and earned a reading star!
            </p>

            <div className="inline-flex items-center gap-2 bg-[#FFF9E5] text-[#D4A017] font-black px-5 py-2.5 rounded-2xl mb-8 border-2 border-[#FFD93D]">
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
                className="flex-1 py-4 px-5 rounded-2xl border-4 border-[#FFD93D] bg-[#FFF9E5] text-[#D4A017] font-black text-lg hover:bg-[#fff3c4] transition flex items-center justify-center gap-2 cursor-pointer"
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
                className="flex-1 py-4 px-5 rounded-2xl btn-tactile-blue font-black text-lg transition flex items-center justify-center gap-2 cursor-pointer"
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
