import { create } from 'zustand';

export type DateFilter = 'today' | '7days' | '30days' | 'all';

interface UIState {
  searchQuery: string;
  dateFilter: DateFilter;
  isMobileMenuOpen: boolean;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: DateFilter) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  dateFilter: 'all',
  isMobileMenuOpen: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));
