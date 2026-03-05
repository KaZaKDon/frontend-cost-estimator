import {
    createEmptyDraft,
    PRICING_PROFILES
} from "@/shared/core/defaults.js";

const ALLOWED_COMPLEXITIES = new Set(["simple", "medium", "hard", "pro"]);

function asBool(v, fallback = false) {
    if (typeof v === "boolean") return v;
    return fallback;
}

function asNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function asStr(v, fallback = "") {
    return typeof v === "string" ? v : fallback;
}

export function importDraft(raw, {
    importPricing = true
} = {}) {
    const base = createEmptyDraft();

    // raw может быть draft или state с draft внутри
    const src = raw?.draft ? raw.draft : raw;

    if (!src || typeof src !== "object") return base;

    // meta
    base.projectMeta.title = asStr(src?.projectMeta?.title, base.projectMeta.title);
    base.projectMeta.type = asStr(src?.projectMeta?.type, base.projectMeta.type);
    base.projectMeta.currency = asStr(src?.projectMeta?.currency, base.projectMeta.currency);
    base.projectMeta.updatedAt = Date.now();

    // options (точечно, чтобы не словить мусор)
    base.options.responsive.desktop = asBool(src?.options?.responsive?.desktop, base.options.responsive.desktop);
    base.options.responsive.tablet = asBool(src?.options?.responsive?.tablet, base.options.responsive.tablet);
    base.options.responsive.mobile = asBool(src?.options?.responsive?.mobile, base.options.responsive.mobile);

    base.options.quality.pixelPerfect = asBool(src?.options?.quality?.pixelPerfect, false);
    base.options.quality.accessibility = asBool(src?.options?.quality?.accessibility, false);
    base.options.quality.seoSemantic = asBool(src?.options?.quality?.seoSemantic, false);
    base.options.quality.crossBrowser = asBool(src?.options?.quality?.crossBrowser, false);
    base.options.quality.performance = asBool(src?.options?.quality?.performance, false);

    base.options.interactive.formsValidation = asBool(src?.options?.interactive?.formsValidation, false);
    base.options.interactive.apiIntegration = asBool(src?.options?.interactive?.apiIntegration, false);
    base.options.interactive.advancedAnimations = asBool(src?.options?.interactive?.advancedAnimations, false);

    base.options.risk.includeRisk = asBool(src?.options?.risk?.includeRisk, true);

    const mode = asStr(src?.options?.urgency?.mode, "normal");
    base.options.urgency.mode = ["normal", "urgent", "veryUrgent"].includes(mode) ? mode : "normal";

    // line items
    const items = Array.isArray(src?.lineItems) ? src.lineItems : [];
    base.lineItems = items
        .map((x) => ({
            id: crypto.randomUUID(),
            title: asStr(x?.title, "Экран"),
            complexity: ALLOWED_COMPLEXITIES.has(x?.complexity) ? x.complexity : "medium",
            qty: clampInt(asNum(x?.qty, 1), 1, 999),
            notes: asStr(x?.notes, ""),
        }))
        .filter((x) => x.title.trim().length > 0);

    // pricing (опционально!)
    if (importPricing) {
        const profile = asStr(src?.pricing?.profile, "middle");
        base.pricing.profile = PRICING_PROFILES[profile] ? profile : "middle";

        // tiers — либо из профиля, либо из файла (если там валидные числа)
        const tiersIn = src?.pricing?.tiers;
        const fallbackTiers = PRICING_PROFILES[base.pricing.profile];

        base.pricing.tiers = {
            simple: clampMoney(asNum(tiersIn?.simple, fallbackTiers.simple)),
            medium: clampMoney(asNum(tiersIn?.medium, fallbackTiers.medium)),
            hard: clampMoney(asNum(tiersIn?.hard, fallbackTiers.hard)),
            pro: clampMoney(asNum(tiersIn?.pro, fallbackTiers.pro)),
        };

        // coefficients / addons — берём только числа, остальное по дефолту
        base.pricing.coefficients.tabletMarkupPct = clampPct(asNum(src?.pricing?.coefficients?.tabletMarkupPct, base.pricing.coefficients.tabletMarkupPct));
        base.pricing.coefficients.mobileMarkupPct = clampPct(asNum(src?.pricing?.coefficients?.mobileMarkupPct, base.pricing.coefficients.mobileMarkupPct));
        base.pricing.coefficients.pixelPerfectPct = clampPct(asNum(src?.pricing?.coefficients?.pixelPerfectPct, base.pricing.coefficients.pixelPerfectPct));
        base.pricing.coefficients.riskPct = clampPct(asNum(src?.pricing?.coefficients?.riskPct, base.pricing.coefficients.riskPct));
        base.pricing.coefficients.urgencyPct = clampPct(asNum(src?.pricing?.coefficients?.urgencyPct, base.pricing.coefficients.urgencyPct));

        // fixedAddons
        for (const k of Object.keys(base.pricing.fixedAddons)) {
            base.pricing.fixedAddons[k] = clampMoney(asNum(src?.pricing?.fixedAddons?. [k], base.pricing.fixedAddons[k]));
        }
        // percentAddons
        for (const k of Object.keys(base.pricing.percentAddons)) {
            base.pricing.percentAddons[k] = clampPct(asNum(src?.pricing?.percentAddons?. [k], base.pricing.percentAddons[k]));
        }
    }

    return base;
}

function clampInt(n, min, max) {
    n = Math.trunc(n);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
}

function clampPct(n) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(300, Math.round(n)));
}

function clampMoney(n) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.round(n));
}