import { create } from "zustand";
import type { Filters } from "@/types";

interface FiltersState extends Filters {
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
}

const initial: Filters = {
  categories: [],
  subCategories: [],
  priceRange: [0, 5000],
  inStockOnly: false,
  sort: "newest",
};

export const useFilters = create<FiltersState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<FiltersState>),
  reset: () => set(initial),
}));
