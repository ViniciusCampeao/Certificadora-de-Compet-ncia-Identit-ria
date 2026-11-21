import { Modal } from "./Modal.jsx";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  danger,
  busy,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} close={onClose}>
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Cancelar
        </button>
        <button
          className={`primary ${danger ? "danger" : ""}`}
          disabled={busy}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
