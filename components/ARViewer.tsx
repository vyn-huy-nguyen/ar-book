import { useEffect, useRef, useState, useMemo } from 'react';
import { Button, Spin, Tooltip } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { pagesConfig } from '@/config/pages';

interface ARViewerProps {
  onBack: () => void;
}

export default function ARViewer({ onBack }: ARViewerProps) {
  const t = useTranslations();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const [activePageId, setActivePageId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState<'tracking' | 'found' | 'lost'>('tracking');
  const [scriptsLoaded, setScriptsLoaded] = useState({ aframe: false, mindar: false });
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const allPages = useMemo(() => Object.values(pagesConfig), []);

  // Refs for media
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  // Cleanup function to stop AR and Audio when unmounting
  useEffect(() => {
    const audios = audioRefs.current;
    return () => {
      stopAR();
      Object.values(audios).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const stopAR = () => {
    // 1. Stop Camera tracks
    const video = document.querySelector('video');
    if (video) {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.remove();
    }

    // 2. Remove MindAR specifically generated elements from body
    document.querySelectorAll('.mindar-ui-overlay').forEach((el) => el.remove());
    document.querySelectorAll('video[style*="position: fixed"]').forEach((el) => el.remove());

    // 3. Restore body styles that MindAR/A-Frame might have changed
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.documentElement.style.overflow = '';

    // 4. Pause A-Frame scene
    const scene = document.querySelector('a-scene');
    if (scene) {
      (scene as any).pause();
      if ((scene as any).renderer) {
        (scene as any).renderer.dispose();
      }
    }
  };

  const handleSmartBack = () => {
    stopAR();
    onBack();
  };

  // Initialize AR events after checking scripts globally
  useEffect(() => {
    // Check if scripts are already loaded globally
    if (window.AFRAME && window.MINDAR) {
      setScriptsLoaded({ aframe: true, mindar: true });
    } else {
      // Fallback: wait a bit if scripts are still initializing
      const checkScripts = setInterval(() => {
        if (window.AFRAME && window.MINDAR) {
          setScriptsLoaded({ aframe: true, mindar: true });
          clearInterval(checkScripts);
        }
      }, 100);
      return () => clearInterval(checkScripts);
    }
  }, []);

  useEffect(() => {
    if (scriptsLoaded.aframe && scriptsLoaded.mindar && containerRef.current) {
      setupEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptsLoaded.aframe, scriptsLoaded.mindar]);

  const activePageIdRef = useRef<number | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const trackingStatusRef = useRef<'tracking' | 'found' | 'lost'>('tracking');

  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    trackingStatusRef.current = trackingStatus;
  }, [trackingStatus]);

  // CENTRALIZED MEDIA SYNC LOGIC
  // This ensure media elements always match the React state.
  useEffect(() => {
    if (!scriptsLoaded.aframe || !scriptsLoaded.mindar) return;

    allPages.forEach((p) => {
      const v = videoRefs.current[p.pageId];
      const a = audioRefs.current[p.pageId];
      const isActive = activePageId === p.pageId && trackingStatus === 'found';

      if (v) {
        if (isActive && isPlaying) {
          // Play visuals. Mute if there is a separate audio track.
          const shouldBeMuted = !!a || !isAudioUnlocked || isMuted;
          if (v.muted !== shouldBeMuted) v.muted = shouldBeMuted;
          if (v.paused) v.play().catch(() => {});
        } else {
          if (!v.paused) v.pause();
          v.muted = true;
        }
      }
      if (a) {
        // Audio respects the same logic. Priority for sound if video is present.
        if (isActive && isPlaying) {
          const shouldBeMuted = !isAudioUnlocked || isMuted;
          if (a.muted !== shouldBeMuted) a.muted = shouldBeMuted;
          if (a.paused) a.play().catch(() => {});
        } else {
          if (!a.paused) a.pause();
          a.muted = true;
        }
      }
    });
  }, [
    activePageId,
    trackingStatus,
    isPlaying,
    isMuted,
    isAudioUnlocked,
    allPages,
    scriptsLoaded,
    locale,
  ]);

  const setupEvents = () => {
    allPages.forEach((page) => {
      const target = document.querySelector(`#target-${page.pageId}`);
      if (!target) return;

      target.addEventListener('targetFound', () => {
        console.log(`MindAR: Found target ${page.pageId}`);
        const previousPageId = activePageIdRef.current;

        // Reset to beginning only if switching markers
        if (previousPageId !== null && previousPageId !== page.pageId) {
          console.log(
            `Switching from marker ${previousPageId} to ${page.pageId}. Resetting all media.`
          );
          allPages.forEach((p) => {
            const v = videoRefs.current[p.pageId];
            const a = audioRefs.current[p.pageId];
            if (v) v.currentTime = 0;
            if (a) a.currentTime = 0;
          });
        }

        setTrackingStatus('found');
        setActivePageId(page.pageId);
        setIsPlaying(true);
      });

      target.addEventListener('targetLost', () => {
        console.log(`MindAR: Lost target ${page.pageId}`);
        setTrackingStatus('lost');
        setIsPlaying(false);
      });
    });

    // Unlock all media elements for mobile browsers on first interaction
    const unlockAudio = () => {
      console.log('Unlocking all media elements silently...');

      const promises = allPages.map((p) => {
        const v = videoRefs.current[p.pageId];
        const a = audioRefs.current[p.pageId];
        const mediaPromises = [];

        if (v) {
          v.muted = true;
          mediaPromises.push(
            v
              .play()
              .then(() => v.pause())
              .catch(() => {})
          );
        }
        if (a) {
          a.muted = true;
          mediaPromises.push(
            a
              .play()
              .then(() => a.pause())
              .catch(() => {})
          );
        }
        return Promise.all(mediaPromises);
      });

      Promise.all(promises).then(() => {
        console.log('System: All media unlocked and pre-warmed.');
        setIsAudioUnlocked(true);
      });
    };
    document.body.addEventListener('click', unlockAudio, { once: true });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
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
          </div>
        </div>

        {/* Scene */}
        <div ref={containerRef} className="relative z-0 h-full w-full">
          {/* External Assets (Hidden but active) - Only render after scripts load */}
          {scriptsLoaded.aframe &&
            scriptsLoaded.mindar &&
            allPages.map((page) => {
              const videoUrl = page?.videos?.[locale as 'en' | 'vi'] || page?.videos?.vi;
              const audioUrl = page.audio
                ? page.audio[locale as 'en' | 'vi'] || page.audio.vi
                : null;

              return (
                <div key={page.pageId}>
                  {/* Render video if page has videos */}
                  {videoUrl && (
                    <video
                      id={`video-${page.pageId}`}
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
                      preload="auto"
                      muted
                      ref={(el) => {
                        videoRefs.current[page.pageId] = el;
                        if (el) el.setAttribute('webkit-playsinline', 'true');
                      }}
                    />
                  )}

                  {/* Render audio if page has audio */}
                  {audioUrl && (
                    <audio
                      id={`audio-${page.pageId}`}
                      src={audioUrl}
                      loop
                      crossOrigin="anonymous"
                      preload="auto"
                      style={{ display: 'none' }}
                      ref={(el) => {
                        audioRefs.current[page.pageId] = el;
                        if (el) {
                          console.log(`Audio element created for page ${page.pageId}:`, audioUrl);
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}

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

              {allPages.map((page) => (
                <a-entity
                  key={page.pageId}
                  id={`target-${page.pageId}`}
                  mindar-image-target={`targetIndex: ${page.targetIndex}`}
                >
                  {page.model ? (
                    <a-gltf-model
                      src={page.model}
                      scale="0.5 0.5 0.5"
                      position="0 0 0"
                      rotation="90 0 0"
                      animation-mixer
                    ></a-gltf-model>
                  ) : page.customImage ? (
                    <a-image
                      src={page.customImage}
                      width="1"
                      height="0.75"
                      position="0 0.8 0.1"
                      rotation="0 0 0"
                      material="transparent: true; alphaTest: 0.5;"
                    ></a-image>
                  ) : page.videos ? (
                    <a-video
                      src={`#video-${page.pageId}`}
                      width="0.9"
                      height="0.5"
                      position="0 0.6 0.1"
                      rotation="0 0 0"
                      material="side: double; transparent: true; opacity: 1;"
                    ></a-video>
                  ) : null}
                </a-entity>
              ))}
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
            <Tooltip
              title={isMuted ? (locale === 'vi' ? 'Bật tiếng tại đây' : 'Tap to unmute') : ''}
              open={isMuted && isPlaying}
              placement="topRight"
              color="#108ee9"
            >
              <Button
                shape="circle"
                size="large"
                onClick={toggleMute}
                className="flex h-12 w-12 items-center justify-center border-none bg-white/80 text-xl shadow-lg backdrop-blur"
              >
                {isMuted ? '🔇' : '🔊'}
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Status Bar - Moved to Top */}
        <div className="pointer-events-none absolute left-0 right-0 top-20 z-40 flex justify-center">
          <div className="rounded-full bg-black/40 px-4 py-2 backdrop-blur-sm">
            <p className="mb-0 mt-0 text-center text-sm text-white drop-shadow-lg">
              {trackingStatus === 'found'
                ? t('ar.trackingFound')
                : trackingStatus === 'lost'
                  ? t('ar.trackingLost')
                  : t('ar.tracking')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
