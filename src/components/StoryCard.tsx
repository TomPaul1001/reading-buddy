import React from 'react';
import { Star, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Story, ReadingProgress } from '../types';

interface StoryCardProps {
  story: Story;
  isCompleted: boolean;
  progress: ReadingProgress | null;
  onSelectStory: (story: Story, startPageIndex?: number) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isCompleted,
  progress,
  onSelectStory,
}) => {
  const isInProgress = !!progress && progress.storyId === story.id && progress.pageIndex > 0;
  const targetPageIndex = isInProgress ? progress.pageIndex : 0;
  const totalPages = story.pages.length;

  return (
    <div
      id={`story-card-${story.id}`}
      onClick={() => onSelectStory(story, targetPageIndex)}
      className="group relative bg-white rounded-[32px] p-6 sm:p-7 border-4 border-[#FFD93D] hover:border-[#4D96FF] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF9E5] border-2 border-[#FFD93D] flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform duration-200">
            {story.icon}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {story.isNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFD93D] text-[#4A4A4A] text-xs font-black shadow-2xs border border-amber-300">
                ✨ NEW
              </span>
            )}

            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#6BCB77] text-white text-xs font-black shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finished ⭐</span>
              </span>
            )}

            {isInProgress && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4D96FF] text-white text-xs font-bold shadow-xs">
                <BookOpen className="w-3 h-3" />
                <span>Page {progress.pageIndex + 1}/{totalPages}</span>
              </span>
            )}

            {story.readingLevel && (
              <span className="text-xs font-bold text-[#4A4A4A] bg-[#FFF9F0] border border-[#FFD93D] px-2.5 py-0.5 rounded-full">
                {story.readingLevel}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black font-heading text-[#4A4A4A] group-hover:text-[#4D96FF] transition mb-2 leading-tight">
          {story.title}
        </h3>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-2 mb-4 font-medium">
          {story.teaser}
        </p>
      </div>

      <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
          {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
        </span>

        <button
          type="button"
          className="btn-tactile-blue px-4 py-1.5 rounded-xl font-black text-sm uppercase flex items-center gap-1.5 transition"
        >
          <span>{isInProgress ? 'Resume' : 'Read'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
