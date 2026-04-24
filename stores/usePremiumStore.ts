import { create } from "zustand";

interface PremiumStore {
  isPremium: boolean;
  isLoading: boolean;
  priceString: string | null;

  setIsPremium: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setPriceString: (value: string | null) => void;
}

const usePremiumStore = create<PremiumStore>((set) => ({
  isPremium: __DEV__, // remove — forces premium ON in dev builds only
  isLoading: true,
  priceString: null,

  setIsPremium: (value) => set({ isPremium: value }),
  setLoading: (value) => set({ isLoading: value }),
  setPriceString: (value) => set({ priceString: value }),
}));

// Selectors
const useIsPremium = () => usePremiumStore((s) => s.isPremium);
const useIsPremiumLoading = () => usePremiumStore((s) => s.isLoading);

const usePriceString = () => usePremiumStore((s) => s.priceString);

export { useIsPremium, useIsPremiumLoading, usePremiumStore, usePriceString };
