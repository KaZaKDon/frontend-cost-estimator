export const PRICING_PROFILES = {
    junior: {
        simple: 1000,
        medium: 3000,
        hard: 6000,
        pro: 10000,
    },
    middle: {
        simple: 3000,
        medium: 8000,
        hard: 15000,
        pro: 30000,
    },
    senior: {
        simple: 8000,
        medium: 16000,
        hard: 32000,
        pro: 60000,
    },
};

// helper
export function buildPresetLineItems(type) {
    const preset = PROJECT_PRESETS[type];
    if (!preset) return [];

    return preset.items.map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        complexity: item.complexity,
        qty: item.qty ?? 1,
        notes: "",
    }));
}

export const DEFAULT_PRICING = {
    // ВАЖНО: tiers здесь — дефолт “middle”, но реальным источником станет профиль
    profile: "middle",
    tiers: { ...PRICING_PROFILES.middle },

    coefficients: {
        tabletMarkupPct: 25,
        mobileMarkupPct: 40,
        pixelPerfectPct: 10,
        riskPct: 15,
        urgencyPct: 0, // 0|30|70
    },
    fixedAddons: {
        formsValidation: 4000,
        apiIntegration: 8000,
        advancedAnimations: 6000,
        seoSemantic: 2000,
        performance: 4000,
    },
    percentAddons: {
        accessibilityPct: 10,
        crossBrowserPct: 10,
    },
};

export const DEFAULT_TIME_NORMS = {
    tiersDays: {
        simple: 0.7,
        medium: 1.5,
        hard: 3.0,
        pro: 5.0,
    },
    responsiveTimePct: {
        tablet: 15,
        mobile: 25,
    },
    addonsDays: {
        apiIntegration: 1.5,
        advancedAnimations: 1.0,
        formsValidation: 0.7,
        seoSemantic: 0.3,
        performance: 0.7,
    },
};

export const DEFAULT_OPTIONS = {
    responsive: {
        desktop: true,
        tablet: true,
        mobile: true,
    },
    quality: {
        pixelPerfect: false,
        accessibility: false,
        seoSemantic: false,
        crossBrowser: false,
        performance: false,
    },
    interactive: {
        formsValidation: false,
        apiIntegration: false,
        advancedAnimations: false,
    },
    risk: {
        includeRisk: true,
    },
    urgency: {
        mode: "normal",
    }, // normal|urgent|veryUrgent
};

export function createEmptyDraft() {
    const pricing = structuredClone(DEFAULT_PRICING);

    const profile = pricing.profile || "middle";
    pricing.profile = profile;
    pricing.tiers = { ...(PRICING_PROFILES[profile] || PRICING_PROFILES.middle) };

    // ✅ ВАЖНО: объявляем здесь
    const defaultType = "landing";

    return {
        projectMeta: {
            id: "draft",
            title: "Новый проект",
            type: defaultType,
            currency: "RUB",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        pricing,
        timeNorms: structuredClone(DEFAULT_TIME_NORMS),
        options: structuredClone(DEFAULT_OPTIONS),

        // ✅ если используешь пресеты
        lineItems: [],

        ui: {
            optionsOpen: {
                responsive: true,
                quality: false,
                interactive: false,
                risk: false,
            },
        },
    };
}

export function createDefaultState() {
    return {
        draft: createEmptyDraft(),
        history: { projects: [] },
    };
}