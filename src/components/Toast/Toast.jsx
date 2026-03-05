import { useEffect } from "react";

export default function Toast({ open, message, actionText, onAction, onClose, timeout = 3500 }) {
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => onClose?.(), timeout);
        return () => clearTimeout(t);
    }, [open, timeout, onClose]);

    if (!open) return null;

    return (
        <div className="toast" role="status" aria-live="polite">
            <div className="toast-msg">{message}</div>

            {actionText ? (
                <button className="toast-action" type="button" onClick={onAction}>
                    {actionText}
                </button>
            ) : null}

            <button className="toast-x" type="button" onClick={onClose} aria-label="Закрыть">
                ✕
            </button>
        </div>
    );
}