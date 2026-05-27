import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchDate(date: string | Date): string {
  return format(new Date(date), "dd 'de' MMM, HH:mm", { locale: ptBR });
}

export function timeUntilMatch(date: string | Date): string {
  if (isPast(new Date(date))) return 'Iniciado';
  return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true });
}

export function getResultBadge(resultType: string | null) {
  switch (resultType) {
    case 'exact': return { label: 'Placar exato', color: 'text-[#f5c518] bg-[#f5c51820]' };
    case 'winner': return { label: 'Vencedor certo', color: 'text-[#00a651] bg-[#00a65120]' };
    case 'miss': return { label: 'Errou', color: 'text-[#7a9b7a] bg-[#1e2e1e]' };
    default: return { label: 'Pendente', color: 'text-[#4a6040] bg-[#162016]' };
  }
}

export function getPhaseName(phase: string): string {
  const names: Record<string, string> = {
    group: 'Fase de Grupos',
    round_of_32: 'Rodada de 32',
    round_of_16: 'Oitavas de Final',
    quarter_final: 'Quartas de Final',
    semi_final: 'Semifinal',
    third_place: '3º Lugar',
    final: 'Final',
  };
  return names[phase] ?? phase;
}
