import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { locales } from '@/i18n';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const antdLocale = locale === 'vi' ? viVN : enUS;

  return (
    <NextIntlClientProvider messages={messages}>
      <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>
    </NextIntlClientProvider>
  );
}
