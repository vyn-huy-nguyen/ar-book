/**
 * Type declarations for A-Frame and AR.js
 */

declare namespace JSX {
  interface IntrinsicElements {
    'a-scene': any;
    'a-nft': any;
    'a-video': any;
    'a-entity': any;
  }
}

declare global {
  interface Window {
    AFRAME: any;
  }
}

export {};

