export default function ConfirmModal({ open, title, text, confirmText = "Да", cancelText = "Отмена", onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card">
                <div className="modal-title">{title}</div>
                <div className="modal-text">{text}</div>

                <div className="modal-actions">
                    <button type="button" onClick={onCancel}>{cancelText}</button>
                    <button className="primary" type="button" onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}