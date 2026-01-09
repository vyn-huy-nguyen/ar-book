import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Button, Spin } from 'antd';
import { ArrowLeftOutlined, ScanOutlined } from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { PageConfig } from '@/config/pages';

interface ARViewerProps {
  pageConfig: PageConfig;
  onBack: () => void;
  onScanNew: () => void;
}

export default function ARViewer({ pageConfig, onBack, onScanNew }: ARViewerProps) {
  const t = useTranslations();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState<'tracking' | 'found' | 'lost'>('tracking');
  const [scriptsLoaded, setScriptsLoaded] = useState({ aframe: false, mindar: false });

  const videoUrl = pageConfig.videos[locale as 'en' | 'vi'] || pageConfig.videos.vi;

  // Cleanup function to stop AR when unmounting
  useEffect(() => {
    return () => {
      // In Strict Mode (Dev), this might kill the camera stream for the immediate re-mount.
      // We'll let the browser cleanup naturally or handle valid navigation leave separately.
      // stopAR();
    };
  }, []);

  const stopAR = () => {
    const video = document.querySelector('video');
    if (video) {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleSmartBack = () => {
    stopAR();
    onBack();
  };

  const handleSmartScan = () => {
    stopAR();
    onScanNew();
  };

  // Initialize AR events after scripts load
  useEffect(() => {
    if (scriptsLoaded.aframe && scriptsLoaded.mindar && containerRef.current) {
      // Setup events immediately to catch early tracking
      setupEvents();
    }
  }, [scriptsLoaded]);

  const setupEvents = () => {
    const target = document.querySelector('#target-entity');
    if (!target) return;

    target.addEventListener('targetFound', () => {
      console.log('MindAR: Found');
      setTrackingStatus('found');
      const vid = document.querySelector('#ar-video') as any;
      if (vid) {
        vid.play();
        setIsPlaying(true);
      }
    });

    target.addEventListener('targetLost', () => {
      console.log('MindAR: Lost');
      setTrackingStatus('lost');
      const vid = document.querySelector('#ar-video') as any;
      if (vid) {
        vid.pause();
        setIsPlaying(false);
      }
    });

    // Unlock audio on body click (iOS constraint)
    document.body.addEventListener(
      'click',
      () => {
        const vid = document.querySelector('#ar-video') as any;
        if (vid && isPlaying) vid.play();
      },
      { once: true }
    );
  };

  const togglePlay = () => {
    const vid = document.querySelector('#ar-video') as any;
    if (vid) {
      if (isPlaying) vid.pause();
      else vid.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const vid = document.querySelector('#ar-video') as any;
    if (vid) {
      vid.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <Script
        src="https://aframe.io/releases/1.5.0/aframe.min.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, aframe: true }))}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"
        strategy="afterInteractive"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, mindar: true }))}
      />

      {/* Force A-Frame Canvas Visibility */}
      <style jsx global>{`
        .a-canvas {
          z-index: 999 !important;
          background-color: transparent !important;
        }
        /* Ensure MindAR video is behind */
        video {
          z-index: -2 !important;
        }
      `}</style>

      <div className="relative h-dvh w-full overflow-hidden bg-transparent">
        {/* Header */}
        <div className="absolute left-0 right-0 top-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleSmartBack}
              className="flex h-10 items-center px-4 text-white"
            >
              {t('navigation.back')}
            </Button>
            <Button
              type="text"
              icon={<ScanOutlined />}
              onClick={handleSmartScan}
              className="flex h-10 items-center px-4 text-white"
            >
              {t('navigation.scanNew')}
            </Button>
          </div>
        </div>

        {/* Scene */}
        <div ref={containerRef} className="relative z-0 h-full w-full">
          {/* External Video Element (Hidden but active) */}
          <video
            id="ar-video"
            src={videoUrl}
            style={{
              position: 'fixed',
              top: '-10000px',
              left: 0,
              width: '300px',
              height: '169px',
            }}
            loop
            crossOrigin="anonymous"
            playsInline
            autoPlay
            muted
            ref={(el) => {
              if (el) el.setAttribute('webkit-playsinline', 'true');
            }}
          />

          {scriptsLoaded.aframe && scriptsLoaded.mindar ? (
            <a-scene
              mindar-image="imageTargetSrc: ./targets.mind; filterMinCF:0.0001; filterBeta: 0.001;"
              color-space="sRGB"
              renderer="colorManagement: true, physicallyCorrectLights"
              vr-mode-ui="enabled: false"
              device-orientation-permission-ui="enabled: false"
              embedded
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              {/* Camera */}
              <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

              <a-entity
                id="target-entity"
                mindar-image-target={`targetIndex: ${pageConfig.targetIndex}`}
              >
                <a-video
                  src="#ar-video"
                  width="1"
                  height="0.5625"
                  position="0 0 0.1"
                  rotation="0 0 0"
                  material="side: double; transparent: true; opacity: 1;"
                ></a-video>
              </a-entity>
            </a-scene>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spin size="large" tip="Loading MindAR..." />
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        {trackingStatus === 'found' && (
          <div className="absolute bottom-8 right-4 z-50 flex gap-4">
            <Button
              shape="circle"
              size="large"
              type={isPlaying ? 'default' : 'primary'}
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center border-none bg-white/80 text-xl shadow-lg backdrop-blur"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </Button>
            <Button
              shape="circle"
              size="large"
              onClick={toggleMute}
              className="flex h-12 w-12 items-center justify-center border-none bg-white/80 text-xl shadow-lg backdrop-blur"
            >
              {isMuted ? '🔇' : '🔊'}
            </Button>
          </div>
        )}

        {/* Status Bar */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/70 to-transparent p-4 pb-8">
          <p className="text-center text-sm text-white drop-shadow-lg">
            {trackingStatus === 'found'
              ? t('ar.trackingFound')
              : trackingStatus === 'lost'
                ? t('ar.trackingLost')
                : t('ar.tracking')}
          </p>
        </div>
      </div>
    </>
  );
}
