'use client';

import { useEffect, useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  useEffect(() => {
    // Check if we just switched language to avoid reopening
    const justSwitched = sessionStorage.getItem('just_switched_language');

    if (justSwitched) {
      // We just arrived from a language switch, so don't show modal
      setTimeout(() => {
        sessionStorage.removeItem('just_switched_language');
      }, 500);
      setIsOpen(false);
    } else {
      // This is a fresh reload or first visit
      setIsOpen(true);
    }
  }, []);

  const handleSelectLanguage = (newLocale: 'vi' | 'en') => {
    setIsOpen(false);

    if (newLocale === currentLocale) {
      // Just close if same language
      return;
    }

    // Set flag so next mount knows we just switched
    sessionStorage.setItem('just_switched_language', 'true');

    // Logic adapted from LanguageSelector
    let pathWithoutLocale = pathname;
    if (pathname.startsWith(`/${currentLocale}`)) {
      pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    } else if (pathname === '/') {
      pathWithoutLocale = '';
    }

    // Ensure we don't end up with //
    if (pathWithoutLocale.startsWith('/') && pathWithoutLocale.length > 1) {
      // keep as is
    } else if (pathWithoutLocale === '/') {
      pathWithoutLocale = '';
    }

    router.replace(`/${newLocale}${pathWithoutLocale}`);
    router.refresh();
  };

  return (
    <Modal
      open={isOpen}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      className="text-center"
      styles={{
        mask: { backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.6)' },
      }}
    >
      <Space direction="vertical" size="large" className="w-full py-6">
        <Space direction="vertical" className="w-full" size="middle">
          <Button
            type="primary"
            size="large"
            block
            className="h-12 text-lg font-medium"
            onClick={() => handleSelectLanguage('vi')}
          >
            🇻🇳 Tiếng Việt
          </Button>
          <Button
            size="large"
            block
            className="h-12 text-lg font-medium"
            onClick={() => handleSelectLanguage('en')}
          >
            🇬🇧 English
          </Button>
        </Space>
      </Space>
    </Modal>
  );
}
