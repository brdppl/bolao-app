'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Navbar } from './Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrate, isLoggedIn } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoggedIn()) router.push('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-[#0d1a0d]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-12">{children}</main>
    </div>
  );
}
