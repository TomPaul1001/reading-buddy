import { Profile, ReadingProgress } from '../types';

const PROFILES_KEY = 'readingBuddy_profiles';
const ACTIVE_PROFILE_KEY = 'readingBuddy_activeProfile';

// In-memory fallback if localStorage is disabled or throws in sandboxed iframes
const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch (err) {
    console.warn(`localStorage getItem failed for "${key}":`, err);
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, value: string): void {
  memoryStore[key] = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`localStorage setItem failed for "${key}":`, err);
  }
}

function safeRemoveItem(key: string): void {
  delete memoryStore[key];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`localStorage removeItem failed for "${key}":`, err);
  }
}

export function getProfiles(): Profile[] {
  try {
    const raw = safeGetItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load profiles:', err);
    return [];
  }
}

export function saveProfiles(profiles: Profile[]): void {
  try {
    safeSetItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles:', err);
  }
}

export function getActiveProfileId(): string | null {
  try {
    return safeGetItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

export function setActiveProfileId(profileId: string | null): void {
  try {
    if (profileId) {
      safeSetItem(ACTIVE_PROFILE_KEY, profileId);
    } else {
      safeRemoveItem(ACTIVE_PROFILE_KEY);
    }
  } catch (err) {
    console.error('Failed to set active profile:', err);
  }
}

export function getActiveProfile(): Profile | null {
  try {
    const activeId = getActiveProfileId();
    if (!activeId) return null;
    const profiles = getProfiles();
    return profiles.find((p) => p.id === activeId) || null;
  } catch {
    return null;
  }
}

export function addProfile(name: string, avatar: string): Profile {
  const profiles = getProfiles();
  const newProfile: Profile = {
    id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: (name || 'Reader').trim(),
    avatar: avatar || '🦁',
    createdAt: Date.now(),
  };
  const updated = [...profiles, newProfile];
  saveProfiles(updated);
  setActiveProfileId(newProfile.id);
  return newProfile;
}

export function updateProfile(profileId: string, name: string, avatar: string): Profile | null {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === profileId);
  if (index === -1) return null;
  const updatedProfile: Profile = {
    ...profiles[index],
    name: (name || 'Reader').trim(),
    avatar: avatar || '🦁',
  };
  profiles[index] = updatedProfile;
  saveProfiles(profiles);
  return updatedProfile;
}

export function deleteProfile(profileId: string): void {
  const profiles = getProfiles().filter((p) => p.id !== profileId);
  saveProfiles(profiles);
  try {
    safeRemoveItem(`readingBuddy_progress_${profileId}`);
    safeRemoveItem(`readingBuddy_completed_${profileId}`);
    if (getActiveProfileId() === profileId) {
      setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
    }
  } catch (err) {
    console.error('Failed to clean up profile data:', err);
  }
}

export function getProgress(profileId: string): ReadingProgress | null {
  try {
    const raw = safeGetItem(`readingBuddy_progress_${profileId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ReadingProgress;
  } catch (err) {
    console.error('Failed to get progress:', err);
    return null;
  }
}

export function saveProgress(profileId: string, storyId: string, pageIndex: number): void {
  try {
    const progress: ReadingProgress = {
      storyId,
      pageIndex,
      updatedAt: Date.now(),
    };
    safeSetItem(`readingBuddy_progress_${profileId}`, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}

export function clearProgress(profileId: string): void {
  try {
    safeRemoveItem(`readingBuddy_progress_${profileId}`);
  } catch (err) {
    console.error('Failed to clear progress:', err);
  }
}

export function getCompletedStories(profileId: string): string[] {
  try {
    const raw = safeGetItem(`readingBuddy_completed_${profileId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to get completed stories:', err);
    return [];
  }
}

export function markStoryCompleted(profileId: string, storyId: string): void {
  try {
    const completed = getCompletedStories(profileId);
    if (!completed.includes(storyId)) {
      const updated = [...completed, storyId];
      safeSetItem(`readingBuddy_completed_${profileId}`, JSON.stringify(updated));
    }
    // Also clear in-progress marker for this profile if it was this story
    const currentProgress = getProgress(profileId);
    if (currentProgress && currentProgress.storyId === storyId) {
      clearProgress(profileId);
    }
  } catch (err) {
    console.error('Failed to mark story completed:', err);
  }
}

export function isStoryCompleted(profileId: string, storyId: string): boolean {
  try {
    const completed = getCompletedStories(profileId);
    return completed.includes(storyId);
  } catch {
    return false;
  }
}

