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
  category?: 'Animals' | 'Adventure' | 'Magic & Fun' | 'Everyday Life' | 'Nature';
  readingLevel?: 'Level 1 (Grades K-1)' | 'Level 2 (Grades 1-2)';
  colorTheme?: {
    bg: string;
    border: string;
    badge: string;
    accent: string;
  };
  teaser: string;
  pages: StoryPage[];
}

export interface ReadingProgress {
  storyId: string;
  pageIndex: number;
  updatedAt: number;
}

export type ReadingSpeed = 'slow' | 'normal' | 'fast';
export type FontSizeMode = 'medium' | 'large' | 'xlarge';
export type AppView = 'profile-select' | 'profile-create' | 'home' | 'story-reader';
