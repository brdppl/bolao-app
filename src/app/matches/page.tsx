'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MatchCard } from '@/components/matches/MatchCard';
import { BetModal } from '@/components/bets/BetModal';
import { api } from '@/lib/api';
import { useBetsStore } from '@/store/bets';
import { useAuthStore } from '@/store/auth';
import { getPhaseName } from '@/lib/utils';

const PHASES = [
  { key: 'all', label: 'Todos' },
  { key: 'group', label: 'Grupos' },
  { key: 'round_of_32', label: 'R32' },
  { key: 'round_of_16', label: 'Oitavas' },
  { key: 'quarter_final', label: 'Quartas' },
  { key: 'semi_final', label: 'Semifinal' },
  { key: 'final', label: 'Final' },
];

export default function MatchesPage() {
  const { fetchMyBets, getBetForMatch, fetchParticipants, getParticipants } = useBetsStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [phase, setPhase] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    Promise.all([
      api.get('/matches').then((r) => setMatches(r.data)),
      fetchMyBets(),
      fetchParticipants(),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = phase === 'all' ? matches : matches.filter((m) => m.phase === phase);

  const grouped = filtered.reduce<Record<string, any[]>>((acc, m) => {
    const key = m.group ?? getPhaseName(m.phase);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const GROUP_ORDER = [
    'Grupo A','Grupo B','Grupo C','Grupo D','Grupo E','Grupo F',
    'Grupo G','Grupo H','Grupo I','Grupo J','Grupo K','Grupo L',
    'Rodada de 32','Oitavas de Final','Quartas de Final','Semifinal','3º Lugar','Final',
  ];
  const sortGroupKey = (a: string, b: string) => {
    const ia = GROUP_ORDER.indexOf(a);
    const ib = GROUP_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  };
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => sortGroupKey(a, b));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#d4edda] mb-1">Jogos</h1>
        <p className="text-[#7a9b7a] text-sm">Copa do Mundo 2026</p>
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PHASES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPhase(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              phase === key
                ? 'bg-[#00a651] text-white'
                : 'bg-[#111c11] border border-[#1e2e1e] text-[#7a9b7a] hover:text-[#d4edda] hover:border-[#2a3e2a]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111c11] border border-[#1e2e1e] rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map(([group, groupMatches]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-[#7a9b7a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#1e2e1e]" />
                {group}
                <span className="h-px flex-1 bg-[#1e2e1e]" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groupMatches.map((match) => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    bet={getBetForMatch(match._id)}
                    participants={getParticipants(match._id)}
                    currentUserId={user?._id}
                    onBet={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-16 text-[#4a6040]">
              <p>Nenhum jogo encontrado</p>
            </div>
          )}
        </div>
      )}

      {selectedMatch && (
        <BetModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </AppShell>
  );
}
