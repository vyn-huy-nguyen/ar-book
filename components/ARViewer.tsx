import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Button, Spin } from 'antd';
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
  const [isMuted, setIsMuted] = useState(false); // Default to unmute
  const [trackingStatus, setTrackingStatus] = useState<'tracking' | 'found' | 'lost'>('tracking');
  const [scriptsLoaded, setScriptsLoaded] = useState({ aframe: false, mindar: false });

  const allPages = Object.values(pagesConfig);

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

  // Initialize AR events after scripts load
  useEffect(() => {
    if (scriptsLoaded.aframe && scriptsLoaded.mindar && containerRef.current) {
      setupEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptsLoaded.aframe, scriptsLoaded.mindar]);

  const activePageIdRef = useRef<number | null>(null);
  const isMutedRef = useRef(isMuted);

  // Removed useEffect for activePageIdRef to avoid state update lag
  // We will update ref manually in targetFound for immediate availability

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const setupEvents = () => {
    allPages.forEach((page) => {
      const target = document.querySelector(`#target-${page.pageId}`);
      if (!target) return;

      target.addEventListener('targetFound', () => {
        console.log(`MindAR: Found target ${page.pageId}`);
        const previousPageId = activePageIdRef.current; // Use ref to get previous state
        const currentMuted = isMutedRef.current; // Use ref to get fresh mute state

        // IMMEDIATE UPDATE: Update ref immediately to prevent race conditions with targetLost
        activePageIdRef.current = page.pageId;

        setTrackingStatus('found');
        setActivePageId(page.pageId);

        // IMPORTANT: Pause and reset all other media first
        allPages.forEach((otherPage) => {
          if (otherPage.pageId !== page.pageId) {
            // Pause other videos and reset to beginning
            const otherVid = videoRefs.current[otherPage.pageId];
            if (otherVid && !otherVid.paused) {
              otherVid.pause();
              otherVid.currentTime = 0;
            }
            // Pause other audio and reset to beginning
            const otherAudio = audioRefs.current[otherPage.pageId];
            if (otherAudio && !otherAudio.paused) {
              otherAudio.pause();
              otherAudio.currentTime = 0;
            }
          }
        });

        // Now play the current marker's media
        // Priority: video > audio
        const vid = videoRefs.current[page.pageId];
        const audio = audioRefs.current[page.pageId];

        // Logic check:
        // 1. First time scan (previousPageId === null) -> Reset to beginning
        // 2. Switch marker (previousPageId !== page.pageId) -> Reset to beginning
        // 3. Same marker re-scan (previousPageId === page.pageId) -> Continue (do nothing)

        const isSwitchingMarker = previousPageId !== null && previousPageId !== page.pageId;
        const isFirstScan = previousPageId === null;
        const shouldResetToBeginning = isSwitchingMarker || isFirstScan;

        if (vid) {
          if (shouldResetToBeginning) {
            vid.currentTime = 0;
          }
          vid.muted = currentMuted;
          vid
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((e) => {
              console.log('Autoplay blocked, falling back to muted:', e);
              // Fallback: Mute and try again
              vid.muted = true;
              vid
                .play()
                .then(() => {
                  setIsMuted(true); // Update UI to show muted
                  setIsPlaying(true);
                })
                .catch((e2) => console.log('Muted play also failed:', e2));
            });
        } else if (audio) {
          console.log(`Trying to play audio for page ${page.pageId}:`, audio);
          if (shouldResetToBeginning) {
            audio.currentTime = 0;
          }
          audio.muted = currentMuted;
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((e) => {
              console.log('Audio autoplay blocked:', e);
              // For audio-only, silent play is useless, but we can't do much.
              // Still try creating a user gesture opportunity?
              // Just fallback to muted so it "plays" (progress moves) or just stop?
              // Better to respect standard behavior: fallback to muted so logic stays consistent
              audio.muted = true;
              audio
                .play()
                .then(() => {
                  setIsMuted(true);
                  setIsPlaying(true);
                })
                .catch((e2) => console.log('Audio muted play failed:', e2));
            });
        }
      });

      target.addEventListener('targetLost', () => {
        console.log(`MindAR: Lost target ${page.pageId}`);

        // Race condition fix:
        // If we switched to Marker B (Found B) BEFORE Marker A Lost event fires,
        // activePageIdRef.current will be B.
        // We should ONLY update global state (trackingStatus, isPlaying) if the lost marker THIS marker (A)
        const currentActiveId = activePageIdRef.current;

        if (currentActiveId === page.pageId) {
          setTrackingStatus('lost');
        }

        const vid = videoRefs.current[page.pageId];
        const audio = audioRefs.current[page.pageId];

        // Ensure media is paused regardless of active state
        if (vid && !vid.paused) {
          vid.pause();
          // Only update isPlaying if this was the active page
          if (currentActiveId === page.pageId) {
            setIsPlaying(false);
          }
        } else if (audio && !audio.paused) {
          audio.pause();
          // Only update isPlaying if this was the active page
          if (currentActiveId === page.pageId) {
            setIsPlaying(false);
          }
        }
      });
    });

    // Unlock audio on body click (iOS constraint)
    const unlockAudio = () => {
      if (!activePageId) return;
      const page = pagesConfig[activePageId];
      if (!page) return;

      if (page.model) {
        const audio = audioRefs.current[page.pageId];
        if (audio && isPlaying) audio.play();
      } else {
        const vid = videoRefs.current[page.pageId];
        if (vid && isPlaying) vid.play();
      }
    };
    document.body.addEventListener('click', unlockAudio, { once: true });
  };

  const togglePlay = () => {
    if (!activePageId) return;
    const page = pagesConfig[activePageId];
    if (!page) return;

    const vid = videoRefs.current[page.pageId];
    const audio = audioRefs.current[page.pageId];

    if (vid) {
      if (isPlaying) vid.pause();
      else vid.play();
      setIsPlaying(!isPlaying);
    } else if (audio) {
      if (isPlaying) audio.pause();
      else audio.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (!activePageId) return;
    const page = pagesConfig[activePageId];
    if (!page) return;

    const vid = videoRefs.current[page.pageId];
    const audio = audioRefs.current[page.pageId];

    if (vid) {
      vid.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (audio) {
      audio.muted = !isMuted;
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
        src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v7.0.0/dist/aframe-extras.min.js"
        strategy="afterInteractive"
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
          </div>
        </div>

        {/* Scene */}
        <div ref={containerRef} className="relative z-0 h-full w-full">
          {/* External Assets (Hidden but active) - Only render after scripts load */}
          {scriptsLoaded.aframe &&
            scriptsLoaded.mindar &&
            allPages.map((page) => {
              // CHANGE 2: Use single video for both languages (prefer 'vi', fallback to 'en')
              const rawVideoUrl = page?.videos?.[locale as 'en' | 'vi'] || page?.videos?.vi;

              const rawAudioUrl = page.audio
                ? page.audio[locale as 'en' | 'vi'] || page.audio.vi
                : null;

              // Add cache buster to prevent stale media
              const timestamp = new Date().getTime();
              const videoUrl = rawVideoUrl ? `${rawVideoUrl}?t=${timestamp}` : null;
              const audioUrl = rawAudioUrl ? `${rawAudioUrl}?t=${timestamp}` : null;

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
                  ) : page.videos ? (
                    // CHANGE 1: Only render video plane if page indeed has videos
                    // If page has only audio, this part will be skipped, showing nothing (transparent)
                    <a-video
                      src={`#video-${page.pageId}`}
                      width="1"
                      height="0.5625"
                      position="0 0 0.1"
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
