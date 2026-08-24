import React, { useState } from 'react';
import { Sparkles, User, ArrowRight, ArrowLeft, Check, Edit3 } from 'lucide-react';
import { Profile } from '../types';
import { addProfile, updateProfile } from '../utils/progress';
import { APP_NAME, APP_VERSION } from '../version';
import { Footer } from './Footer';

interface ProfileSetupProps {
  initialProfile?: Profile | null;
  onProfileCreated?: (profile: Profile) => void;
  onProfileUpdated?: (profile: Profile) => void;
  onCancel?: () => void;
  hasExistingProfiles?: boolean;
}

const AVATAR_OPTIONS = [
  { emoji: '🦁', label: 'Brave Lion' },
  { emoji: '🐼', label: 'Cuddly Panda' },
  { emoji: '🦄', label: 'Magic Unicorn' },
  { emoji: '🚀', label: 'Space Explorer' },
  { emoji: '🐱', label: 'Playful Kitten' },
  { emoji: '🐶', label: 'Happy Puppy' },
  { emoji: '🦊', label: 'Clever Fox' },
  { emoji: '🐬', label: 'Friendly Dolphin' },
  { emoji: '🌟', label: 'Super Star' },
  { emoji: '🦖', label: 'Mighty Dino' },
  { emoji: '🦉', label: 'Wise Owl' },
  { emoji: '🐝', label: 'Busy Bee' },
];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  initialProfile,
  onProfileCreated,
  onProfileUpdated,
  onCancel,
  hasExistingProfiles = false,
}) => {
  const isEditing = Boolean(initialProfile);
  const [name, setName] = useState(initialProfile ? initialProfile.name : '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialProfile ? initialProfile.avatar : AVATAR_OPTIONS[0].emoji
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your first name! 😊');
      return;
    }

    if (isEditing && initialProfile) {
      const updated = updateProfile(initialProfile.id, name, selectedAvatar);
      if (updated && onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } else {
      const created = addProfile(name, selectedAvatar);
      if (onProfileCreated) {
        onProfileCreated(created);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFF9F0] font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full bg-white rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 shadow-2xl border-4 sm:border-8 border-[#FFD93D]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FF8C8C] rounded-full text-4xl mb-4 shadow-inner animate-soft-bounce">
            {selectedAvatar}
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs sm:text-sm font-black text-[#4D96FF] uppercase tracking-wider">
              {APP_NAME}
            </span>
            <span className="bg-[#FFD93D] text-[#4A4A4A] text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
              {APP_VERSION}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-[#4A4A4A] tracking-tight">
            {isEditing ? 'Edit Reader Profile' : `Welcome to ${APP_NAME}!`}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 font-medium">
            {isEditing
              ? 'Update your name or pick a new reading buddy icon!'
              : 'Let’s create your reading profile to start reading fun stories!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="child-name"
              className="block text-base sm:text-lg font-black text-[#4A4A4A] mb-2 uppercase tracking-wide"
            >
              What is your first name?
            </label>
            <div className="relative">
              <input
                id="child-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type your name (e.g., Brie, Liam)..."
                maxLength={24}
                autoFocus
                className="w-full px-5 py-4 text-xl rounded-2xl border-2 border-[#FFD93D] focus:border-[#4D96FF] bg-[#FFF9E5]/50 text-[#4A4A4A] placeholder:text-slate-400 font-bold outline-none transition"
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFD93D] w-6 h-6" />
            </div>
            {error && (
              <p className="text-[#FF6B6B] font-bold mt-2 text-sm sm:text-base">
                {error}
              </p>
            )}
          </div>

          <div>
            <label className="block text-base sm:text-lg font-black text-[#4A4A4A] mb-3 uppercase tracking-wide">
              Choose your reading buddy icon:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-3">
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = selectedAvatar === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    id={`avatar-btn-${item.emoji}`}
                    onClick={() => setSelectedAvatar(item.emoji)}
                    className={`h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-2xl sm:text-3xl transition-all duration-150 border-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF9E5] border-4 border-[#FFD93D] scale-110 shadow-md ring-2 ring-[#FFD93D]/50'
                        : 'bg-[#FFF9F0] border-slate-200 hover:border-[#FFD93D] hover:bg-[#FFF9E5]'
                    }`}
                    title={item.label}
                  >
                    <span>{item.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {(hasExistingProfiles || isEditing) && onCancel && (
              <button
                type="button"
                id="cancel-profile-btn"
                onClick={onCancel}
                className="order-2 sm:order-1 px-6 py-4 rounded-2xl border-2 border-slate-300 text-slate-600 font-black hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer uppercase"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              id="save-profile-submit-btn"
              className="order-1 sm:order-2 flex-1 px-8 py-4 rounded-2xl btn-tactile-blue font-black text-xl flex items-center justify-center gap-3 cursor-pointer uppercase"
            >
              {isEditing ? (
                <>
                  <Check className="w-6 h-6 text-white" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-white" />
                  <span>Let’s Read!</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>

    <Footer />
  </div>
);
};
