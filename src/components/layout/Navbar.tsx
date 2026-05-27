'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Trophy, Calendar, Target, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/matches', label: 'Jogos', icon: Calendar },
  { href: '/bets', label: 'Meus Palpites', icon: Target },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e2e1e] bg-[#0d1a0d]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#00a651] flex items-center justify-center text-white font-bold text-sm group-hover:bg-[#00c960] transition-colors">
            ⚽
          </div>
          <span className="font-bold text-[#d4edda] hidden sm:block">
            Bolão <span className="text-[#f5c518]">Copa 2026</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-[#162016] text-[#00c960]'
                  : 'text-[#7a9b7a] hover:text-[#d4edda] hover:bg-[#162016]',
              )}
            >
              <Icon size={15} />
              <span className="hidden md:block">{label}</span>
            </Link>
          ))}
          {isAdmin() && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/admin'
                  ? 'bg-[#162016] text-[#f5c518]'
                  : 'text-[#7a9b7a] hover:text-[#f5c518] hover:bg-[#162016]',
              )}
            >
              <Shield size={15} />
              <span className="hidden md:block">Admin</span>
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#7a9b7a] hidden sm:block">
            {user?.name?.split(' ')[0]}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#006b34] flex items-center justify-center text-[#d4edda] text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-[#7a9b7a] hover:text-red-400 hover:bg-[#162016] transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
