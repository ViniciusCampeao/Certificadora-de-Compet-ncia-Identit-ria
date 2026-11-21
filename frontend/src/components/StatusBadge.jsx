const toneByStatus = {
  Ativo: "green",
  Encerrado: "gray",
  Aprovado: "green",
  "Em análise": "amber",
  Rejeitado: "red",
  Gerado: "blue",
  Pendente: "gray",
};

export function StatusBadge({ status }) {
  return (
    <span className={`status ${toneByStatus[status] || "gray"}`}>
      <i />
      {status}
    </span>
  );
}
