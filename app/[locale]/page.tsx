'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Space, Typography } from 'antd';
import { ScanOutlined, GlobalOutlined } from '@ant-design/icons';
import LanguageSelector from '@/components/LanguageSelector';
import QRScanner from '@/components/QRScanner';
import ARViewer from '@/components/ARViewer';
import type { PageConfig } from '@/config/pages';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const t = useTranslations();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'scanner' | 'ar'>('home');
  const [currentPageConfig, setCurrentPageConfig] = useState<PageConfig | null>(null);

  const handleStartScanning = () => {
    setCurrentScreen('scanner');
  };

  const handleQRScanSuccess = (pageConfig: PageConfig) => {
    setCurrentPageConfig(pageConfig);
    setCurrentScreen('ar');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setCurrentPageConfig(null);
  };

  const handleScanNew = () => {
    setCurrentScreen('scanner');
    setCurrentPageConfig(null);
  };

  if (currentScreen === 'scanner') {
    return (
      <QRScanner
        onScanSuccess={handleQRScanSuccess}
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'ar' && currentPageConfig) {
    return (
      <ARViewer
        pageConfig={currentPageConfig}
        onBack={handleBack}
        onScanNew={handleScanNew}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <Space direction="vertical" size="large" className="w-full text-center">
          <div>
            <Title level={1} className="!mb-2 !text-primary-600">
              {t('app.title')}
            </Title>
            <Paragraph className="text-gray-600">{t('app.subtitle')}</Paragraph>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<ScanOutlined />}
            onClick={handleStartScanning}
            className="w-full h-12 text-lg"
          >
            {t('qr.scanning')}
          </Button>

          <Card className="bg-gray-50">
            <Space direction="vertical" size="small">
              <GlobalOutlined className="text-2xl text-primary-500" />
              <Paragraph className="!mb-0 text-sm text-gray-600">
                {t('qr.instructions')}
              </Paragraph>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
}

