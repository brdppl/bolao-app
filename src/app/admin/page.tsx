'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, AlertTriangle, Pencil, X, Minus, Plus,
  Users, Trophy, Calendar, CheckCircle2, Activity,
  ShieldCheck, ShieldOff, UserX, UserCheck,
} from 'lucide-react';
import { formatMatchDate } from '@/lib/utils';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFlag?: string;
  awayTeamFlag?: string;
  homeScore: number | null;
  awayScore: number | null;
  kickoff: string;
  status: string;
  group?: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  active: boolean;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  totalBets: number;
  createdAt?: string;
}

interface Stats {
  totalUsers: number;
  totalBets: number;
  total: number;
  finished: number;
  live: number;
  scheduled: number;
  processed: number;
}

// ─── ScoreEditor ──────────────────────────────────────────────────────────────

interface ScoreEditorProps {
  match: Match;
  onSave: (matchId: string, home: number, away: number, finished: boolean) => Promise<void>;
  onCancel: () => void;
}

function ScoreEditor({ match, onSave, onCancel }: ScoreEditorProps) {
  const [home, setHome] = useState(match.homeScore ?? 0);
  const [away, setAway] = useState(match.awayScore ?? 0);
  const [finished, setFinished] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try { await onSave(match._id, home, away, finished); }
    finally { setLoading(false); }
  };

  return (
    <div className="mt-2 p-3 bg-[#162016] rounded-lg border border-[#00a651]/30 space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[#7a9b7a] truncate max-w-[80px] text-center">{match.homeTeam}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setHome(Math.max(0, home - 1))} className="w-6 h-6 rounded bg-[#1e2e1e] text-[#d4edda] flex items-center justify-center hover:bg-[#2a3e2a]"><Minus size={12} /></button>
            <span className="w-8 h-8 rounded-lg bg-[#0d1a0d] border border-[#00a651]/40 flex items-center justify-center text-lg font-bold text-[#d4edda]">{home}</span>
            <button onClick={() => setHome(home + 1)} className="w-6 h-6 rounded bg-[#1e2e1e] text-[#d4edda] flex items-center justify-center hover:bg-[#2a3e2a]"><Plus size={12} /></button>
          </div>
        </div>
        <span className="text-[#4a6040] font-bold">×</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-[#7a9b7a] truncate max-w-[80px] text-center">{match.awayTeam}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setAway(Math.max(0, away - 1))} className="w-6 h-6 rounded bg-[#1e2e1e] text-[#d4edda] flex items-center justify-center hover:bg-[#2a3e2a]"><Minus size={12} /></button>
            <span className="w-8 h-8 rounded-lg bg-[#0d1a0d] border border-[#00a651]/40 flex items-center justify-center text-lg font-bold text-[#d4edda]">{away}</span>
            <button onClick={() => setAway(away + 1)} className="w-6 h-6 rounded bg-[#1e2e1e] text-[#d4edda] flex items-center justify-center hover:bg-[#2a3e2a]"><Plus size={12} /></button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id={`fin-${match._id}`} checked={finished} onChange={e => setFinished(e.target.checked)} className="accent-[#00a651]" />
        <label htmlFor={`fin-${match._id}`} className="text-xs text-[#7a9b7a] cursor-pointer">Jogo encerrado (processa palpites automaticamente)</label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" className="flex-1" loading={loading} onClick={handleSave}>Salvar placar</Button>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#00a651' }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-[#0d1a0d] border border-[#1e2e1e] rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#7a9b7a]">{label}</p>
        <p className="text-xl font-bold text-[#d4edda] leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-[#4a6040] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'matches' | 'users';

export default function AdminPage() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [unprocessed, setUnprocessed] = useState<Match[]>([]);

  const [syncing, setSyncing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState<'upcoming' | 'all'>('upcoming');
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    fetchAll();
  }, []);

  const fetchAll = () => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/matches').then(r => setMatches(r.data)).catch(() => {});
    api.get('/admin/unprocessed-matches').then(r => setUnprocessed(r.data)).catch(() => {});
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post('/admin/sync-fixtures');
      toast(`Sincronizado! ${data.synced ?? 0} jogos, ${data.finished ?? 0} encerrados processados.`, 'success');
      fetchAll();
    } catch {
      toast('Erro ao sincronizar (verifique a chave da API)', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleProcess = async (matchId: string) => {
    setProcessing(matchId);
    try {
      await api.post(`/admin/process-results/${matchId}`);
      toast('Palpites processados!', 'success');
      setUnprocessed(prev => prev.filter(m => m._id !== matchId));
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    } catch {
      toast('Erro ao processar', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveScore = async (matchId: string, home: number, away: number, finished: boolean) => {
    try {
      const { data } = await api.patch(`/admin/matches/${matchId}/score`, { homeScore: home, awayScore: away, finished });
      toast(finished ? 'Placar salvo e palpites processados!' : 'Placar ao vivo atualizado!', 'success');
      setMatches(prev => prev.map(m => m._id === matchId ? { ...m, ...data } : m));
      setEditingMatch(null);
      api.get('/admin/unprocessed-matches').then(r => setUnprocessed(r.data)).catch(() => {});
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    } catch {
      toast('Erro ao salvar placar', 'error');
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    setTogglingUser(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/active`, { active: !user.active });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, active: !u.active } : u));
      toast(`Usuário ${user.active ? 'desativado' : 'ativado'}!`, 'success');
    } catch {
      toast('Erro ao alterar usuário', 'error');
    } finally {
      setTogglingUser(null);
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setTogglingUser(user._id + '-role');
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      toast(`Papel alterado para ${newRole}!`, 'success');
    } catch {
      toast('Erro ao alterar papel', 'error');
    } finally {
      setTogglingUser(null);
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register`);
    toast('Link de convite copiado!', 'success');
  };

  const GROUP_ORDER = [
    'Grupo A','Grupo B','Grupo C','Grupo D','Grupo E','Grupo F',
    'Grupo G','Grupo H','Grupo I','Grupo J','Grupo K','Grupo L',
    'Rodada de 32','Oitavas de Final','Quartas de Final','Semifinal','3º Lugar','Final',
  ];
  const groupRank = (g?: string) => {
    if (!g) return 999;
    const i = GROUP_ORDER.indexOf(g);
    return i === -1 ? 998 : i;
  };

  const now = new Date();
  const visibleMatches = matches
    .filter(m => matchFilter === 'all' ? true : new Date(m.kickoff) >= new Date(now.getTime() - 24 * 60 * 60 * 1000))
    .sort((a, b) => {
      const gDiff = groupRank(a.group) - groupRank(b.group);
      if (gDiff !== 0) return gDiff;
      return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
    });

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'matches',  label: 'Jogos' },
    { id: 'users',    label: `Usuários${users.length ? ` (${users.length})` : ''}` },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f5c518]">Painel Admin</h1>
        <p className="text-[#7a9b7a] text-sm mt-1">Copa do Mundo 2026 · Bolão</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#0d1a0d] p-1 rounded-xl border border-[#1e2e1e] w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-[#00a651] text-white' : 'text-[#7a9b7a] hover:text-[#d4edda]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Users size={18} />} label="Participantes" value={stats?.totalUsers ?? '—'} color="#00a651" />
            <StatCard icon={<Trophy size={18} />} label="Palpites totais" value={stats?.totalBets ?? '—'} color="#f5c518" />
            <StatCard icon={<Calendar size={18} />} label="Jogos encerrados" value={stats?.finished ?? '—'} sub={`de ${stats?.total ?? '—'} no total`} color="#3b82f6" />
            <StatCard icon={<CheckCircle2 size={18} />} label="Resultados processados" value={stats?.processed ?? '—'} sub={stats && stats.finished > 0 ? `${Math.round((stats.processed / stats.finished) * 100)}% dos encerrados` : undefined} color="#8b5cf6" />
          </div>

          {/* Live indicator */}
          {stats && stats.live > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#00a651]/10 border border-[#00a651]/30 rounded-xl">
              <Activity size={16} className="text-[#00a651] animate-pulse" />
              <span className="text-sm text-[#00a651] font-medium">{stats.live} jogo{stats.live > 1 ? 's' : ''} ao vivo agora</span>
            </div>
          )}

          {/* Unprocessed alert */}
          {unprocessed.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#f5c518] flex items-center gap-2">
                    <AlertTriangle size={14} /> Jogos encerrados sem processar ({unprocessed.length})
                  </h2>
                  <button onClick={() => api.get('/admin/unprocessed-matches').then(r => setUnprocessed(r.data))} className="text-[#7a9b7a] hover:text-[#d4edda]">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unprocessed.map(match => (
                    <div key={match._id} className="flex items-center justify-between gap-4 p-3 bg-[#0d1a0d] rounded-lg border border-[#f5c518]/20">
                      <div>
                        <p className="text-sm font-medium text-[#d4edda]">{match.homeTeam} {match.homeScore} × {match.awayScore} {match.awayTeam}</p>
                        <p className="text-xs text-[#7a9b7a]">{formatMatchDate(match.kickoff)}</p>
                      </div>
                      <Button size="sm" loading={processing === match._id} onClick={() => handleProcess(match._id)}>Processar</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-[#d4edda]">Sincronizar via API</h2></CardHeader>
              <CardContent>
                <p className="text-xs text-[#7a9b7a] mb-1">Busca resultados via API-Football automaticamente.</p>
                <p className="text-xs text-[#4a6040] mb-4">⚡ Durante a Copa (11 jun – 19 jul) o sync roda a cada 5 min automaticamente.</p>
                <Button onClick={handleSync} loading={syncing} className="w-full"><RefreshCw size={15} />Sincronizar agora</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-[#d4edda]">Link de convite</h2></CardHeader>
              <CardContent>
                <p className="text-xs text-[#7a9b7a] mb-3">Compartilhe para seus amigos entrarem no bolão</p>
                <div className="bg-[#0d1a0d] border border-[#1e2e1e] rounded-lg px-3 py-2 text-xs text-[#7a9b7a] mb-3 font-mono truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/register` : '/register'}
                </div>
                <Button variant="secondary" onClick={handleCopyInvite} className="w-full">Copiar link</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Matches ─────────────────────────────────────────────────────────── */}
      {tab === 'matches' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#d4edda]">Atualizar placar manualmente</h2>
                <p className="text-xs text-[#4a6040] mt-0.5">Use quando a API não tiver o resultado ainda</p>
              </div>
              <div className="flex gap-1">
                {(['upcoming', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setMatchFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${matchFilter === f ? 'bg-[#00a651] text-white' : 'bg-[#162016] text-[#7a9b7a] hover:text-[#d4edda]'}`}>
                    {f === 'upcoming' ? 'Recentes' : 'Todos'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {visibleMatches.map(match => (
                <div key={match._id}>
                  <div className="flex items-center justify-between gap-3 p-3 bg-[#0d1a0d] rounded-lg border border-[#1e2e1e]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {match.homeTeamFlag && <Image src={match.homeTeamFlag} alt="" width={20} height={20} className="rounded shrink-0" />}
                        <span className="text-sm text-[#d4edda] truncate">{match.homeTeam}</span>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${match.homeScore !== null ? 'text-[#d4edda]' : 'text-[#4a6040]'}`}>
                        {match.homeScore !== null ? `${match.homeScore} × ${match.awayScore}` : 'vs'}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-[#d4edda] truncate">{match.awayTeam}</span>
                        {match.awayTeamFlag && <Image src={match.awayTeamFlag} alt="" width={20} height={20} className="rounded shrink-0" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        match.status === 'finished' ? 'bg-[#162016] text-[#4a6040]' :
                        match.status === 'live'     ? 'bg-[#00a651]/20 text-[#00a651]' :
                                                      'bg-[#162016] text-[#7a9b7a]'}`}>
                        {match.status === 'finished' ? 'FIM' : match.status === 'live' ? '🔴 AO VIVO' : formatMatchDate(match.kickoff)}
                      </span>
                      <button onClick={() => setEditingMatch(editingMatch === match._id ? null : match._id)}
                        className="p-1.5 rounded-lg bg-[#162016] text-[#7a9b7a] hover:text-[#f5c518] hover:bg-[#1e2e1e] transition-colors">
                        {editingMatch === match._id ? <X size={14} /> : <Pencil size={14} />}
                      </button>
                    </div>
                  </div>
                  {editingMatch === match._id && (
                    <ScoreEditor match={match} onSave={handleSaveScore} onCancel={() => setEditingMatch(null)} />
                  )}
                </div>
              ))}
              {visibleMatches.length === 0 && (
                <p className="text-sm text-[#4a6040] text-center py-6">Nenhum jogo encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Users ───────────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#d4edda]">Gerenciar participantes</h2>
              <button onClick={() => api.get('/admin/users').then(r => setUsers(r.data))} className="text-[#7a9b7a] hover:text-[#d4edda]">
                <RefreshCw size={14} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-[#4a6040] text-center py-6">Nenhum usuário encontrado</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {users.map(user => (
                  <div key={user._id} className={`p-3 bg-[#0d1a0d] rounded-lg border transition-colors ${user.active ? 'border-[#1e2e1e]' : 'border-[#f59e0b]/20 opacity-60'}`}>
                    <div className="flex items-center justify-between gap-3">
                      {/* Avatar + info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#162016] border border-[#1e2e1e] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-[#00a651]">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-[#d4edda] truncate">{user.name}</span>
                            {user.role === 'admin' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f5c518]/20 text-[#f5c518] font-medium shrink-0">admin</span>
                            )}
                            {!user.active && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] font-medium shrink-0">inativo</span>
                            )}
                          </div>
                          <span className="text-xs text-[#7a9b7a] truncate block">{user.email}</span>
                        </div>
                      </div>

                      {/* Stats mini */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <p className="text-xs font-bold text-[#f5c518]">{user.totalPoints}</p>
                          <p className="text-[10px] text-[#4a6040]">pts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-[#d4edda]">{user.totalBets}</p>
                          <p className="text-[10px] text-[#4a6040]">palpites</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-[#00a651]">{user.exactScores}</p>
                          <p className="text-[10px] text-[#4a6040]">exatos</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title={user.role === 'admin' ? 'Rebaixar para usuário' : 'Promover a admin'}
                          disabled={togglingUser === user._id + '-role'}
                          onClick={() => handleToggleRole(user)}
                          className="p-1.5 rounded-lg bg-[#162016] text-[#7a9b7a] hover:text-[#f5c518] hover:bg-[#1e2e1e] transition-colors disabled:opacity-50">
                          {user.role === 'admin' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        <button
                          title={user.active ? 'Desativar usuário' : 'Ativar usuário'}
                          disabled={togglingUser === user._id}
                          onClick={() => handleToggleActive(user)}
                          className="p-1.5 rounded-lg bg-[#162016] text-[#7a9b7a] hover:text-[#f59e0b] hover:bg-[#1e2e1e] transition-colors disabled:opacity-50">
                          {user.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile stats */}
                    <div className="flex sm:hidden items-center gap-4 mt-2 pt-2 border-t border-[#1e2e1e]">
                      <span className="text-xs text-[#7a9b7a]"><span className="font-bold text-[#f5c518]">{user.totalPoints}</span> pts</span>
                      <span className="text-xs text-[#7a9b7a]"><span className="font-bold text-[#d4edda]">{user.totalBets}</span> palpites</span>
                      <span className="text-xs text-[#7a9b7a]"><span className="font-bold text-[#00a651]">{user.exactScores}</span> exatos</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
