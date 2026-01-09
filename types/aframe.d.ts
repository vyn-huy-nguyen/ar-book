/**
 * Type declarations for A-Frame and AR.js
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-nft': any;
      'a-video': any;
      'a-entity': any;
      'a-assets': any;
      'a-camera': any;
      'a-plane': any;
    }
  }
}

declare global {
  interface Window {
    AFRAME: any;
  }
}

export {};
