'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RankingTable } from '@/components/ranking/RankingTable';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { RefreshCw } from 'lucide-react';

export default function RankingPage() {
  const { user } = useAuthStore();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = () => {
    setLoading(true);
    api.get('/rankings')
      .then((r) => setRanking(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRanking(); }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#d4edda]">Ranking Geral</h1>
          <p className="text-[#7a9b7a] text-sm mt-1">{ranking.length} participante{ranking.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchRanking}
          className="p-2 rounded-lg text-[#7a9b7a] hover:text-[#d4edda] hover:bg-[#162016] transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#111c11] border border-[#1e2e1e] rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <RankingTable players={ranking} currentUserId={user?._id} />
      )}
    </AppShell>
  );
}
