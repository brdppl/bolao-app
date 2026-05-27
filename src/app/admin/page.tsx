'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatMatchDate } from '@/lib/utils';

export default function AdminPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const [unprocessed, setUnprocessed] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    fetchUnprocessed();
    const code = process.env.NEXT_PUBLIC_INVITE_CODE;
    if (code) setInviteCode(code);
  }, []);

  const fetchUnprocessed = () => {
    api.get('/admin/unprocessed-matches')
      .then((r) => setUnprocessed(r.data))
      .catch(() => {});
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/admin/sync-fixtures');
      toast('Jogos sincronizados com sucesso!', 'success');
      fetchUnprocessed();
    } catch {
      toast('Erro ao sincronizar jogos', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleProcess = async (matchId: string) => {
    setProcessing(matchId);
    try {
      await api.post(`/admin/process-results/${matchId}`);
      toast('Resultados processados!', 'success');
      setUnprocessed((prev) => prev.filter((m) => m._id !== matchId));
    } catch {
      toast('Erro ao processar resultados', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/register`;
    navigator.clipboard.writeText(url);
    toast('Link de convite copiado!', 'success');
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f5c518]">Painel Admin</h1>
        <p className="text-[#7a9b7a] text-sm mt-1">Gerenciar o bolão</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync fixtures */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#d4edda]">Sincronizar jogos</h2>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#7a9b7a] mb-4">
              Busca os jogos e resultados da Copa 2026 via API-Football
            </p>
            <Button onClick={handleSync} loading={syncing} className="w-full">
              <RefreshCw size={15} />
              Sincronizar agora
            </Button>
          </CardContent>
        </Card>

        {/* Invite link */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#d4edda]">Link de convite</h2>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#7a9b7a] mb-3">
              Compartilhe para seus amigos entrarem no bolão
            </p>
            <div className="bg-[#0d1a0d] border border-[#1e2e1e] rounded-lg px-3 py-2 text-xs text-[#7a9b7a] mb-3 font-mono">
              {typeof window !== 'undefined' ? `${window.location.origin}/register` : '/register'}
            </div>
            <Button variant="secondary" onClick={handleCopyInvite} className="w-full">
              Copiar link
            </Button>
          </CardContent>
        </Card>

        {/* Unprocessed matches */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#d4edda]">Jogos para processar</h2>
              <button onClick={fetchUnprocessed} className="text-[#7a9b7a] hover:text-[#d4edda] transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {unprocessed.length === 0 ? (
              <div className="flex items-center gap-2 text-[#00a651] text-sm py-4">
                <CheckCircle2 size={16} />
                Todos os jogos encerrados já foram processados
              </div>
            ) : (
              <div className="space-y-2">
                {unprocessed.map((match) => (
                  <div
                    key={match._id}
                    className="flex items-center justify-between gap-4 p-3 bg-[#0d1a0d] rounded-lg border border-[#1e2e1e]"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-[#f5c518] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-[#d4edda]">
                          {match.homeTeam} {match.homeScore} × {match.awayScore} {match.awayTeam}
                        </p>
                        <p className="text-xs text-[#7a9b7a]">{formatMatchDate(match.kickoff)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      loading={processing === match._id}
                      onClick={() => handleProcess(match._id)}
                    >
                      Processar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
