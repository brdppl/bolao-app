'use client';
import Image from 'next/image';
import { formatMatchDate, timeUntilMatch, getResultBadge, cn } from '@/lib/utils';
import { Clock, Lock } from 'lucide-react';

interface Participant {
  _id: string;
  name: string;
}

interface MatchCardProps {
  match: {
    _id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamFlag?: string;
    awayTeamFlag?: string;
    kickoff: string;
    status: string;
    phase: string;
    group?: string;
    homeScore: number | null;
    awayScore: number | null;
  };
  bet?: {
    homeScore: number;
    awayScore: number;
    points: number;
    processed: boolean;
    resultType: string | null;
  };
  participants?: Participant[];
  currentUserId?: string;
  onBet?: () => void;
}

const AVATAR_COLORS = [
  'bg-[#006b34]', 'bg-[#0057b8]', 'bg-[#7b3f00]', 'bg-[#5c0099]',
  'bg-[#006666]', 'bg-[#8b0000]', 'bg-[#4a6040]', 'bg-[#003f7f]',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function MatchCard({ match, bet, participants = [], currentUserId, onBet }: MatchCardProps) {
  const isLocked = match.status !== 'scheduled' || new Date() >= new Date(match.kickoff);
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const resultBadge = bet?.resultType ? getResultBadge(bet.resultType) : null;

  const MAX_VISIBLE = 5;
  const visible = participants.slice(0, MAX_VISIBLE);
  const overflow = participants.length - MAX_VISIBLE;

  return (
    <div className={cn(
      'bg-[#111c11] border rounded-xl p-4 transition-all',
      isLive ? 'border-[#00a651] shadow-[0_0_15px_rgba(0,166,81,0.15)]' : 'border-[#1e2e1e] hover:border-[#2a3e2a]',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#7a9b7a] font-medium">
          {match.group ?? match.phase}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#00a651] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a651]" />
              AO VIVO
            </span>
          )}
          {isLocked && !isLive && !isFinished && (
            <span className="flex items-center gap-1 text-xs text-[#4a6040]">
              <Lock size={11} />
              Encerrado
            </span>
          )}
          {!isLocked && (
            <span className="flex items-center gap-1 text-xs text-[#7a9b7a]">
              <Clock size={11} />
              {timeUntilMatch(match.kickoff)}
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {match.homeTeamFlag ? (
            <Image src={match.homeTeamFlag} alt={match.homeTeam} width={40} height={40} className="rounded" />
          ) : (
            <div className="w-10 h-10 rounded bg-[#162016] flex items-center justify-center text-lg">🏳️</div>
          )}
          <span className="text-sm font-semibold text-[#d4edda] text-center leading-tight">
            {match.homeTeam}
          </span>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#d4edda]">{match.homeScore ?? '-'}</span>
              <span className="text-[#4a6040]">×</span>
              <span className="text-2xl font-bold text-[#d4edda]">{match.awayScore ?? '-'}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-[#4a6040]">VS</span>
          )}
          <span className="text-[10px] text-[#4a6040] text-center">{formatMatchDate(match.kickoff)}</span>
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {match.awayTeamFlag ? (
            <Image src={match.awayTeamFlag} alt={match.awayTeam} width={40} height={40} className="rounded" />
          ) : (
            <div className="w-10 h-10 rounded bg-[#162016] flex items-center justify-center text-lg">🏳️</div>
          )}
          <span className="text-sm font-semibold text-[#d4edda] text-center leading-tight">
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Participants */}
      {participants.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {visible.map((p) => (
              <div
                key={p._id}
                title={p.name}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#111c11]',
                  p._id === currentUserId ? 'bg-[#00a651] border-[#00a651]/50' : avatarColor(p.name),
                )}
              >
                {p.name[0].toUpperCase()}
              </div>
            ))}
            {overflow > 0 && (
              <div className="w-6 h-6 rounded-full bg-[#1e2e1e] flex items-center justify-center text-[9px] font-bold text-[#7a9b7a] border-2 border-[#111c11]">
                +{overflow}
              </div>
            )}
          </div>
          <span className="text-[10px] text-[#4a6040]">
            {participants.length === 1 ? '1 palpite' : `${participants.length} palpites`}
          </span>
        </div>
      )}

      {/* Bet section */}
      <div className="mt-3 pt-3 border-t border-[#1e2e1e]">
        {bet ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7a9b7a]">Seu palpite:</span>
              <span className="text-sm font-bold text-[#d4edda]">
                {bet.homeScore} × {bet.awayScore}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {resultBadge && (
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', resultBadge.color)}>
                  {resultBadge.label}
                </span>
              )}
              {bet.processed && (
                <span className="text-sm font-bold text-[#f5c518]">+{bet.points}pts</span>
              )}
              {!isLocked && onBet && (
                <button
                  onClick={onBet}
                  className="text-xs text-[#7a9b7a] hover:text-[#00c960] transition-colors ml-1"
                >
                  Alterar
                </button>
              )}
            </div>
          </div>
        ) : !isLocked && onBet ? (
          <button
            onClick={onBet}
            className="w-full py-2 text-sm font-semibold text-[#00a651] border border-[#006b34] rounded-lg hover:bg-[#162016] hover:border-[#00a651] transition-all"
          >
            Dar palpite ⚽
          </button>
        ) : (
          <span className="text-xs text-[#4a6040] italic">Sem palpite</span>
        )}
      </div>
    </div>
  );
}
