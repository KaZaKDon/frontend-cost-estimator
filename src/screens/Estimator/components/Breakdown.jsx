import { formatRub } from "@/shared/core/money.js";

export default function Breakdown({ totals }) {
    return (
        <div className="card">
            <h3>Расшифровка</h3>

            <div className="bd">
                {totals.breakdown.map((x) => (
                    <div className="bd-row" key={x.key}>
                        <div className="bd-label">{x.label}</div>
                        <div className="bd-val">{formatRub(x.value)}</div>
                    </div>
                ))}

                <div className="bd-sep" />

                <div className="bd-row bd-total">
                    <div className="bd-label">Итого</div>
                    <div className="bd-val">{formatRub(totals.totalCost)}</div>
                </div>
            </div>
        </div>
    );
}