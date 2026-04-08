export function buildCommercialSummary({ totalCost, totalDays, draft }) {
    const title = draft?.projectMeta?.title || "Проект";

    const price = formatPrice(totalCost);
    const days = Math.ceil(totalDays || 0);

    return {
        title,
        price,
        days,
        text: `
Итог: ${title} под ключ — ${price}

Срок реализации: ${days} рабочих дней

В стоимость входит:
— Разработка всех экранов
— Адаптив под мобильные устройства
— Базовая оптимизация
— Тестирование

Дополнительно учтено:
${buildOptionsText(draft)}

Итоговая стоимость: ${price}
        `.trim(),
    };
}

function formatPrice(value) {
    if (!value) return "0 ₽";
    return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function buildOptionsText(draft) {
    const opts = draft?.options || {};
    const list = [];

    if (opts?.interactive?.apiIntegration) list.push("— Интеграция API");
    if (opts?.interactive?.advancedAnimations) list.push("— Анимации");
    if (opts?.quality?.seoSemantic) list.push("— SEO оптимизация");
    if (opts?.quality?.performance) list.push("— Оптимизация производительности");
    if (opts?.quality?.accessibility) list.push("— Доступность");

    if (!list.length) return "— Базовая комплектация";

    return list.join("\n");
}