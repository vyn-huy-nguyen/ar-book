/**
 * Configuration for book pages
 * Each page has QR code, marker image, and videos in multiple languages
 */

export interface PageConfig {
  pageId: number;
  markerImage: string;
  videos: {
    en: string;
    vi: string;
  };
  title: {
    en: string;
    vi: string;
  };
}

export const pagesConfig: Record<number, PageConfig> = {
  1: {
    pageId: 1,
    markerImage: '/markers/page1-marker.png',
    videos: {
      en: '/videos/page1-video-en.mp4',
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
    videos: {
      en: '/videos/page2-video-en.mp4',
      vi: '/videos/page2-video-vi.mp4',
    },
    title: {
      en: 'Page 2 - Chapter One',
      vi: 'Trang 2 - Chương Một',
    },
  },
  3: {
    pageId: 3,
    markerImage: '/markers/page3-marker.jpg',
    videos: {
      en: '/videos/page3-video-en.mp4',
      vi: '/videos/page3-video-vi.mp4',
    },
    title: {
      en: 'Page 3 - Chapter Two',
      vi: 'Trang 3 - Chương Hai',
    },
  },
  4: {
    pageId: 4,
    markerImage: '/markers/page4-marker.jpg',
    videos: {
      en: '/videos/page4-video-en.mp4',
      vi: '/videos/page4-video-vi.mp4',
    },
    title: {
      en: 'Page 4 - Conclusion',
      vi: 'Trang 4 - Kết luận',
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

