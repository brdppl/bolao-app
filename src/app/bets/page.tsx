'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MatchCard } from '@/components/matches/MatchCard';
import { BetModal } from '@/components/bets/BetModal';
import { useBetsStore } from '@/store/bets';
import { useAuthStore } from '@/store/auth';
import { Target } from 'lucide-react';

export default function BetsPage() {
  const { bets, fetchMyBets, loading, fetchParticipants, getParticipants } = useBetsStore();
  const { user } = useAuthStore();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  useEffect(() => {
    fetchMyBets();
    fetchParticipants();
  }, []);

  const pending = bets.filter((b) => !b.processed);
  const done = bets.filter((b) => b.processed);

  const totalPoints = done.reduce((acc, b) => acc + b.points, 0);
  const exactCount = done.filter((b) => b.resultType === 'exact').length;
  const winnerCount = done.filter((b) => b.resultType === 'winner').length;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#d4edda] mb-1">Meus Palpites</h1>
        <p className="text-[#7a9b7a] text-sm">{bets.length} palpite{bets.length !== 1 ? 's' : ''} enviado{bets.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Summary */}
      {done.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#111c11] border border-[#1e2e1e] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#f5c518]">{totalPoints}</p>
            <p className="text-xs text-[#7a9b7a]">pontos</p>
          </div>
          <div className="bg-[#111c11] border border-[#1e2e1e] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#00c960]">{exactCount}</p>
            <p className="text-xs text-[#7a9b7a]">exatos</p>
          </div>
          <div className="bg-[#111c11] border border-[#1e2e1e] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#d4edda]">{winnerCount}</p>
            <p className="text-xs text-[#7a9b7a]">vencedores</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111c11] border border-[#1e2e1e] rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : bets.length === 0 ? (
        <div className="text-center py-20">
          <Target size={40} className="mx-auto mb-4 text-[#4a6040] opacity-50" />
          <p className="text-[#4a6040]">Você ainda não deu nenhum palpite</p>
          <p className="text-sm text-[#4a6040] mt-1">Acesse a aba Jogos para começar</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#7a9b7a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#1e2e1e]" />
                Aguardando resultado
                <span className="h-px flex-1 bg-[#1e2e1e]" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pending.map((bet) => (
                  <MatchCard
                    key={bet._id}
                    match={bet.match}
                    bet={bet}
                    participants={getParticipants(bet.match._id ?? bet.match)}
                    currentUserId={user?._id}
                    onBet={() => setSelectedMatch(bet.match)}
                  />
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#7a9b7a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#1e2e1e]" />
                Apurados
                <span className="h-px flex-1 bg-[#1e2e1e]" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {done.map((bet) => (
                  <MatchCard
                    key={bet._id}
                    match={bet.match}
                    bet={bet}
                    participants={getParticipants(bet.match._id ?? bet.match)}
                    currentUserId={user?._id}
                  />
                ))}
              </div>
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
