'use client';
import { cn } from '@/lib/utils';
import { Trophy, Medal } from 'lucide-react';

interface Player {
  _id: string;
  name: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  totalBets: number;
}

interface RankingTableProps {
  players: Player[];
  currentUserId?: string;
}

export function RankingTable({ players, currentUserId }: RankingTableProps) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-2">
      {players.map((player, index) => {
        const isMe = player._id === currentUserId;
        const position = index + 1;

        return (
          <div
            key={player._id}
            className={cn(
              'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all',
              isMe
                ? 'bg-[#162016] border-[#00a651]/40 shadow-[0_0_12px_rgba(0,166,81,0.1)]'
                : position <= 3
                ? 'bg-[#111c11] border-[#1e2e1e] hover:border-[#2a3e2a]'
                : 'bg-[#0d1a0d] border-[#1e2e1e] hover:border-[#2a3e2a]',
            )}
          >
            {/* Position */}
            <div className="w-8 text-center">
              {position <= 3 ? (
                <span className="text-xl">{medals[position - 1]}</span>
              ) : (
                <span className="text-sm font-bold text-[#4a6040]">{position}</span>
              )}
            </div>

            {/* Avatar */}
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                isMe ? 'bg-[#00a651] text-white' : 'bg-[#162016] text-[#7a9b7a]',
              )}
            >
              {player.name[0]?.toUpperCase()}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold truncate', isMe ? 'text-[#00c960]' : 'text-[#d4edda]')}>
                {player.name} {isMe && <span className="text-[10px] text-[#4a6040] font-normal">(você)</span>}
              </p>
              <p className="text-xs text-[#4a6040]">
                {player.totalBets} palpites · {player.exactScores} exatos · {player.correctWinners} vencedores
              </p>
            </div>

            {/* Points */}
            <div className="text-right shrink-0">
              <p className={cn('text-lg font-bold', position === 1 ? 'text-[#f5c518]' : 'text-[#d4edda]')}>
                {player.totalPoints}
                <span className="text-xs font-normal text-[#4a6040] ml-1">pts</span>
              </p>
            </div>
          </div>
        );
      })}

      {players.length === 0 && (
        <div className="text-center py-12 text-[#4a6040]">
          <Trophy size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum participante ainda</p>
        </div>
      )}
    </div>
  );
}
