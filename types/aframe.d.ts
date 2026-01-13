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
      'a-asset-item': any;
      'a-camera': any;
      'a-plane': any;
      'a-gltf-model': any;
      'a-light': any;
      'a-box': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-sky': any;
      'a-text': any;
    }
  }
}

declare global {
  interface Window {
    AFRAME: any;
  }
}

export {};
