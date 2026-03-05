import {
    formatRub
} from "./money.js";
import {
    formatDays
} from "./days.js";
import {
    getComplexityLabel
} from "./calc.js";

export function buildQuoteText(draft, totals) {
    const lines = [];

    lines.push(`Проект: ${draft.projectMeta?.title || "Без названия"}`);
    lines.push("");

    lines.push("Экраны:");
    if (!draft.lineItems?.length) {
        lines.push("— (не добавлены)");
    } else {
        for (const it of draft.lineItems) {
            const qty = Number(it.qty) || 1;
            lines.push(`— ${it.title || "Экран"} (${getComplexityLabel(it.complexity)}) ×${qty}`);
        }
    }

    const enabled = collectEnabledOptions(draft);
    if (enabled.length) {
        lines.push("");
        lines.push("Дополнительно:");
        for (const x of enabled) lines.push(`— ${x}`);
    }

    lines.push("");
    lines.push(`Итого: ${formatRub(totals.totalCost)}`);
    lines.push(`Срок: ${formatDays(totals.totalDays)}`);

    if (totals.range) {
        lines.push(`Диапазон: ${formatRub(totals.range.min)} – ${formatRub(totals.range.max)}`);
    }

    return lines.join("\n");
}

function collectEnabledOptions(draft) {
    const o = draft.options || {};
    const out = [];

    if (o.responsive?.tablet) out.push("Адаптив: Tablet");
    if (o.responsive?.mobile) out.push("Адаптив: Mobile");

    if (o.quality?.pixelPerfect) out.push("Pixel Perfect");
    if (o.quality?.accessibility) out.push("Доступность (a11y)");
    if (o.quality?.seoSemantic) out.push("Семантика/SEO");
    if (o.quality?.crossBrowser) out.push("Кроссбраузерность");
    if (o.quality?.performance) out.push("Оптимизация скорости");

    if (o.interactive?.formsValidation) out.push("Формы/валидация");
    if (o.interactive?.apiIntegration) out.push("Интеграция API");
    if (o.interactive?.advancedAnimations) out.push("Продвинутые анимации");

    const mode = o.urgency?.mode;
    if (mode === "urgent") out.push("Срочно (+30%)");
    if (mode === "veryUrgent") out.push("Очень срочно (+70%)");

    if (o.risk?.includeRisk) out.push("Диапазон с риском");

    return out;
}