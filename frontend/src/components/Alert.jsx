export function Alert({ message, onClose, tone = "error" }) {
  if (!message) return null;
  return (
    <div
      className={`alert ${tone === "success" ? "alert-success" : ""} ${
        onClose ? "dismiss" : ""
      }`}
      onClick={onClose}
    >
      {message}
      {onClose && <b>×</b>}
    </div>
  );
}
