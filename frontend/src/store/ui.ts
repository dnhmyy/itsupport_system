import { create } from 'zustand';

export type DateFilter = 'today' | '7days' | '30days' | 'all';

interface UIState {
  searchQuery: string;
  dateFilter: DateFilter;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: DateFilter) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  dateFilter: 'all',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDateFilter: (filter) => set({ dateFilter: filter }),
}));
