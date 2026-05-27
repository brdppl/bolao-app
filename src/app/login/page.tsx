'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, hydrate, isLoggedIn } = useAuthStore();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
    if (isLoggedIn()) router.push('/dashboard');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0d1a0d]">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00a651]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#00a651] flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,166,81,0.4)]">
            ⚽
          </div>
          <h1 className="text-2xl font-bold text-[#d4edda]">Bolão Copa 2026</h1>
          <p className="text-sm text-[#7a9b7a] mt-1">Faça login para dar seus palpites</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#111c11] border border-[#1e2e1e] rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-[#7a9b7a] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-[#0d1a0d] border border-[#1e2e1e] rounded-lg px-3 py-2.5 text-sm text-[#d4edda] placeholder-[#4a6040] focus:outline-none focus:border-[#00a651] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7a9b7a] mb-1.5">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d1a0d] border border-[#1e2e1e] rounded-lg px-3 py-2.5 text-sm text-[#d4edda] placeholder-[#4a6040] focus:outline-none focus:border-[#00a651] transition-colors"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-[#7a9b7a] mt-4">
          Tem um código de convite?{' '}
          <Link href="/register" className="text-[#00a651] hover:text-[#00c960] font-medium transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
