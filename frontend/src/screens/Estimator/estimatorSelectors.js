import { calcTotals } from "@/shared/core/calc.js";

export const selectDraft = (state) => state.draft;
export const selectTotals = (state) => calcTotals(state.draft);