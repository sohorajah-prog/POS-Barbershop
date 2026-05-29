import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      activeOutlet: null,
      activeShift: null,
      transactions: [],

      login: (user, outlet) => set({ 
        user, 
        activeOutlet: outlet || null 
      }),

      logout: () => set({ 
        user: null, 
        activeOutlet: null, 
        activeShift: null 
      }),

      setActiveOutlet: (outlet) => set({ activeOutlet: outlet }),

      openShift: (shift) => set({ activeShift: shift }),

      closeShift: (endCash, expectedCash) => set((state) => ({
        activeShift: state.activeShift ? {
          ...state.activeShift,
          status: 'closed',
          endTime: new Date().toISOString(),
          endCash,
          expectedCash
        } : null
      })),

      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, transaction]
      }))
    }),
    {
      name: 'barbershop-pos-store-v2', // LocalStorage key
    }
  )
);
