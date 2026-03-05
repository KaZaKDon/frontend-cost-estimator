export function roundDays(value) {
    const n = Number.isFinite(value) ? value : 0;
    return Math.round(n * 2) / 2; // to 0.5 day
}

export function formatDays(value) {
    const d = roundDays(value);
    // простое склонение не нужно — достаточно “дней”
    return `~${d} дней`;
}