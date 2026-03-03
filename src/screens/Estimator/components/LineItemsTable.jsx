import { useRef } from "react";
import { formatRub } from "@/shared/core/money.js";
import LineItemRow from "./LineItemRow.jsx";

export default function LineItemsTable({ draft, dispatch, actions, onRemoved }) {
    const tiers = draft.pricing.tiers;

    // id строки, на которую надо поставить фокус после добавления
    const pendingFocusIdRef = useRef(null);

    function addItemAndFocus() {
        const id = crypto.randomUUID();
        pendingFocusIdRef.current = id;
        dispatch(actions.addLineItemWithId(id));
    }

    return (
        <div className="card">
            <div className="card-head">
                <h2>Экраны проекта</h2>
            </div>

            {!draft.lineItems.length ? (
                <div className="empty">Добавь первый экран — справа сразу появится итог.</div>
            ) : (
                <div className="li-list">
                    {draft.lineItems.map((it, idx) => {
                        const tierPrice = Number(tiers[it.complexity] ?? 0);
                        const rowCostNum = (Number(it.qty) || 1) * tierPrice;

                        return (
                            <LineItemRow
                                key={it.id}
                                item={it}
                                tierPrice={tierPrice}
                                rowCost={formatRub(rowCostNum)}
                                onChange={(patch) => dispatch(actions.updateLineItem(it.id, patch))}
                                onRemove={() => {
                                    dispatch(actions.removeLineItem(it.id));
                                    onRemoved?.();
                                }}
                                onDuplicate={() => dispatch(actions.duplicateLineItem(it.id))}
                                onMoveUp={() => dispatch(actions.moveLineItem(it.id, "up"))}
                                onMoveDown={() => dispatch(actions.moveLineItem(it.id, "down"))}
                                onAddNext={() => dispatch(actions.addLineItem())}
                                inputRef={(el) => {
                                    if (el && pendingFocusIdRef.current === it.id) {
                                        pendingFocusIdRef.current = null;
                                        // microtask чтобы гарантировать фокус после рендера
                                        queueMicrotask(() => el.focus());
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}