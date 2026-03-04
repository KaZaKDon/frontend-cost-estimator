import { getComplexityLabel } from "@/shared/core/calc.js";
import { useRef, useEffect } from "react";

export default function LineItemRow({
    item,
    tierPrice,
    rowCost,
    onChange,
    onRemove,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onAddNext,
}) {
    const titleRef = useRef(null);

    // автофокус если строка новая
    useEffect(() => {
        if (!item.title || item.title === "Экран") {
            titleRef.current?.focus();
        }
    }, []);

    function dec() {
        onChange({ qty: Math.max(1, (Number(item.qty) || 1) - 1) });
    }

    function inc() {
        onChange({ qty: (Number(item.qty) || 1) + 1 });
    }

    return (
        <div className="li-row">
            {/* НАЗВАНИЕ (ЭТО главный input) */}
            <input
                ref={titleRef}
                className="li-title"
                value={item.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Название экрана"
                onKeyDown={(e) => {
                    if (e.key === "Enter") onAddNext?.();
                    if (e.key === "Backspace" && !item.title) onRemove?.();
                }}
            />

            {/* СЛОЖНОСТЬ */}
            <select
                className="li-select"
                value={item.complexity}
                onChange={(e) => onChange({ complexity: e.target.value })}
            >
                <option value="simple">{getComplexityLabel("simple")}</option>
                <option value="medium">{getComplexityLabel("medium")}</option>
                <option value="hard">{getComplexityLabel("hard")}</option>
                <option value="pro">{getComplexityLabel("pro")}</option>
            </select>

            {/* КОЛИЧЕСТВО */}
            <div className="li-qty">
                <button type="button" onClick={dec}>
                    –
                </button>

                <input
                    value={item.qty}
                    onChange={(e) => onChange({ qty: sanitizeQty(e.target.value) })}
                    inputMode="numeric"
                />

                <button type="button" onClick={inc}>
                    +
                </button>
            </div>

            {/* СТОИМОСТЬ */}
            <div className="li-cost">{rowCost}</div>

            {/* ДЕЙСТВИЯ */}
            <div className="li-actions">
                <button type="button" onClick={onMoveUp} title="Вверх">
                    ↑
                </button>
                <button type="button" onClick={onMoveDown} title="Вниз">
                    ↓
                </button>
                <button type="button" onClick={onDuplicate} title="Дублировать">
                    ⎘
                </button>
                <button type="button" onClick={onRemove} title="Удалить">
                    ✕
                </button>
            </div>
        </div>
    );
}

function sanitizeQty(v) {
    const n = Math.trunc(Number(v));
    if (!Number.isFinite(n) || n < 1) return 1;
    if (n > 999) return 999;
    return n;
}