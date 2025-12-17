import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnimePulse',
  description: 'Real-time Anime Schedule',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AnimePulse',
  },
};

export const viewport = {
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
