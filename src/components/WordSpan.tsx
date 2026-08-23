import React from 'react';
import { WordToken } from '../hooks/useSpeech';

interface WordSpanProps {
  token: WordToken;
  isSpokenInPage: boolean;
  isSingleSpoken: boolean;
  onWordClick: (token: WordToken) => void;
  fontSizeClass: string;
}

export const WordSpan: React.FC<WordSpanProps> = ({
  token,
  isSpokenInPage,
  isSingleSpoken,
  onWordClick,
  fontSizeClass,
}) => {
  const isHighlighted = isSpokenInPage || isSingleSpoken;

  return (
    <span className="inline-flex items-center relative my-1.5 mx-1 group">
      {token.punctuationBefore && (
        <span className="text-[#4A4A4A] font-bold select-none mr-1 text-xl sm:text-2xl">
          {token.punctuationBefore}
        </span>
      )}

      <button
        type="button"
        id={`word-${token.id}-${token.cleanWord.toLowerCase()}`}
        onClick={() => onWordClick(token)}
        title={`Click to hear "${token.cleanWord}"`}
        className={`inline-flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl transition-all duration-150 cursor-pointer select-none text-left active:scale-95 ${fontSizeClass} ${
          isHighlighted
            ? 'border-4 border-[#FFD93D] bg-[#FFF9E5] text-[#D4A017] font-black shadow-md scale-105 sm:scale-110 z-10 ring-2 ring-[#FFD93D]/60 animate-word-active'
            : 'border-2 border-transparent bg-[#F0F7FF] text-[#4D96FF] font-bold hover:bg-[#E2EFFF] hover:border-[#4D96FF]/30 hover:scale-105 shadow-sm'
        }`}
      >
        {token.cleanWord}
      </button>

      {token.punctuationAfter && (
        <span className="text-[#4A4A4A] font-bold select-none ml-1 text-xl sm:text-2xl">
          {token.punctuationAfter}
        </span>
      )}
    </span>
  );
};
