import {
    roundMoney
} from "./money.js";
import {
    roundDays
} from "./days.js";

const COMPLEXITY_LABEL = {
    simple: "Простая",
    medium: "Средняя",
    hard: "Сложная",
    pro: "Pro",
};

export function getComplexityLabel(key) {
    return COMPLEXITY_LABEL[key] ?? key;
}

function urgencyModeToPct(mode) {
    if (mode === "urgent") return 30;
    if (mode === "veryUrgent") return 70;
    return 0;
}

export function calcScreensBase(lineItems, tiers) {
    let cost = 0;
    let days = 0;

    for (const it of lineItems) {
        const qty = clampInt(it.qty, 1, 999);
        const tierPrice = Number(tiers[it.complexity] ?? 0);
        cost += qty * tierPrice;
    }

    return {
        cost,
        days
    }; // days computed separately in calcTime
}

export function calcTimeBase(lineItems, tiersDays) {
    let days = 0;
    for (const it of lineItems) {
        const qty = clampInt(it.qty, 1, 999);
        const per = Number(tiersDays[it.complexity] ?? 0);
        days += qty * per;
    }
    return days;
}

/**
 * Returns { totalCost, totalDays, breakdown: [{key,label,value}], range?: {min,max} }
 */
export function calcTotals(draft) {
    const {
        lineItems,
        pricing,
        timeNorms,
        options
    } = draft;

    const baseScreens = calcScreensBase(lineItems, pricing.tiers);
    const baseCost = baseScreens.cost;

    const breakdown = [];
    breakdown.push({
        key: "base",
        label: "Экраны",
        value: baseCost
    });

    // Responsive markups (% of base)
    let responsiveCost = 0;
    if (options.responsive?.tablet) responsiveCost += (baseCost * pricing.coefficients.tabletMarkupPct) / 100;
    if (options.responsive?.mobile) responsiveCost += (baseCost * pricing.coefficients.mobileMarkupPct) / 100;
    responsiveCost = roundMoney(responsiveCost, 100);
    if (responsiveCost > 0) breakdown.push({
        key: "responsive",
        label: "Адаптив",
        value: responsiveCost
    });

    // Quality (% and fixed)
    let qualityCost = 0;
    if (options.quality?.pixelPerfect) {
        qualityCost += (baseCost * pricing.coefficients.pixelPerfectPct) / 100;
    }
    if (options.quality?.accessibility) {
        qualityCost += (baseCost * (pricing.percentAddons.accessibilityPct ?? 0)) / 100;
    }
    if (options.quality?.crossBrowser) {
        qualityCost += (baseCost * (pricing.percentAddons.crossBrowserPct ?? 0)) / 100;
    }
    if (options.quality?.seoSemantic) qualityCost += pricing.fixedAddons.seoSemantic ?? 0;
    if (options.quality?.performance) qualityCost += pricing.fixedAddons.performance ?? 0;

    qualityCost = roundMoney(qualityCost, 100);
    if (qualityCost > 0) breakdown.push({
        key: "quality",
        label: "Качество",
        value: qualityCost
    });

    // Interactive fixed addons
    let interactiveCost = 0;
    if (options.interactive?.formsValidation) interactiveCost += pricing.fixedAddons.formsValidation ?? 0;
    if (options.interactive?.apiIntegration) interactiveCost += pricing.fixedAddons.apiIntegration ?? 0;
    if (options.interactive?.advancedAnimations) interactiveCost += pricing.fixedAddons.advancedAnimations ?? 0;
    interactiveCost = roundMoney(interactiveCost, 100);
    if (interactiveCost > 0) breakdown.push({
        key: "interactive",
        label: "Интерактив",
        value: interactiveCost
    });

    // Urgency (% of subtotal)
    const urgencyPct = urgencyModeToPct(options.urgency?.mode) || pricing.coefficients.urgencyPct || 0;
    const subtotalBeforeUrgency = sumBreakdown(breakdown);
    let urgencyCost = roundMoney((subtotalBeforeUrgency * urgencyPct) / 100, 100);
    if (urgencyCost > 0) breakdown.push({
        key: "urgency",
        label: "Срочность",
        value: urgencyCost
    });

    const totalCost = roundMoney(sumBreakdown(breakdown), 100);

    // Time
    let baseDays = calcTimeBase(lineItems, timeNorms.tiersDays);
    baseDays = roundDays(baseDays);

    // Time markups
    let timePct = 0;
    if (options.responsive?.tablet) timePct += timeNorms.responsiveTimePct.tablet ?? 0;
    if (options.responsive?.mobile) timePct += timeNorms.responsiveTimePct.mobile ?? 0;

    // Addon days
    let addonDays = 0;
    if (options.interactive?.apiIntegration) addonDays += timeNorms.addonsDays.apiIntegration ?? 0;
    if (options.interactive?.advancedAnimations) addonDays += timeNorms.addonsDays.advancedAnimations ?? 0;
    if (options.interactive?.formsValidation) addonDays += timeNorms.addonsDays.formsValidation ?? 0;
    if (options.quality?.seoSemantic) addonDays += timeNorms.addonsDays.seoSemantic ?? 0;
    if (options.quality?.performance) addonDays += timeNorms.addonsDays.performance ?? 0;

    let totalDays = baseDays + addonDays;
    totalDays += (baseDays * timePct) / 100;
    totalDays = roundDays(totalDays);

    // Range by risk
    let range = null;
    if (options.risk?.includeRisk) {
        const riskPct = Number(pricing.coefficients.riskPct ?? 0);
        const max = roundMoney(totalCost * (1 + riskPct / 100), 100);
        range = {
            min: totalCost,
            max
        };
    }

    return {
        totalCost,
        totalDays,
        breakdown,
        baseDays,
        range
    };
}

function sumBreakdown(breakdown) {
    return breakdown.reduce((acc, x) => acc + (Number.isFinite(x.value) ? x.value : 0), 0);
}

function clampInt(v, min, max) {
    const n = Math.trunc(Number(v));
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
}