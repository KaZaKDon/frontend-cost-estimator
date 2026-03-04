
export function roundMoney(value, step = 100) {
    const n = Number.isFinite(value) ? value : 0;
    return Math.round(n / step) * step;
}

export function formatRub(value) {
    const n = Number.isFinite(value) ? Math.round(value) : 0;

    const formatted = new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0,
    })
        .format(n)
        .replace(/\u00A0|\u202F/g, " "); // убираем неразрывные пробелы

    return `${formatted} ₽`;
}