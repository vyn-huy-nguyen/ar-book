/**
 * Configuration for book pages
 * Each page has QR code, marker image, and videos in multiple languages
 */

export interface PageConfig {
  pageId: number;
  markerImage: string;
  targetIndex: number; // Index in targets.mind file
  videos?: {
    en: string;
    vi: string;
  };
  model?: string;
  audio?: {
    en: string;
    vi: string;
  };
  title: {
    en: string;
    vi: string;
  };
  customImage?: string;
  avatarVideo?: string;
}

export const pagesConfig: Record<number, PageConfig> = {
  1: {
    pageId: 1,
    markerImage: '/markers/page1-marker.jpg',
    targetIndex: 0,
    videos: {
      en: '/videos/page1-video-vi.mp4',
      vi: '/videos/page1-video-vi.mp4',
    },
    title: {
      en: 'Page 1 - Introduction',
      vi: 'Trang 1 - Giới thiệu',
    },
  },
  2: {
    pageId: 2,
    markerImage: '/markers/page2-marker.jpg',
    targetIndex: 1,
    avatarVideo: '/videos/page2-video-avatar.mp4',
    // Temporarily disabled model for testing
    // model:
    //   'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/softmind/scene.gltf',
    audio: {
      en: '/audio/page2-audio-en.mp3',
      vi: '/audio/page2-audio-vi.mp3',
    },
    title: {
      en: 'Page 2 - Chapter One',
      vi: 'Trang 2 - Chương Một',
    },
  },
  3: {
    pageId: 3,
    markerImage: '/markers/page3-marker.jpg',
    targetIndex: 2,
    videos: {
      en: '/videos/page3-video-vi.mp4',
      vi: '/videos/page3-video-vi.mp4',
    },
    title: {
      en: 'Page 3 - Chapter Two',
      vi: 'Trang 3 - Chương Hai',
    },
  },
};

/**
 * Get page configuration by page ID
 */
export function getPageConfig(pageId: number): PageConfig | null {
  return pagesConfig[pageId] || null;
}

/**
 * Get all pages configuration
 */
export function getAllPagesConfig(): Record<number, PageConfig> {
  return pagesConfig;
}
