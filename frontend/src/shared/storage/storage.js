import {
    STORAGE_KEYS
} from "./keys.js";
import {
    createDefaultState
} from "@/shared/core/defaults.js";

export function loadAppState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.APP_STATE);
        if (!raw) return createDefaultState();
        const parsed = JSON.parse(raw);
        // минимальная страховка
        if (!parsed || typeof parsed !== "object") return createDefaultState();
        if (!parsed.draft) return createDefaultState();
        return parsed;
    } catch {
        return createDefaultState();
    }
}

export function saveAppState(state) {
    try {
        localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    } catch {
        // ignore (quota / private mode)
    }
}