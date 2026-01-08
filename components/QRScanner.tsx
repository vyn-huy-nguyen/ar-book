'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Alert, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import jsQR from 'jsqr';
import { getPageConfig, type PageConfig } from '@/config/pages';

interface QRScannerProps {
  onScanSuccess: (pageConfig: PageConfig) => void;
  onBack: () => void;
}

export default function QRScanner({ onScanSuccess, onBack }: QRScannerProps) {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('errors.cameraNotAvailable'));
        return;
      }

      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (!isSecureContext) {
        setError(t('errors.httpsRequired'));
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        scan();
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      
      // Handle different error types
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t('errors.cameraPermission'));
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(t('errors.cameraNotAvailable'));
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError(t('errors.cameraInUse'));
      } else {
        setError(t('errors.cameraPermission'));
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scan = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCode(code.data);
      }
    }

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  const handleQRCode = (data: string) => {
    try {
      let pageConfig: PageConfig | null = null;

      try {
        const qrData = JSON.parse(data);
        if (qrData.pageId) {
          pageConfig = getPageConfig(qrData.pageId);
        }
      } catch {
        // If not JSON, try as page ID number
        const pageId = parseInt(data, 10);
        if (!isNaN(pageId)) {
          pageConfig = getPageConfig(pageId);
        }
      }

      if (pageConfig) {
        stopScanning();
        onScanSuccess(pageConfig);
      } else {
        console.warn('QR code data not recognized:', data);
        setError(t('qr.notFound'));
      }
    } catch (err) {
      console.error('Error processing QR code:', err);
      setError(t('qr.error'));
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              stopScanning();
              onBack();
            }}
            className="text-white"
          >
            {t('navigation.back')}
          </Button>
          <h2 className="text-white text-lg font-semibold flex-1">
            {t('qr.scanning')}
          </h2>
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-4 border-primary-500 rounded-xl shadow-lg relative">
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
        </div>
        <p className="mt-8 text-white text-center px-4 text-sm drop-shadow-lg">
          {t('qr.instructions')}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-4"
            />
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p className="font-semibold">{t('errors.howToFix')}:</p>
              {error === t('errors.httpsRequired') ? (
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('errors.fixStepIPhone1')}</li>
                  <li>{t('errors.fixStepIPhone2')}</li>
                  <li>{t('errors.fixStepIPhone3')}</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('errors.fixStep1')}</li>
                  <li>{t('errors.fixStep2')}</li>
                  <li>{t('errors.fixStep3')}</li>
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={() => {
                  setError(null);
                  startScanning();
                }}
                className="flex-1"
              >
                {t('errors.tryAgain')}
              </Button>
              <Button onClick={onBack} className="flex-1">
                {t('navigation.back')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {!isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}

