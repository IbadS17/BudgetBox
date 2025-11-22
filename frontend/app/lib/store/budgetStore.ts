import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import localforage from "localforage";

export interface Budget {
  income: number;
  bills: number;
  food: number;
  transport: number;
  subs: number;
  misc: number;

  updatedAt: number;
  syncedAt?: number;

  syncStatus: "local-only" | "sync-pending" | "synced";
}

interface BudgetState {
  budget: Budget;

  updateField: (field: keyof Budget, value: number) => void;
  markSynced: (timestamp: number) => void;
  setSyncPending: () => void;
}

export const useBudgetStore = create(
  persist<BudgetState>(
    (set, get) => ({
      budget: {
        income: 0,
        bills: 0,
        food: 0,
        transport: 0,
        subs: 0,
        misc: 0,
        updatedAt: Date.now(),
        syncStatus: "local-only",
      },

      updateField: (field, value) =>
        set((state) => ({
          budget: {
            ...state.budget,
            [field]: value,
            updatedAt: Date.now(),
            syncStatus: navigator.onLine ? "sync-pending" : "local-only",
          },
        })),

      markSynced: (timestamp) =>
        set((state) => ({
          budget: {
            ...state.budget,
            syncedAt: timestamp,
            syncStatus: "synced",
          },
        })),

      setSyncPending: () =>
        set((state) => ({
          budget: {
            ...state.budget,
            syncStatus: "sync-pending",
          },
        })),
    }),

    {
      name: "budget-storage",
      storage: createJSONStorage(() => localforage),
    }
  )
);
