'use client';
import { useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBetsStore } from '@/store/bets';
import { useToast } from '@/components/ui/Toast';
import { formatMatchDate } from '@/lib/utils';

interface BetModalProps {
  match: any;
  onClose: () => void;
}

export function BetModal({ match, onClose }: BetModalProps) {
  const { placeBet, getBetForMatch } = useBetsStore();
  const { toast } = useToast();
  const existing = getBetForMatch(match._id);

  const [home, setHome] = useState(existing?.homeScore ?? 0);
  const [away, setAway] = useState(existing?.awayScore ?? 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await placeBet(match._id, home, away);
      toast(existing ? 'Palpite atualizado!' : 'Palpite enviado!', 'success');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Erro ao salvar palpite', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111c11] border border-[#1e2e1e] rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2e1e]">
          <h2 className="text-sm font-semibold text-[#d4edda]">Dar palpite</h2>
          <button onClick={onClose} className="text-[#4a6040] hover:text-[#d4edda] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Match info */}
        <div className="px-5 py-4">
          <p className="text-xs text-[#7a9b7a] text-center mb-4">{formatMatchDate(match.kickoff)}</p>

          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {match.homeTeamFlag ? (
                <Image src={match.homeTeamFlag} alt={match.homeTeam} width={48} height={48} className="rounded" />
              ) : (
                <div className="w-12 h-12 rounded bg-[#162016] flex items-center justify-center text-2xl">🏳️</div>
              )}
              <span className="text-sm font-bold text-[#d4edda] text-center">{match.homeTeam}</span>
            </div>

            <span className="text-[#4a6040] text-lg font-bold">×</span>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {match.awayTeamFlag ? (
                <Image src={match.awayTeamFlag} alt={match.awayTeam} width={48} height={48} className="rounded" />
              ) : (
                <div className="w-12 h-12 rounded bg-[#162016] flex items-center justify-center text-2xl">🏳️</div>
              )}
              <span className="text-sm font-bold text-[#d4edda] text-center">{match.awayTeam}</span>
            </div>
          </div>

          {/* Score inputs */}
          <div className="flex items-center justify-center gap-6">
            <ScoreInput value={home} onChange={setHome} />
            <span className="text-2xl font-bold text-[#4a6040] w-4 text-center">×</span>
            <ScoreInput value={away} onChange={setAway} />
          </div>

          {/* Points hint */}
          <p className="text-xs text-[#4a6040] text-center mt-4">
            Placar exato = 3pts · Vencedor certo = 1pt
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {existing ? 'Atualizar' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onChange(Math.min(20, value + 1))}
        className="w-9 h-9 rounded-lg bg-[#162016] hover:bg-[#1e2e1e] text-[#d4edda] flex items-center justify-center transition-colors border border-[#1e2e1e]"
      >
        <Plus size={16} />
      </button>
      <span className="w-12 h-12 rounded-xl bg-[#162016] border border-[#00a651]/30 flex items-center justify-center text-2xl font-bold text-[#d4edda]">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-lg bg-[#162016] hover:bg-[#1e2e1e] text-[#d4edda] flex items-center justify-center transition-colors border border-[#1e2e1e]"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}
