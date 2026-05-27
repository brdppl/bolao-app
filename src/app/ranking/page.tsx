'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RankingTable } from '@/components/ranking/RankingTable';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { RefreshCw } from 'lucide-react';

type RankingTab = 'paid' | 'all';

export default function RankingPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<RankingTab>('paid');
  const [rankingPaid, setRankingPaid] = useState<any[]>([]);
  const [rankingAll, setRankingAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = () => {
    setLoading(true);
    Promise.all([
      api.get('/rankings/paid').then(r => setRankingPaid(r.data)),
      api.get('/rankings').then(r => setRankingAll(r.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRankings(); }, []);

  const current = tab === 'paid' ? rankingPaid : rankingAll;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#d4edda]">Ranking</h1>
          <p className="text-[#7a9b7a] text-sm mt-1">
            {current.length} participante{current.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchRankings}
          className="p-2 rounded-lg text-[#7a9b7a] hover:text-[#d4edda] hover:bg-[#162016] transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#0d1a0d] p-1 rounded-xl border border-[#1e2e1e] w-fit">
        <button
          onClick={() => setTab('paid')}
          className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'paid' ? 'bg-[#00a651] text-white' : 'text-[#7a9b7a] hover:text-[#d4edda]'
          }`}
        >
          💰 Pagantes
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'all' ? 'bg-[#00a651] text-white' : 'text-[#7a9b7a] hover:text-[#d4edda]'
          }`}
        >
          🌍 Geral
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#111c11] border border-[#1e2e1e] rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <RankingTable players={current} currentUserId={user?._id} />
      )}
    </AppShell>
  );
}
