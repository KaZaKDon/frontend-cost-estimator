import { formatRub } from "@/shared/core/money.js";
import { downloadJson, makeSafeFilename, dateStamp } from "@/shared/utils/downloadJson.js";

export default function HistoryPanel({ projects, onOpen, onDuplicate, onDelete }) {
    if (!projects?.length) {
        return <div className="empty">История пуста. Сохрани первый проект.</div>;
    }

    return (
        <div className="history-list">
            {projects.map((p) => {
                const id = p.projectMeta?.id;
                const title = p.projectMeta?.title || "Без названия";
                const updatedAt = p.projectMeta?.updatedAt
                    ? new Date(p.projectMeta.updatedAt).toLocaleString()
                    : "";

                const total = p.snapshot?.totalCost;
                const days = p.snapshot?.totalDays;

                return (
                    <div className="history-item" key={id}>
                        <div className="history-main">
                            <div className="history-title">{title}</div>

                            <div className="history-meta">
                                {total ? `💰 ${total.toLocaleString()} ₽` : ""}
                                {days ? ` · ⏱ ${days.toFixed(1)} дн.` : ""}
                                {updatedAt ? ` · ${updatedAt}` : ""}
                            </div>
                        </div>

                        <div className="history-actions">
                            <button type="button" onClick={() => onOpen(id)}>Открыть</button>
                            <button type="button" onClick={() => onDuplicate(id)}>⎘</button>
                            <button
                                type="button"
                                onClick={() => {
                                    const title = makeSafeFilename(p.projectMeta?.title);
                                    const profile = (p.pricing?.profile || "middle").toUpperCase();
                                    const filename = `${dateStamp(p.projectMeta?.updatedAt)}_${title}_${profile}.json`;
                                    downloadJson(filename, p);
                                }}
                                title="Экспорт JSON"
                            >
                                JSON
                            </button>
                            <button type="button" onClick={() => onDelete(id)}>✕</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}