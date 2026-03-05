import { useEffect, useState } from "react";
import "./sendEstimateModal.css";

export default function SendEstimateModal({
    open,
    onClose,
    onSubmit,
    loading = false,
    initialContact = "",
    initialEmail = "",
}) {
    const [contact, setContact] = useState(initialContact);
    const [clientEmail, setClientEmail] = useState(initialEmail);

    useEffect(() => {
        if (open) {
            setContact(initialContact);
            setClientEmail(initialEmail);
        }
    }, [open, initialContact, initialEmail]);

    if (!open) return null;

    return (
        <div className="sem-backdrop" onMouseDown={onClose}>
            <div className="sem-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="sem-head">
                    <h3>Отправить смету</h3>
                    <button className="sem-x" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <div className="sem-body">
                    <label className="sem-label">
                        Контакт (Telegram / телефон / email)
                        <input
                            className="sem-input"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="@username или +7..."
                            autoFocus
                        />
                    </label>

                    <label className="sem-label">
                        Email клиента (необязательно)
                        <input
                            className="sem-input"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="client@gmail.com"
                        />
                        <div className="sem-hint">
                            Если SMTP не сможет отправить копию — это не помешает отправке сметы тебе.
                        </div>
                    </label>
                </div>

                <div className="sem-actions">
                    <button className="sem-btn sem-btn--ghost" type="button" onClick={onClose} disabled={loading}>
                        Отмена
                    </button>
                    <button
                        className="sem-btn sem-btn--primary"
                        type="button"
                        onClick={() => onSubmit({ contact: contact.trim(), clientEmail: clientEmail.trim() })}
                        disabled={loading}
                    >
                        {loading ? "Отправляю..." : "Отправить"}
                    </button>
                </div>
            </div>
        </div>
    );
}