import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { estimatorReducer } from "./EstimatorReducer.js";
import { actions } from "./estimatorActions.js";
import { selectTotals } from "./estimatorSelectors.js";
import { loadAppState, saveAppState } from "@/shared/storage/storage.js";

import LineItemsTable from "./components/LineItemsTable.jsx";
import OptionsPanel from "./components/OptionsPanel.jsx";
import Breakdown from "./components/Breakdown.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import Toast from "@/components/Toast/Toast.jsx";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import {
    downloadJson,
    makeSafeFilename,
    dateStamp,
} from "@/shared/utils/downloadJson.js";
import { importDraft } from "@/shared/core/importDraft.js";
import SendEstimateModal from "@/components/SendEstimateModal/SendEstimateModal.jsx";
import { buildEstimateText } from "@/shared/utils/buildEstimateText.js";

import "./styles.css";

export default function EstimatorPage() {
    const [toast, setToast] = useState({
        open: false,
        message: "",
        actionText: "",
        onAction: null,
    });

    const [confirmState, setConfirmState] = useState({
        open: false,
        type: null, // "template" | "clear"
        kind: null,
    });

    const [sendOpen, setSendOpen] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);

    const fileRef = useRef(null);

    function closeToast() {
        setToast({ open: false, message: "", actionText: "", onAction: null });
    }

    const [state, dispatch] = useReducer(estimatorReducer, null, () =>
        loadAppState(),
    );

    const totals = useMemo(() => selectTotals(state), [state]);

    // автосохранение
    const timerRef = useRef(null);
    useEffect(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => saveAppState(state), 400);
        return () => clearTimeout(timerRef.current);
    }, [state]);

    async function sendEstimate({ contact, clientEmail }) {
        try {
            setSendLoading(true);

            // Нормализуем вход (без undefined — PHP/JSON проще)
            const safeContact = (contact || "").trim();
            const safeClientEmail = (clientEmail || "").trim();

            const estimateText = buildEstimateText(state.draft, totals);

            const payload = {
                contact: safeContact || null,
                clientEmail: safeClientEmail || null,
                title: state.draft?.projectMeta?.title || "Без названия",
                total: totals?.total ?? totals?.grandTotal ?? totals?.sum ?? null,
                days: totals?.days ?? totals?.totalDays ?? null,
                estimateText,
                estimateJson: state.draft,
            };

            const res = await fetch("/api/lead.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // Если сервер вернул HTML/ошибку — json() упадёт, поэтому безопасно
            const raw = await res.text();
            let data = null;

            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                // если это HTML (например 404) — data останется null
            }

            if (!res.ok || !data?.ok) {
                console.error("Lead API response:", { status: res.status, raw });
                throw new Error(data?.error || `HTTP_${res.status}`);
            }

            setSendOpen(false);

            // Если копию клиенту не удалось отправить — это ок, просто сообщаем
            if (data.clientSent === false && safeClientEmail) {
                setToast({
                    open: true,
                    message:
                        "Смета отправлена тебе ✅ Клиенту копию отправить не удалось — пусть сохранит смету кнопкой «Скопировать» или экспортом JSON.",
                    actionText: "",
                    onAction: null,
                });
            } else {
                setToast({
                    open: true,
                    message: "Смета отправлена ✅",
                    actionText: "",
                    onAction: null,
                });
            }
        } catch (err) {
            console.error(err);
            setToast({
                open: true,
                message: "Ошибка отправки сметы",
                actionText: "",
                onAction: null,
            });
        } finally {
            setSendLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="grid">
                <div className="col-left">
                    <div className="card">
                        <a href="https://portfolio.vkazakdon.ru" className="portfolio-back">
                                ← Портфолио
                            </a>
                        <div className="card-head">
                            <h1>Смета</h1>

                            <input
                                className="project-title"
                                value={state.draft.projectMeta.title}
                                onChange={(e) =>
                                    dispatch(actions.setProjectTitle(e.target.value))
                                }
                                placeholder="Название проекта"
                            />

                            {/* Кнопку оставляем ОДНУ — здесь или в LineItemsTable.
                                Если оставляешь здесь (как на скрине) — в LineItemsTable кнопку убираем. */}
                            <button
                                className="primary"
                                type="button"
                                onClick={() => dispatch(actions.addLineItem())}
                            >
                                + Добавить экран
                            </button>
                        </div>

                        <div className="card" style={{ marginTop: 12 }}>
                            <div style={{ fontWeight: 800, marginBottom: 8 }}>
                                Быстро добавить
                            </div>
                            <input
                                className="bulk-input"
                                placeholder="Например: Главная, Каталог, Карточка товара, Корзина"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        dispatch(actions.bulkAdd(e.currentTarget.value));
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                            <div className="bulk-hint">
                                Разделяй экраны запятыми, Enter — добавить.
                            </div>
                        </div>
                    </div>

                    <LineItemsTable
                        draft={state.draft}
                        dispatch={dispatch}
                        actions={actions}
                        onRemoved={() =>
                            setToast({
                                open: true,
                                message: "Экран удалён",
                                actionText: "Отменить",
                                onAction: () => {
                                    dispatch(actions.undoRemove());
                                    closeToast();
                                },
                            })
                        }
                    />

                    <div className="stack">
                        <OptionsPanel
                            draft={state.draft}
                            dispatch={dispatch}
                            actions={actions}
                        />

                        {state.draft.lineItems.length > 0 && <Breakdown totals={totals} />}
                    </div>
                </div>

                <div className="col-right">
                    <SummaryPanel
                        draft={state.draft}
                        totals={totals}
                        onLoadTemplate={(kind) => {
                            if (state.draft.lineItems.length > 0) {
                                setConfirmState({ open: true, type: "template", kind });
                            } else {
                                dispatch(actions.loadTemplate(kind));
                            }
                        }}
                        onSetProfile={(profile) => dispatch(actions.setProfile(profile))}
                        onClear={() => {
                            if (!state.draft.lineItems.length) return;
                            setConfirmState({ open: true, type: "clear", kind: null });
                        }}
                        onCopied={() =>
                            setToast({
                                open: true,
                                message: "Смета скопирована 👍",
                                actionText: "",
                                onAction: null,
                            })
                        }
                        onExport={() => {
                            const title = makeSafeFilename(state.draft.projectMeta.title);
                            const profile = (
                                state.draft.pricing?.profile || "middle"
                            ).toUpperCase();
                            const filename = `${dateStamp()}_${title}_${profile}.json`;

                            // экспортируем ВСЁ состояние draft, чтобы можно было восстановить 1:1
                            downloadJson(filename, state.draft);

                            setToast({
                                open: true,
                                message: "JSON экспортирован",
                                actionText: "",
                                onAction: null,
                            });
                        }}
                    />

                    <div className="send-estimate-row">
                        <button
                            className="primary"
                            type="button"
                            onClick={() => setSendOpen(true)}
                            disabled={!state.draft.lineItems.length}
                        >
                            Отправить смету
                        </button>

                        <a
                            className="secondary"
                            href="https://t.me/KazakDmitriy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Остались вопросы?
                        </a>
                    </div>

                    <div className="card" style={{ marginTop: 12 }}>
                        <div className="card-head">
                            <h2>История</h2>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className="secondary"
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    Импорт JSON
                                </button>

                                <button
                                    className="primary"
                                    type="button"
                                    onClick={() => {
                                        dispatch(actions.saveToHistory(totals));
                                        setToast({
                                            open: true,
                                            message: "Проект сохранён в историю",
                                            actionText: "",
                                            onAction: null,
                                        });
                                    }}
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="application/json"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (!file) return;

                                try {
                                    const text = await file.text();
                                    const raw = JSON.parse(text);

                                    // true = импортировать ставки/коэф-ты из файла (для твоих бэкапов)
                                    const draft = importDraft(raw, { importPricing: true });

                                    dispatch(actions.importDraft(draft));
                                    setToast({
                                        open: true,
                                        message: "Проект импортирован в черновик",
                                        actionText: "",
                                        onAction: null,
                                    });
                                } catch {
                                    setToast({
                                        open: true,
                                        message: "Ошибка импорта JSON",
                                        actionText: "",
                                        onAction: null,
                                    });
                                }
                            }}
                        />

                        <HistoryPanel
                            projects={state.history.projects}
                            onOpen={(id) => dispatch(actions.openHistory(id))}
                            onDuplicate={(id) => dispatch(actions.duplicateHistory(id))}
                            onDelete={(id) => dispatch(actions.deleteHistory(id))}
                        />
                    </div>
                </div>
            </div>

            <Toast
                open={toast.open}
                message={toast.message}
                actionText={toast.actionText}
                onAction={toast.onAction}
                onClose={closeToast}
            />

            <ConfirmModal
                open={confirmState.open}
                title={
                    confirmState.type === "template"
                        ? "Загрузить шаблон?"
                        : "Очистить экраны?"
                }
                text={
                    confirmState.type === "template"
                        ? "Текущие экраны будут заменены."
                        : "Все экраны будут удалены. Действие можно отменить."
                }
                confirmText={
                    confirmState.type === "template" ? "Загрузить" : "Очистить"
                }
                onCancel={() =>
                    setConfirmState({ open: false, type: null, kind: null })
                }
                onConfirm={() => {
                    if (confirmState.type === "template") {
                        dispatch(actions.loadTemplate(confirmState.kind));
                    }

                    if (confirmState.type === "clear") {
                        dispatch(actions.clearLineItems());

                        setToast({
                            open: true,
                            message: "Экраны очищены",
                            actionText: "Отменить",
                            onAction: () => {
                                dispatch(actions.undoRemove());
                                closeToast();
                            },
                        });
                    }

                    setConfirmState({ open: false, type: null, kind: null });
                }}
            />

            <SendEstimateModal
                open={sendOpen}
                onClose={() => setSendOpen(false)}
                onSubmit={sendEstimate}
                loading={sendLoading}
            />
        </div>
    );
}
