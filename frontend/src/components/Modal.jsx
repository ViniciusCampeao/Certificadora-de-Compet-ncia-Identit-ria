export function Modal({ title, close, children }) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section className="modal">
        <header>
          <h2>{title}</h2>
          <button onClick={close} className="close" aria-label="Fechar">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
