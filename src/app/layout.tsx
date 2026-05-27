import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Bolão Copa 2026',
  description: 'Bolão da Copa do Mundo FIFA 2026',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0d1a0d] text-[#d4edda]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
