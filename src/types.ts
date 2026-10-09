export interface Profile {
  id: string;
  name: string;
  avatar: string;
  createdAt: number;
}

export interface StoryPage {
  text: string;
  sceneEmoji?: string;
  question?: string;
}

export interface Story {
  id: string;
  title: string;
  icon: string;
  category?: 'Dr. Seuss' | 'Elephant & Piggie' | 'Pout-Pout Fish' | 'Animals' | 'Adventure' | 'Magic & Fun' | 'Everyday Life' | 'Nature' | string;
  readingLevel?: 'Level 1 (Grades K-1)' | 'Level 2 (Grades 1-2)' | 'Level 1 (Mo Willems)' | 'Level 1 (Deborah Diesen)' | 'Level 1 (Adam Rubin)' | string;
  isNew?: boolean;
  colorTheme?: {
    bg: string;
    border: string;
    badge: string;
    accent: string;
  };
  teaser: string;
  pages: StoryPage[];
  difficultWords?: Record<string, string[]>;
}

export interface ReadingProgress {
  storyId: string;
  pageIndex: number;
  updatedAt: number;
}

export type ReadingSpeed = 'slow' | 'normal' | 'fast';
export type FontSizeMode = 'medium' | 'large' | 'xlarge';
export type AppView = 'profile-select' | 'profile-create' | 'profile-edit' | 'home' | 'story-reader';
