export function buildEstimateText(draft, totals) {
    const title = draft?.projectMeta?.title?.trim() || "Без названия";
    const profile = (draft?.pricing?.profile || "middle").toUpperCase();

    const lineItems = (draft?.lineItems || [])
        .map((li, idx) => {
            const name = li?.name || `Экран ${idx + 1}`;
            const qty = li?.qty ?? 1;
            return `- ${name}${qty > 1 ? ` ×${qty}` : ""}`;
        })
        .join("\n");

    // totals — у тебя уже готовые итоги; подстрой поля под твой селектор
    // Я оставлю нейтрально: total, days и breakdown если есть.
    const total = totals?.total ?? totals?.grandTotal ?? totals?.sum ?? null;
    const days = totals?.days ?? totals?.totalDays ?? null;

    const money =
        typeof total === "number" ?
        `${Math.round(total).toLocaleString("ru-RU")} ₽` :
        "—";

    const daysStr =
        typeof days === "number" ? `~${Math.round(days)} дней` : "—";

    // Опции (если в draft есть)
    const opt = draft?.options || draft?.quality || {};
    const optionsLines = Object.entries(opt)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => `- ${k}`)
        .join("\n");

    return [
            `Смета (ориентировочная)`,
            `Проект: ${title}`,
            `Профиль: ${profile}`,
            ``,
            `Экраны:`,
            lineItems || "- (нет экранов)",
            ``,
            optionsLines ? `Опции:\n${optionsLines}\n` : "",
            `Итого: ${money}`,
            `Срок: ${daysStr}`,
            ``,
            `Примечание: итоговая стоимость уточняется после обсуждения задач, дизайна и сроков.`,
        ]
        .filter(Boolean)
        .join("\n");
}