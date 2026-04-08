import { formatRub } from "@/shared/core/money.js";
import { formatDays } from "@/shared/core/days.js";

const PROFILE_LABELS = {
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
};

const URGENCY_LABELS = {
    normal: "стандартный",
    urgent: "срочный",
    veryUrgent: "очень срочный",
};

const COMPLEXITY_LABELS = {
    simple: "простая",
    medium: "средняя",
    hard: "сложная",
    pro: "pro",
};

export function buildQuoteText(draft, totals) {
    const title = draft?.projectMeta?.title || "Проект";
    const screens = Array.isArray(draft?.lineItems) ? draft.lineItems : [];
    const profile = draft?.pricing?.profile || "middle";
    const urgencyMode = draft?.options?.urgency?.mode || "normal";
    const riskEnabled = Boolean(draft?.options?.risk?.includeRisk);

    const responsive = getResponsiveText(draft?.options?.responsive);
    const extras = getEnabledExtras(draft?.options);
    const screensText = buildScreensText(screens);

    const lines = [
        "Здравствуйте!",
        "",
        `Подготовил предварительную оценку по проекту «${title}».`,
        "",
        `Формат работ: разработка под ключ`,
        `Стоимость: ${formatRub(totals?.totalCost || 0)}`,
        `Срок реализации: ${formatDays(totals?.totalDays || 0)}`,
        `Уровень разработки: ${PROFILE_LABELS[profile] || profile}`,
        `Адаптивность: ${responsive}`,
        `Режим реализации: ${URGENCY_LABELS[urgencyMode] || "стандартный"}`,
        riskEnabled && totals?.range
            ? `Рабочий диапазон бюджета: ${formatRub(totals.range.min)} – ${formatRub(totals.range.max)}`
            : null,
        "",
        "Что входит в стоимость:",
        "— проектирование и сборка экранов проекта",
        "— адаптивная верстка под выбранные устройства",
        "— подключение базового и дополнительного функционала по составу проекта",
        "— тестирование и финальная подготовка к передаче",
        extras.length ? `— дополнительные опции: ${extras.join(", ")}` : null,
        "",
        "Состав проекта:",
        screensText || "— список экранов пока не заполнен",
        "",
        `Итог: ${title} под ключ — ${formatRub(totals?.totalCost || 0)}`,
        "",
        "Если потребуется, следующим сообщением могу подготовить расширенный вариант с этапами работ и разбивкой по стоимости.",
    ];

    return lines.filter(Boolean).join("\n");
}

function getResponsiveText(responsive) {
    const parts = ["Desktop"];
    if (responsive?.tablet) parts.push("Tablet");
    if (responsive?.mobile) parts.push("Mobile");
    return parts.join(" / ");
}

function getEnabledExtras(options = {}) {
    const out = [];

    if (options?.quality?.pixelPerfect) out.push("pixel perfect");
    if (options?.quality?.accessibility) out.push("доступность");
    if (options?.quality?.seoSemantic) out.push("SEO / semantic");
    if (options?.quality?.crossBrowser) out.push("cross-browser");
    if (options?.quality?.performance) out.push("performance");
    if (options?.interactive?.formsValidation) out.push("валидация форм");
    if (options?.interactive?.apiIntegration) out.push("API integration");
    if (options?.interactive?.advancedAnimations) out.push("advanced animations");

    return out;
}

function buildScreensText(screens) {
    return screens
        .map((item) => {
            const qty = Number(item?.qty || 1);
            const title = item?.title || "Экран";
            const complexity = COMPLEXITY_LABELS[item?.complexity] || item?.complexity || "средняя";

            if (qty > 1) {
                return `— ${title} × ${qty} (${complexity})`;
            }

            return `— ${title} (${complexity})`;
        })
        .join("\n");
}