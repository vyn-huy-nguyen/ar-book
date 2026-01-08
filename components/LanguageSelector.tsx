'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
    router.refresh();
  };

  return (
    <Space>
      <Button
        type={locale === 'vi' ? 'primary' : 'default'}
        icon={<GlobalOutlined />}
        onClick={() => handleLanguageChange('vi')}
        size="small"
      >
        🇻🇳 VI
      </Button>
      <Button
        type={locale === 'en' ? 'primary' : 'default'}
        icon={<GlobalOutlined />}
        onClick={() => handleLanguageChange('en')}
        size="small"
      >
        🇬🇧 EN
      </Button>
    </Space>
  );
}

