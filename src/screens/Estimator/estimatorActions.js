export const A = {
    HYDRATE: "HYDRATE",

    SET_PROJECT_TITLE: "SET_PROJECT_TITLE",

    ADD_LINE_ITEM: "ADD_LINE_ITEM",
    UPDATE_LINE_ITEM: "UPDATE_LINE_ITEM",
    DUPLICATE_LINE_ITEM: "DUPLICATE_LINE_ITEM",
    REMOVE_LINE_ITEM: "REMOVE_LINE_ITEM",
    MOVE_LINE_ITEM: "MOVE_LINE_ITEM",

    TOGGLE_OPTION: "TOGGLE_OPTION",
    SET_RESPONSIVE: "SET_RESPONSIVE",
    SET_URGENCY: "SET_URGENCY",
    LOAD_EXAMPLE: "LOAD_EXAMPLE",
    UNDO_REMOVE: "UNDO_REMOVE",
    BULK_ADD: "BULK_ADD",
    LOAD_TEMPLATE: "LOAD_TEMPLATE",
    SET_PROFILE: "SET_PROFILE",
    BULK_ADD: "BULK_ADD",
    UNDO_REMOVE: "UNDO_REMOVE",
    CLEAR_LINE_ITEMS: "CLEAR_LINE_ITEMS",

    SAVE_TO_HISTORY: "SAVE_TO_HISTORY",
    OPEN_HISTORY: "OPEN_HISTORY",
    DUPLICATE_HISTORY: "DUPLICATE_HISTORY",
    DELETE_HISTORY: "DELETE_HISTORY",

    IMPORT_DRAFT: "IMPORT_DRAFT",
    SET_PROJECT_TYPE: "SET_PROJECT_TYPE",
};

export const setProjectType = (type) => ({
    type: A.SET_PROJECT_TYPE,
    payload: type,
});

export const actions = {
    hydrate: (payload) => ({
        type: A.HYDRATE,
        payload
    }),

    setProjectTitle: (title) => ({
        type: A.SET_PROJECT_TITLE,
        title
    }),

    addLineItem: () => ({
        type: A.ADD_LINE_ITEM
    }),
    updateLineItem: (id, patch) => ({
        type: A.UPDATE_LINE_ITEM,
        id,
        patch
    }),
    duplicateLineItem: (id) => ({
        type: A.DUPLICATE_LINE_ITEM,
        id
    }),
    removeLineItem: (id) => ({
        type: A.REMOVE_LINE_ITEM,
        id
    }),
    moveLineItem: (id, dir) => ({
        type: A.MOVE_LINE_ITEM,
        id,
        dir
    }), // dir: "up"|"down"

    toggleOption: (path) => ({
        type: A.TOGGLE_OPTION,
        path
    }), // e.g. "quality.pixelPerfect"
    setResponsive: (device, value) => ({
        type: A.SET_RESPONSIVE,
        device,
        value
    }),
    setUrgency: (mode) => ({
        type: A.SET_URGENCY,
        mode
    }), // normal|urgent|veryUrgent
    loadExample: (kind = "shop") => ({ type: A.LOAD_EXAMPLE, kind }),
    undoRemove: () => ({ type: A.UNDO_REMOVE }),
    bulkAdd: (text) => ({ type: A.BULK_ADD, text }),
    loadTemplate: (kind) => ({ type: A.LOAD_TEMPLATE, kind }), // kind: "shop" | "landing"
    setProfile: (profile) => ({ type: A.SET_PROFILE, profile }),
    bulkAdd: (text) => ({ type: A.BULK_ADD, text }),
    undoRemove: () => ({ type: A.UNDO_REMOVE }),
    clearLineItems: () => ({ type: A.CLEAR_LINE_ITEMS }),
    saveToHistory: (totals) => ({ type: A.SAVE_TO_HISTORY, totals }),
    openHistory: (id) => ({ type: A.OPEN_HISTORY, id }),
    duplicateHistory: (id) => ({ type: A.DUPLICATE_HISTORY, id }),
    deleteHistory: (id) => ({ type: A.DELETE_HISTORY, id }),
    importDraft: (draft) => ({ type: A.IMPORT_DRAFT, draft }),
};