'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, ScanOutlined } from '@ant-design/icons';
import Script from 'next/script';
import type { PageConfig } from '@/config/pages';

interface ARViewerProps {
  pageConfig: PageConfig;
  onBack: () => void;
  onScanNew: () => void;
}

declare global {
  interface Window {
    AFRAME: any;
  }
}

export default function ARViewer({ pageConfig, onBack, onScanNew }: ARViewerProps) {
  const t = useTranslations();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<'tracking' | 'found' | 'lost'>('tracking');
  const [aFrameLoaded, setAFrameLoaded] = useState(false);
  const [arJsLoaded, setArJsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<string>(t('ar.loading'));

  const videoUrl = pageConfig.videos[locale as 'en' | 'vi'] || pageConfig.videos.vi;
  const markerUrl = pageConfig.markerImage;

  useEffect(() => {
    if (aFrameLoaded && arJsLoaded && containerRef.current) {
      setLoadingProgress(t('ar.initializing'));
      initializeAR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aFrameLoaded, arJsLoaded]);

  const initializeAR = () => {
    if (!containerRef.current) return;

    try {
      setLoadingProgress(t('ar.trainingMarker'));
      // AR.js will automatically train the marker on first load
      // This can take 1-2 minutes, so we hide loading after scene is ready
      // The scene will show camera feed even while training
      setTimeout(() => {
        setIsLoading(false);
        setError(null);
      }, 3000); // Small delay to ensure scene is initialized
    } catch (err) {
      console.error('Error initializing AR:', err);
      setError(t('errors.videoLoadError'));
      setIsLoading(false);
    }
  };

  const handleMarkerFound = () => {
    setTrackingStatus('found');
  };

  const handleMarkerLost = () => {
    setTrackingStatus('lost');
  };

  return (
    <>
      {/* Load A-Frame */}
      <Script
        src="https://aframe.io/releases/1.4.2/aframe.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          setAFrameLoaded(true);
          setLoadingProgress(t('ar.loadingARjs'));
        }}
        onError={() => {
          setError(t('errors.aframeLoadError'));
          setIsLoading(false);
        }}
      />

      {/* Load AR.js */}
      <Script
        src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.2/aframe/build/aframe-ar-nft.js"
        strategy="afterInteractive"
        onLoad={() => {
          setArJsLoaded(true);
          setLoadingProgress(t('ar.initializing'));
        }}
        onError={() => {
          setError(t('errors.arjsLoadError'));
          setIsLoading(false);
        }}
      />

      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="text-white"
            >
              {t('navigation.back')}
            </Button>
            <Button
              type="text"
              icon={<ScanOutlined />}
              onClick={onScanNew}
              className="text-white"
            >
              {t('navigation.scanNew')}
            </Button>
          </div>
        </div>

        {/* AR Scene Container */}
        <div ref={containerRef} className="w-full h-full">
          {aFrameLoaded && arJsLoaded ? (
            <a-scene
              vr-mode-ui="enabled: false"
              renderer="logarithmicDepthBuffer: true; colorManagement: true;"
              embedded
              arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
              id="ar-scene"
            >
              {/* NFT Marker */}
              <a-nft
                type="nft"
                url={markerUrl}
                smooth="true"
                smoothCount="10"
                smoothTolerance="0.01"
                smoothThreshold="5"
                onMarkerFound={handleMarkerFound}
                onMarkerLost={handleMarkerLost}
              >
                <a-video
                  id="ar-video"
                  src={videoUrl}
                  width="1"
                  height="1"
                  position="0 0 0"
                  rotation="-90 0 0"
                  autoplay="true"
                  loop="true"
                  playsinline="true"
                  webkit-playsinline="true"
                />
              </a-nft>

              {/* Camera */}
              <a-entity camera />
            </a-scene>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-center text-sm drop-shadow-lg">
            {trackingStatus === 'found'
              ? t('ar.trackingFound')
              : trackingStatus === 'lost'
                ? t('ar.trackingLost')
                : t('ar.tracking')}
          </p>
        </div>

        {/* Loading - Only show when scripts are loading, not during marker training */}
        {isLoading && (!aFrameLoaded || !arJsLoaded) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
            <Spin size="large" />
            <p className="mt-4 text-white text-center px-4">{loadingProgress}</p>
            <p className="mt-2 text-white/70 text-xs text-center px-4 max-w-md">
              {t('ar.loadingHint')}
            </p>
          </div>
        )}
        
        {/* Marker Training Info - Show when scripts loaded but marker is training */}
        {aFrameLoaded && arJsLoaded && isLoading && (
          <div className="absolute bottom-24 left-4 right-4 z-20">
            <div className="bg-blue-500/90 text-white p-4 rounded-lg">
              <p className="font-semibold mb-2">{t('ar.trainingMarker')}</p>
              <p className="text-sm">{t('ar.trainingHint')}</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-20 left-4 right-4 z-20">
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          </div>
        )}
      </div>
    </>
  );
}
