import { formatRub } from "@/shared/core/money.js";
import { formatDays } from "@/shared/core/days.js";
import CopyQuoteButton from "./CopyQuoteButton.jsx";

export default function SummaryPanel({
    draft,
    totals,
    onLoadTemplate,
    onSetProfile,
    onClear,
    onCopied, // <-- ВАЖНО: объявили
    onExport
}) {
    return (
        <div className="summary">
            <div className="card">
                <div className="sum-top">
                    <div className="sum-total">{formatRub(totals.totalCost)}</div>
                    <div className="sum-days">{formatDays(totals.totalDays)}</div>
                </div>

                {totals.range ? (
                    <div className="sum-range">
                        Диапазон: {formatRub(totals.range.min)} – {formatRub(totals.range.max)}
                    </div>
                ) : null}

                <div style={{ marginTop: 12 }}>
                    <CopyQuoteButton
                        draft={draft}
                        totals={totals}
                        onCopied={() => onCopied?.()} // <-- безопасно
                    />
                    <div style={{ marginTop: 10 }}>
                        <button type="button" onClick={() => onExport?.()} disabled={!draft.lineItems.length}>
                            Экспорт JSON
                        </button>
                    </div>
                </div>

                {/* Шаблоны */}
                <div style={{ marginTop: 14 }}>
                    <div className="tpl-title">Шаблоны</div>
                    <div className="tpl-buttons">
                        <button type="button" onClick={() => onLoadTemplate?.("shop")}>
                            Интернет-магазин
                        </button>
                        <button type="button" onClick={() => onLoadTemplate?.("landing")}>
                            Лендинг
                        </button>
                    </div>
                    <div className="tpl-hint">Вставит типовой список экранов.</div>
                </div>

                {/* Профиль */}
                <div style={{ marginTop: 16 }}>
                    <div className="tpl-title">Уровень разработчика</div>
                    <div className="profile-switch">
                        {["junior", "middle", "senior"].map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={draft.pricing.profile === p ? "active" : ""}
                                onClick={() => onSetProfile?.(p)}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Очистка */}
                <div style={{ marginTop: 12 }}>
                    <button type="button" onClick={() => onClear?.()} disabled={!draft.lineItems.length}>
                        Очистить экраны
                    </button>
                </div>
                <div className="mini">
                    <div className="mini-row">
                        <div className="mini-k">Экраны</div>
                        <div className="mini-v">{draft.lineItems.length}</div>
                    </div>

                    <div className="mini-row">
                        <div className="mini-k">Адаптив</div>
                        <div className="mini-v">{formatResponsive(draft.options?.responsive)}</div>
                    </div>

                    <div className="mini-row">
                        <div className="mini-k">Профиль</div>
                        <div className="mini-v">{(draft.pricing?.profile || "middle").toUpperCase()}</div>
                    </div>

                    <div className="mini-row">
                        <div className="mini-k">Риск</div>
                        <div className="mini-v">{draft.options?.risk?.includeRisk ? `+${draft.pricing?.coefficients?.riskPct ?? 0}%` : "—"}</div>
                    </div>
                </div>
                <div className="hint">Автосохранение включено</div>
            </div>
        </div>
    );

    function formatResponsive(r) {
        const out = [];
        if (r?.tablet) out.push("Tablet");
        if (r?.mobile) out.push("Mobile");
        return out.length ? out.join(" + ") : "—";
    }
}