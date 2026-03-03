export default function OptionsPanel({ draft, dispatch, actions }) {
    const o = draft.options;

    return (
        <div className="card">
            <h3>Опции</h3>

            <div className="opt-block">
                <div className="opt-title">Адаптив</div>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.responsive.tablet}
                        onChange={(e) => dispatch(actions.setResponsive("tablet", e.target.checked))}
                    />
                    Tablet
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.responsive.mobile}
                        onChange={(e) => dispatch(actions.setResponsive("mobile", e.target.checked))}
                    />
                    Mobile
                </label>
            </div>

            <div className="opt-block">
                <div className="opt-title">Качество</div>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.quality.pixelPerfect}
                        onChange={() => dispatch(actions.toggleOption("quality.pixelPerfect"))}
                    />
                    Pixel Perfect
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.quality.accessibility}
                        onChange={() => dispatch(actions.toggleOption("quality.accessibility"))}
                    />
                    Доступность (a11y)
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.quality.seoSemantic}
                        onChange={() => dispatch(actions.toggleOption("quality.seoSemantic"))}
                    />
                    Семантика/SEO
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.quality.crossBrowser}
                        onChange={() => dispatch(actions.toggleOption("quality.crossBrowser"))}
                    />
                    Кроссбраузерность
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.quality.performance}
                        onChange={() => dispatch(actions.toggleOption("quality.performance"))}
                    />
                    Оптимизация скорости
                </label>
            </div>

            <div className="opt-block">
                <div className="opt-title">Интерактив</div>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.interactive.formsValidation}
                        onChange={() => dispatch(actions.toggleOption("interactive.formsValidation"))}
                    />
                    Формы/валидация
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.interactive.apiIntegration}
                        onChange={() => dispatch(actions.toggleOption("interactive.apiIntegration"))}
                    />
                    Интеграция API
                </label>
                <label className="opt">
                    <input
                        type="checkbox"
                        checked={!!o.interactive.advancedAnimations}
                        onChange={() => dispatch(actions.toggleOption("interactive.advancedAnimations"))}
                    />
                    Продвинутые анимации
                </label>
            </div>

            <div className="opt-block">
                <div className="opt-title">Сроки</div>
                <div className="seg">
                    <button
                        type="button"
                        className={o.urgency.mode === "normal" ? "seg-on" : ""}
                        onClick={() => dispatch(actions.setUrgency("normal"))}
                    >
                        Обычно
                    </button>
                    <button
                        type="button"
                        className={o.urgency.mode === "urgent" ? "seg-on" : ""}
                        onClick={() => dispatch(actions.setUrgency("urgent"))}
                    >
                        Срочно
                    </button>
                    <button
                        type="button"
                        className={o.urgency.mode === "veryUrgent" ? "seg-on" : ""}
                        onClick={() => dispatch(actions.setUrgency("veryUrgent"))}
                    >
                        Очень срочно
                    </button>
                </div>

                <label className="opt">
                    <input type="checkbox" checked={!!o.risk.includeRisk} onChange={() => dispatch(actions.toggleOption("risk.includeRisk"))} />
                    Показывать диапазон с риском
                </label>
            </div>
        </div>
    );
}