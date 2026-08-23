import React, { useState } from 'react';
import { UserPlus, Star, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { Profile } from '../types';
import { getCompletedStories, getProgress, deleteProfile } from '../utils/progress';

interface ProfileSelectProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onAddNewReader: () => void;
  onProfilesChanged: () => void;
}

export const ProfileSelect: React.FC<ProfileSelectProps> = ({
  profiles,
  onSelectProfile,
  onAddNewReader,
  onProfilesChanged,
}) => {
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  const handleDelete = (profile: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileToDelete(profile);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteProfile(profileToDelete.id);
      setProfileToDelete(null);
      onProfilesChanged();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#FFF9F0] font-sans selection:bg-[#FFD93D]/40">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD93D] text-[#4A4A4A] rounded-2xl text-3xl mb-4 shadow-md animate-soft-bounce">
            📖
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-[#4A4A4A] tracking-tight">
            Who’s Reading Today?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 font-medium">
            Pick your profile or create a new reader account to continue your story journey!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {profiles.map((profile) => {
            const completed = getCompletedStories(profile.id);
            const progress = getProgress(profile.id);

            return (
              <div
                key={profile.id}
                id={`profile-card-${profile.id}`}
                onClick={() => onSelectProfile(profile)}
                className="group relative bg-white rounded-[32px] p-6 sm:p-7 border-4 border-[#FFD93D] hover:border-[#4D96FF] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  id={`delete-profile-${profile.id}`}
                  onClick={(e) => handleDelete(profile, e)}
                  title="Remove profile"
                  className="absolute top-3 right-3 p-2 rounded-full text-slate-300 hover:text-[#FF6B6B] hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FF8C8C] rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-4 shadow-inner group-hover:scale-105 transition">
                  {profile.avatar}
                </div>

                <h3 className="text-2xl font-black font-heading text-[#4A4A4A] group-hover:text-[#4D96FF] transition">
                  {profile.name}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm font-black text-[#D4A017] bg-[#FFF9E5] px-3.5 py-1.5 rounded-full border border-[#FFD93D]">
                  <Star className="w-4 h-4 fill-[#FFD93D] text-[#FFD93D]" />
                  <span>{completed.length} {completed.length === 1 ? 'Star Earned' : 'Stars Earned'}</span>
                </div>

                {progress && (
                  <div className="mt-2 text-xs font-bold text-[#4D96FF] bg-[#F0F7FF] px-3 py-1 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Story in progress</span>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            id="add-new-reader-card-btn"
            onClick={onAddNewReader}
            className="group min-h-[220px] bg-white hover:bg-[#FFF9E5] rounded-[32px] p-6 border-4 border-dashed border-[#FFD93D] hover:border-[#6BCB77] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#6BCB77] rounded-full flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition">
              <UserPlus className="w-8 h-8" />
            </div>
            <span className="text-xl font-black font-heading text-[#4A4A4A] group-hover:text-[#6BCB77]">
              Add New Reader
            </span>
            <span className="text-xs text-slate-500 mt-1 font-semibold">
              Create another profile
            </span>
          </button>
        </div>

        {profileToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-word-active">
            <div className="bg-white rounded-[36px] p-6 sm:p-8 max-w-sm w-full border-4 border-[#FF6B6B] text-center shadow-2xl">
              <div className="text-5xl mb-2">{profileToDelete.avatar}</div>
              <h3 className="text-2xl font-black text-[#4A4A4A] mb-2 font-heading">
                Delete {profileToDelete.name}’s Profile?
              </h3>
              <p className="text-slate-600 text-sm mb-6 font-medium">
                This will delete reading stars and saved progress on this device.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  id="cancel-delete-profile-btn"
                  onClick={() => setProfileToDelete(null)}
                  className="flex-1 py-3 rounded-2xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Keep
                </button>
                <button
                  type="button"
                  id="confirm-delete-profile-btn"
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl btn-tactile-red font-bold text-white transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
