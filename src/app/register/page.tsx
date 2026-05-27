'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.token);
      toast('Bem-vindo ao Bolão Copa 2026!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Erro ao cadastrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0d1a0d]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00a651]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#00a651] flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,166,81,0.4)]">
            ⚽
          </div>
          <h1 className="text-2xl font-bold text-[#d4edda]">Criar conta</h1>
          <p className="text-sm text-[#7a9b7a] mt-1">Você precisa de um código de convite</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111c11] border border-[#1e2e1e] rounded-2xl p-6 space-y-4"
        >
          {[
            { label: 'Nome', key: 'name', type: 'text', placeholder: 'Seu nome completo' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'seu@email.com' },
            { label: 'Senha', key: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Código de convite', key: 'inviteCode', type: 'text', placeholder: 'COPA2026' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#7a9b7a] mb-1.5">{label}</label>
              <input
                type={type}
                required
                value={form[key as keyof typeof form]}
                onChange={update(key as keyof typeof form)}
                placeholder={placeholder}
                className="w-full bg-[#0d1a0d] border border-[#1e2e1e] rounded-lg px-3 py-2.5 text-sm text-[#d4edda] placeholder-[#4a6040] focus:outline-none focus:border-[#00a651] transition-colors"
              />
            </div>
          ))}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Criar conta
          </Button>
        </form>

        <p className="text-center text-sm text-[#7a9b7a] mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#00a651] hover:text-[#00c960] font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
