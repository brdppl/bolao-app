'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MatchCard } from '@/components/matches/MatchCard';
import { BetModal } from '@/components/bets/BetModal';
import { RankingTable } from '@/components/ranking/RankingTable';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useBetsStore } from '@/store/bets';
import { Trophy, Target, Star, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { bets, fetchMyBets, getBetForMatch, fetchParticipants, getParticipants } = useBetsStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/matches/upcoming').then((r) => setMatches(r.data)),
      api.get('/rankings').then((r) => setRanking(r.data)),
      fetchMyBets(),
      fetchParticipants(),
    ]).finally(() => setLoading(false));
  }, []);

  const userRank = ranking.findIndex((p) => p._id === user?._id) + 1;

  const stats = [
    { label: 'Pontos', value: user?.totalPoints ?? 0, icon: Star, color: 'text-[#f5c518]' },
    { label: 'Posição', value: userRank > 0 ? `#${userRank}` : '-', icon: Trophy, color: 'text-[#00a651]' },
    { label: 'Exatos', value: user?.exactScores ?? 0, icon: Zap, color: 'text-[#00c960]' },
    { label: 'Palpites', value: user?.totalBets ?? 0, icon: Target, color: 'text-[#7a9b7a]' },
  ];

  return (
    <AppShell>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#d4edda]">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#7a9b7a] text-sm mt-1">Copa do Mundo 2026 · EUA, Canadá & México</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#111c11] border border-[#1e2e1e] rounded-xl p-4 flex flex-col gap-2"
          >
            <Icon size={18} className={color} />
            <p className="text-2xl font-bold text-[#d4edda]">{value}</p>
            <p className="text-xs text-[#7a9b7a]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming matches */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-[#d4edda] mb-4">Próximos jogos</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#111c11] border border-[#1e2e1e] rounded-xl h-36 animate-pulse" />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-[#4a6040]">Nenhum jogo em breve</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
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
          )}
        </div>

        {/* Ranking sidebar */}
        <div>
          <h2 className="text-lg font-bold text-[#d4edda] mb-4">Ranking</h2>
          <RankingTable players={ranking.slice(0, 8)} currentUserId={user?._id} />
        </div>
      </div>

      {selectedMatch && (
        <BetModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </AppShell>
  );
}
