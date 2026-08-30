import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Users,
  Play,
  CheckCircle2,
  Volume2,
  BookOpen,
  Layers,
  Award,
  Search,
  Pencil,
} from 'lucide-react';
import { Profile, Story, ReadingProgress } from '../types';
import { STORIES } from '../data/stories';
import { StoryCard } from './StoryCard';
import { Footer } from './Footer';
import { getProgress, getCompletedStories } from '../utils/progress';
import { APP_VERSION } from '../version';

interface HomeProps {
  profile: Profile;
  onSelectStory: (story: Story, pageIndex?: number) => void;
  onSwitchReader: () => void;
  onAddNewReader: () => void;
  onEditProfile?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  profile,
  onSelectStory,
  onSwitchReader,
  onAddNewReader,
  onEditProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const completedStoryIds = getCompletedStories(profile.id);
  const currentProgress = getProgress(profile.id);

  // Find in-progress story if any
  const inProgressStory = currentProgress
    ? STORIES.find((s) => s.id === currentProgress.storyId)
    : null;

  const categories = [
    'All',
    'Unread',
    'Completed',
    'Elephant & Piggie',
    'Pout-Pout Fish',
    'Animals',
    'Adventure',
    'Magic & Fun',
    'Everyday Life',
    'Nature',
  ];

  // Filter stories
  const filteredStories = STORIES.filter((story) => {
    // Search query match
    if (
      searchQuery.trim() &&
      !story.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !story.teaser.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Unread') return !completedStoryIds.includes(story.id);
    if (selectedCategory === 'Completed') return completedStoryIds.includes(story.id);
    return story.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col font-sans selection:bg-[#FFD93D]/40">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#FFF9F0]/95 backdrop-blur-md border-b-2 border-[#FFD93D] px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & App title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFD93D] rounded-2xl border-2 border-[#4A4A4A]/10 flex items-center justify-center text-2xl shadow-sm">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xl sm:text-2xl font-black text-[#4A4A4A] tracking-tight block leading-tight">
                  Reading Buddy
                </span>
                <span className="bg-[#FFD93D] text-[#4A4A4A] text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                  {APP_VERSION}
                </span>
              </div>
            </div>
          </div>

          {/* Active Profile Info & Switch Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Reader Profile Pill */}
            <div className="flex items-center gap-2.5 bg-white pl-3.5 pr-2 sm:pr-3 py-1.5 rounded-full border-2 border-[#FFD93D] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#FF8C8C] flex items-center justify-center text-lg shadow-inner">
                {profile.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-[#4A4A4A] leading-none">{profile.name}</p>
                <p className="text-[10px] font-bold text-[#6BCB77] mt-0.5">
                  {completedStoryIds.length} Stars ⭐
                </p>
              </div>

              {onEditProfile && (
                <button
                  type="button"
                  id="edit-active-profile-btn"
                  onClick={onEditProfile}
                  title="Edit profile & avatar"
                  className="p-1.5 rounded-full text-slate-400 hover:text-[#4D96FF] hover:bg-blue-50 transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              id="switch-reader-btn"
              onClick={onSwitchReader}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-[#6BCB77] text-[#6BCB77] hover:bg-[#6BCB77] hover:text-white font-black text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer uppercase"
            >
              <Users className="w-4 h-4" />
              <span>Switch Reader</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 flex-1">
        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden bg-[#4D96FF] rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 text-white shadow-xl mb-8 border-4 sm:border-6 border-[#FFD93D]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-4 py-1 rounded-full text-xs sm:text-sm font-black mb-3 border border-white/30 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-[#FFD93D]" />
                <span>Ready for an adventure?</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight leading-tight">
                Hi {profile.name}! {profile.avatar}
              </h1>
              <p className="text-white/90 text-base sm:text-lg mt-2 font-medium leading-relaxed">
                Pick any story below to read, tap words to listen, or have your buddy read aloud with you!
              </p>
            </div>

            {/* Reading Star Badges */}
            <div className="bg-white/20 backdrop-blur-md rounded-[28px] p-4 sm:p-6 border-2 border-white/30 flex items-center gap-4 self-start md:self-auto shadow-inner">
              <div className="w-14 h-14 bg-[#FFD93D] rounded-2xl flex items-center justify-center text-3xl shadow-md text-[#4A4A4A]">
                ⭐
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-white/80 font-black block">
                  Stars Collected
                </span>
                <span className="text-3xl font-black font-heading text-white">
                  {completedStoryIds.length} / {STORIES.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue In-Progress Story Banner (if any) */}
        {inProgressStory && currentProgress && (
          <div className="bg-[#6BCB77] rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 text-white shadow-lg mb-8 border-4 border-[#FFD93D] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-4xl shrink-0">
                {inProgressStory.icon}
              </div>
              <div>
                <span className="inline-block bg-white/20 text-white text-xs font-black px-3 py-0.5 rounded-full mb-1 uppercase tracking-wider">
                  Continue Reading
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-heading line-clamp-1">
                  {inProgressStory.title}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm font-semibold">
                  Resume at Page {currentProgress.pageIndex + 1} of {inProgressStory.pages.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="continue-story-top-btn"
              onClick={() => onSelectStory(inProgressStory, currentProgress.pageIndex)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF9F0] text-[#4A4A4A] font-black text-base sm:text-lg shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-2 border-[#FFD93D]"
            >
              <Play className="w-5 h-5 fill-[#6BCB77] text-[#6BCB77]" />
              <span>Continue Story</span>
            </button>
          </div>
        )}

        {/* Story Categories & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFD93D] text-[#4A4A4A] shadow-md border-2 border-[#FFD93D]'
                      : 'bg-white hover:bg-[#FFF9E5] text-[#4A4A4A] border-2 border-[#FFD93D]/60'
                  }`}
                >
                  {cat === 'Unread' && '📖 '}
                  {cat === 'Completed' && '⭐ '}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative sm:w-64">
            <input
              type="text"
              id="story-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border-2 border-[#FFD93D] focus:border-[#4D96FF] bg-white text-[#4A4A4A] placeholder:text-slate-400 font-bold outline-none transition shadow-xs"
            />
            <Search className="w-4 h-4 text-[#FFD93D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border-4 border-dashed border-[#FFD93D] p-8">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-xl font-black font-heading text-[#4A4A4A]">No stories found</h3>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Try picking another category or clear your search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-2.5 rounded-2xl btn-tactile-blue font-black text-sm uppercase"
            >
              Show All Stories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isCompleted={completedStoryIds.includes(story.id)}
                progress={currentProgress?.storyId === story.id ? currentProgress : null}
                onSelectStory={onSelectStory}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
