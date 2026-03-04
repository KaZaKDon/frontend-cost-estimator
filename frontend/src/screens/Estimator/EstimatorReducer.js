import {
    A
} from "./estimatorActions.js";
import {
    createDefaultState,
    PRICING_PROFILES
} from "@/shared/core/defaults.js";

function now() {
    return Date.now();
}

export function estimatorReducer(state, action) {
    switch (action.type) {
        case A.HYDRATE: {
            return action.payload ?? createDefaultState();
        }

        case A.SET_PROJECT_TITLE: {
            return patchDraft(state, {
                projectMeta: {
                    ...state.draft.projectMeta,
                    title: action.title,
                    updatedAt: now()
                },
            });
        }

        // --------------------------
        // Line items
        // --------------------------
        case A.ADD_LINE_ITEM: {
            const item = {
                id: crypto.randomUUID(),
                title: "Экран",
                complexity: "medium",
                qty: 1,
                notes: "",
            };

            return patchDraft(state, {
                lineItems: [...state.draft.lineItems, item],
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        case A.UPDATE_LINE_ITEM: {
            const next = state.draft.lineItems.map((it) =>
                it.id === action.id ? {
                    ...it,
                    ...action.patch
                } : it,
            );
            return patchDraft(state, {
                lineItems: next,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        case A.DUPLICATE_LINE_ITEM: {
            const src = state.draft.lineItems.find((x) => x.id === action.id);
            if (!src) return state;

            const copy = {
                ...src,
                id: crypto.randomUUID(),
                title: `${src.title || "Экран"} (копия)`,
            };

            const idx = state.draft.lineItems.findIndex((x) => x.id === action.id);
            const next = [...state.draft.lineItems];
            next.splice(idx + 1, 0, copy);

            return patchDraft(state, {
                lineItems: next,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        case A.REMOVE_LINE_ITEM: {
            const removed = state.draft.lineItems.find((x) => x.id === action.id) || null;
            const next = state.draft.lineItems.filter((x) => x.id !== action.id);

            return {
                ...state,
                draft: {
                    ...state.draft,
                    lineItems: next,
                    projectMeta: {
                        ...state.draft.projectMeta,
                        updatedAt: now()
                    },
                    ui: {
                        ...state.draft.ui,
                        lastRemoved: removed ? {
                            item: removed,
                            at: Date.now()
                        } : null,
                    },
                },
            };
        }

        case A.MOVE_LINE_ITEM: {
            const idx = state.draft.lineItems.findIndex((x) => x.id === action.id);
            if (idx < 0) return state;

            const nextIdx = action.dir === "up" ? idx - 1 : idx + 1;
            if (nextIdx < 0 || nextIdx >= state.draft.lineItems.length) return state;

            const next = [...state.draft.lineItems];
            const [item] = next.splice(idx, 1);
            next.splice(nextIdx, 0, item);

            return patchDraft(state, {
                lineItems: next,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        // --------------------------
        // Options
        // --------------------------
        case A.TOGGLE_OPTION: {
            const path = String(action.path || "");
            const [group, key] = path.split(".");
            if (!group || !key) return state;

            const options = state.draft.options ?? {};
            const groupObj = options[group] ?? {};
            const current = Boolean(groupObj[key]);

            const nextOptions = {
                ...options,
                [group]: {
                    ...groupObj,
                    [key]: !current
                },
            };

            return patchDraft(state, {
                options: nextOptions,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        case A.SET_RESPONSIVE: {
            const options = state.draft.options ?? {};
            const responsive = options.responsive ?? {};

            const nextOptions = {
                ...options,
                responsive: {
                    ...responsive,
                    [action.device]: Boolean(action.value)
                },
            };

            return patchDraft(state, {
                options: nextOptions,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        case A.SET_URGENCY: {
            const options = state.draft.options ?? {};
            const urgency = options.urgency ?? {};

            const nextOptions = {
                ...options,
                urgency: {
                    ...urgency,
                    mode: action.mode
                },
            };

            return patchDraft(state, {
                options: nextOptions,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }

        // --------------------------
        // Templates (shop / landing)
        // --------------------------
        case A.LOAD_TEMPLATE: {
            const kind = action.kind || "shop";

            const templates = {
                shop: {
                    title: "Интернет-магазин",
                    items: [{
                        title: "Главная",
                        complexity: "hard",
                        qty: 1
                    },
                    {
                        title: "Каталог",
                        complexity: "medium",
                        qty: 1
                    },
                    {
                        title: "Карточка товара",
                        complexity: "hard",
                        qty: 1
                    },
                    {
                        title: "Корзина",
                        complexity: "medium",
                        qty: 1
                    },
                    {
                        title: "Оформление заказа",
                        complexity: "hard",
                        qty: 1
                    },
                    ],
                },
                landing: {
                    title: "Лендинг",
                    items: [{
                        title: "Hero",
                        complexity: "medium",
                        qty: 1
                    },
                    {
                        title: "О нас",
                        complexity: "simple",
                        qty: 1
                    },
                    {
                        title: "Преимущества",
                        complexity: "medium",
                        qty: 1
                    },
                    {
                        title: "Тарифы",
                        complexity: "medium",
                        qty: 1
                    },
                    {
                        title: "Контакты",
                        complexity: "simple",
                        qty: 1
                    },
                    ],
                },
            };

            const tpl = templates[kind] || templates.shop;

            const nextItems = tpl.items.map((x) => ({
                id: crypto.randomUUID(),
                title: x.title,
                complexity: x.complexity,
                qty: x.qty,
                notes: "",
            }));

            return patchDraft(state, {
                lineItems: nextItems,
                projectMeta: {
                    ...state.draft.projectMeta,
                    title: `${tpl.title} (шаблон)`,
                    updatedAt: now()
                },
            });
        }

        // --------------------------
        // Pricing profile: junior/middle/senior
        // --------------------------
        case A.SET_PROFILE: {
            const profile = action.profile;
            const tiersFromProfile = PRICING_PROFILES?.[profile];

            if (!tiersFromProfile) return state;

            // ВАЖНО: не затираем coefficients/fixedAddons/percentAddons — меняем только profile + tiers
            const nextPricing = {
                ...state.draft.pricing,
                profile,
                tiers: {
                    ...tiersFromProfile
                },
            };

            return patchDraft(state, {
                pricing: nextPricing,
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }
        case A.BULK_ADD: {
            const raw = String(action.text || "");
            const titles = raw
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);

            if (!titles.length) return state;

            const items = titles.map((title) => ({
                id: crypto.randomUUID(),
                title,
                complexity: "medium",
                qty: 1,
                notes: "",
            }));

            return patchDraft(state, {
                lineItems: [...state.draft.lineItems, ...items],
                projectMeta: {
                    ...state.draft.projectMeta,
                    updatedAt: now()
                },
            });
        }
        case A.UNDO_REMOVE: {
            const lr = state.draft.ui?.lastRemoved;
            if (!lr) return state;

            // Восстановление после очистки
            if (lr.kind === "clear" && Array.isArray(lr.items)) {
                return {
                    ...state,
                    draft: {
                        ...state.draft,
                        lineItems: lr.items.map((x) => ({
                            ...x,
                            id: crypto.randomUUID()
                        })),
                        projectMeta: {
                            ...state.draft.projectMeta,
                            updatedAt: now()
                        },
                        ui: {
                            ...state.draft.ui,
                            lastRemoved: null
                        },
                    },
                };
            }

            // Восстановление после удаления одного экрана (старый сценарий)
            const item = lr.item;
            if (!item) return state;

            const next = [...state.draft.lineItems, {
                ...item,
                id: crypto.randomUUID()
            }];

            return {
                ...state,
                draft: {
                    ...state.draft,
                    lineItems: next,
                    projectMeta: {
                        ...state.draft.projectMeta,
                        updatedAt: now()
                    },
                    ui: {
                        ...state.draft.ui,
                        lastRemoved: null
                    },
                },
            };
        }

        case A.CLEAR_LINE_ITEMS: {
            const removed = state.draft.lineItems;
            if (!removed.length) return state;

            return {
                ...state,
                draft: {
                    ...state.draft,
                    lineItems: [],
                    projectMeta: {
                        ...state.draft.projectMeta,
                        updatedAt: now()
                    },
                    ui: {
                        ...state.draft.ui,
                        lastRemoved: {
                            items: removed,
                            at: Date.now(),
                            kind: "clear"
                        },
                    },
                },
            };
        }
        case A.SAVE_TO_HISTORY: {
            const draft = state.draft;

            const project = structuredClone(draft);

            project.projectMeta = {
                ...project.projectMeta,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            // 📌 Сохраняем snapshot расчёта
            project.snapshot = {
                totalCost: action.totals?.totalCost ?? 0,
                totalDays: action.totals?.totalDays ?? 0,
            };

            const projects = [project, ...(state.history?.projects ?? [])];

            return {
                ...state,
                history: {
                    ...state.history,
                    projects
                },
            };
        }

        case A.OPEN_HISTORY: {
            const p = (state.history?.projects ?? []).find((x) => x.projectMeta?.id === action.id);
            if (!p) return state;

            const draft = structuredClone(p);
            // открываем как черновик, но сохраняем мету
            draft.projectMeta = {
                ...draft.projectMeta,
                updatedAt: Date.now()
            };

            return {
                ...state,
                draft
            };
        }

        case A.DUPLICATE_HISTORY: {
            const p = (state.history?.projects ?? []).find((x) => x.projectMeta?.id === action.id);
            if (!p) return state;

            const copy = structuredClone(p);
            copy.projectMeta = {
                ...copy.projectMeta,
                id: crypto.randomUUID(),
                title: `${copy.projectMeta?.title || "Проект"} (копия)`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const projects = [copy, ...(state.history?.projects ?? [])];

            return {
                ...state,
                history: {
                    ...state.history,
                    projects
                }
            };
        }

        case A.DELETE_HISTORY: {
            const projects = (state.history?.projects ?? []).filter((x) => x.projectMeta?.id !== action.id);
            return {
                ...state,
                history: {
                    ...state.history,
                    projects
                }
            };
        }
        case A.IMPORT_DRAFT: {
            return { ...state, draft: action.draft };
        }

        default:
            return state;
    }
}

function patchDraft(state, draftPatch) {
    return {
        ...state,
        draft: {
            ...state.draft,
            ...draftPatch
        }
    };
}