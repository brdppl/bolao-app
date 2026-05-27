'use client';
import { create } from 'zustand';
import { api } from '@/lib/api';

interface Bet {
  _id: string;
  match: any;
  homeScore: number;
  awayScore: number;
  points: number;
  processed: boolean;
  resultType: string | null;
}

interface Participant {
  _id: string;
  name: string;
}

interface BetsState {
  bets: Bet[];
  participants: Record<string, Participant[]>;
  loading: boolean;
  fetchMyBets: () => Promise<void>;
  fetchParticipants: () => Promise<void>;
  placeBet: (matchId: string, homeScore: number, awayScore: number) => Promise<void>;
  getBetForMatch: (matchId: string) => Bet | undefined;
  getParticipants: (matchId: string) => Participant[];
}

export const useBetsStore = create<BetsState>((set, get) => ({
  bets: [],
  participants: {},
  loading: false,
  fetchMyBets: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/bets/my');
      set({ bets: data });
    } finally {
      set({ loading: false });
    }
  },
  fetchParticipants: async () => {
    const { data } = await api.get('/bets/participants');
    set({ participants: data });
  },
  placeBet: async (matchId, homeScore, awayScore) => {
    const { data } = await api.post(`/bets/match/${matchId}`, { homeScore, awayScore });
    const bets = get().bets.filter((b) => b.match._id !== matchId && b.match !== matchId);
    set({ bets: [...bets, data] });
    // atualiza participantes localmente se for palpite novo
    const { participants } = get();
    const current = participants[matchId] ?? [];
    // será recarregado na próxima fetchParticipants
    set({ participants: { ...participants, [matchId]: current } });
  },
  getBetForMatch: (matchId) =>
    get().bets.find((b) => (b.match._id ?? b.match) === matchId),
  getParticipants: (matchId) => get().participants[matchId] ?? [],
}));
