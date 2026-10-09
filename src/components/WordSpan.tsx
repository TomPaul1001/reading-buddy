import React from 'react';
import { WordToken } from '../hooks/useSpeech';

interface WordSpanProps {
  token: WordToken;
  isSpokenInPage: boolean;
  isSingleSpoken: boolean;
  isDifficult?: boolean;
  onWordClick: (token: WordToken) => void;
  fontSizeClass: string;
}

export const WordSpan: React.FC<WordSpanProps> = ({
  token,
  isSpokenInPage,
  isSingleSpoken,
  isDifficult = false,
  onWordClick,
  fontSizeClass,
}) => {
  const isHighlighted = isSpokenInPage || isSingleSpoken;

  return (
    <span className="inline-flex items-center relative my-1 mx-0.5 group">
      {token.punctuationBefore && (
        <span className="text-[#4A4A4A] font-bold select-none mr-0.5 text-lg sm:text-xl md:text-2xl">
          {token.punctuationBefore}
        </span>
      )}

      <button
        type="button"
        id={`word-${token.id}-${token.cleanWord.toLowerCase()}`}
        onClick={() => onWordClick(token)}
        title={
          isDifficult
            ? `Click to sound out "${token.cleanWord}" chunk by chunk 🧩`
            : `Click to hear "${token.cleanWord}"`
        }
        className={`inline-flex items-center justify-center px-2.5 py-1 sm:px-3.5 sm:py-1.5 md:px-4 md:py-2 rounded-xl sm:rounded-2xl transition-all duration-150 cursor-pointer select-none text-left active:scale-95 ${fontSizeClass} ${
          isHighlighted
            ? 'border-3 sm:border-4 border-[#FFD93D] bg-[#FFF9E5] text-[#D4A017] font-black shadow-md scale-105 z-10 ring-2 ring-[#FFD93D]/60 animate-word-active'
            : isDifficult
            ? 'border-2 border-[#4D96FF]/40 bg-[#F0F7FF] text-[#4D96FF] font-black hover:bg-[#E2EFFF] hover:border-[#4D96FF] hover:scale-105 shadow-xs'
            : 'border-2 border-transparent bg-[#F0F7FF] text-[#4D96FF] font-bold hover:bg-[#E2EFFF] hover:border-[#4D96FF]/30 hover:scale-105 shadow-xs'
        }`}
      >
        <span>{token.cleanWord}</span>
        {isDifficult && (
          <span
            className="ml-1 text-[11px] sm:text-xs opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform"
            title="Sound it out puzzle"
          >
            🧩
          </span>
        )}
      </button>

      {token.punctuationAfter && (
        <span className="text-[#4A4A4A] font-bold select-none ml-0.5 text-lg sm:text-xl md:text-2xl">
          {token.punctuationAfter}
        </span>
      )}
    </span>
  );
};
