import React, { useState, useEffect } from 'react';
import { Profile, Story, AppView } from './types';
import { APP_TITLE, APP_DOCUMENT_TITLE } from './version';
import {
  getProfiles,
  getActiveProfile,
  setActiveProfileId,
} from './utils/progress';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileSelect } from './components/ProfileSelect';
import { Home } from './components/Home';
import { StoryReader } from './components/StoryReader';

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(() => getProfiles());
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() => getActiveProfile());
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editSourceView, setEditSourceView] = useState<'home' | 'profile-select'>('profile-select');

  const [currentView, setCurrentView] = useState<AppView>(() => {
    const storedProfiles = getProfiles();
    if (storedProfiles.length === 0) {
      return 'profile-create';
    }
    const active = getActiveProfile();
    if (!active) {
      return storedProfiles.length > 1 ? 'profile-select' : 'home';
    }
    return 'home';
  });

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [initialPageIndex, setInitialPageIndex] = useState<number>(0);

  // Synchronize document title with version and active story
  useEffect(() => {
    if (currentView === 'story-reader' && selectedStory) {
      document.title = `${selectedStory.title} | ${APP_TITLE}`;
    } else {
      document.title = APP_DOCUMENT_TITLE;
    }
  }, [currentView, selectedStory]);

  // Synchronize active profile on initial mount if 1 profile exists
  useEffect(() => {
    const currentList = getProfiles();
    setProfiles(currentList);

    if (currentList.length === 0) {
      setCurrentView('profile-create');
      setActiveProfile(null);
    } else if (!activeProfile) {
      if (currentList.length === 1) {
        setActiveProfileId(currentList[0].id);
        setActiveProfile(currentList[0]);
      } else {
        setCurrentView('profile-select');
      }
    }
  }, []);

  const handleProfileCreated = (newProfile: Profile) => {
    const updated = getProfiles();
    setProfiles(updated);
    setActiveProfile(newProfile);
    setActiveProfileId(newProfile.id);
    setCurrentView('home');
  };

  const handleProfileUpdated = (updatedProfile: Profile) => {
    const currentList = getProfiles();
    setProfiles(currentList);
    if (activeProfile?.id === updatedProfile.id) {
      setActiveProfile(updatedProfile);
    }
    setEditingProfile(null);
    setCurrentView(editSourceView);
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setCurrentView(editSourceView);
  };

  const handleEditProfileFromSelect = (profile: Profile) => {
    setEditingProfile(profile);
    setEditSourceView('profile-select');
    setCurrentView('profile-edit');
  };

  const handleEditProfileFromHome = () => {
    if (activeProfile) {
      setEditingProfile(activeProfile);
      setEditSourceView('home');
      setCurrentView('profile-edit');
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile);
    setActiveProfileId(profile.id);
    setCurrentView('home');
  };

  const handleSwitchReader = () => {
    const currentList = getProfiles();
    setProfiles(currentList);
    setCurrentView('profile-select');
  };

  const handleAddNewReader = () => {
    setCurrentView('profile-create');
  };

  const handleProfilesChanged = () => {
    const currentList = getProfiles();
    setProfiles(currentList);
    const active = getActiveProfile();
    setActiveProfile(active);
    if (currentList.length === 0) {
      setCurrentView('profile-create');
    }
  };

  const handleSelectStory = (story: Story, startPageIndex: number = 0) => {
    setSelectedStory(story);
    setInitialPageIndex(startPageIndex);
    setCurrentView('story-reader');
  };

  const handleBackToHome = () => {
    setSelectedStory(null);
    setCurrentView('home');
  };

  // Render current view
  if (currentView === 'profile-create') {
    return (
      <ProfileSetup
        onProfileCreated={handleProfileCreated}
        onCancel={profiles.length > 0 ? () => setCurrentView('profile-select') : undefined}
        hasExistingProfiles={profiles.length > 0}
      />
    );
  }

  if (currentView === 'profile-edit' && editingProfile) {
    return (
      <ProfileSetup
        initialProfile={editingProfile}
        onProfileUpdated={handleProfileUpdated}
        onCancel={handleCancelEdit}
        hasExistingProfiles={true}
      />
    );
  }

  if (currentView === 'profile-select' || !activeProfile) {
    return (
      <ProfileSelect
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onEditProfile={handleEditProfileFromSelect}
        onAddNewReader={handleAddNewReader}
        onProfilesChanged={handleProfilesChanged}
      />
    );
  }

  if (currentView === 'story-reader' && selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        initialPageIndex={initialPageIndex}
        profile={activeProfile}
        onBackToHome={handleBackToHome}
        onStoryCompleted={() => {
          // Re-render state to update stars on home
          setProfiles(getProfiles());
        }}
      />
    );
  }

  return (
    <Home
      profile={activeProfile}
      onSelectStory={handleSelectStory}
      onSwitchReader={handleSwitchReader}
      onAddNewReader={handleAddNewReader}
      onEditProfile={handleEditProfileFromHome}
    />
  );
}
