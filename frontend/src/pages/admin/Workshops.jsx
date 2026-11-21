import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { PageTitle } from "../../components/PageTitle.jsx";
import { Modal } from "../../components/Modal.jsx";
import { Alert } from "../../components/Alert.jsx";
import { formatDate } from "../../lib/format.js";

export function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assign, setAssign] = useState({});
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([api.get("/workshops"), api.get("/volunteers")])
      .then(([w, v]) => {
        setWorkshops(w);
        setVolunteers(v);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const createWorkshop = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/workshops", {
        name: e.target.name.value,
        date: e.target.date.value,
        duration: e.target.duration.value,
      });
      setCreating(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addParticipant = async (workshop) => {
    if (!assign[workshop.id]) {
      setError("Selecione um voluntário para registrar a participação.");
      return;
    }
    try {
      await api.post(`/workshops/${workshop.id}/participants`, {
        volunteerId: assign[workshop.id],
      });
      setError("");
      setAssign((current) => ({ ...current, [workshop.id]: "" }));
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="ATIVIDADES DO PROJETO"
        title="Oficinas"
        subtitle="Organize a agenda e registre a participação de voluntários."
      >
        <button className="primary" onClick={() => setCreating(true)}>
          ＋ Nova oficina
        </button>
      </PageTitle>
      <Alert message={error} onClose={() => setError("")} />
      <div className="workshop-grid">
        {workshops.map((w) => (
          <article className="workshop" key={w.id}>
            <div className="workshop-top">
              <span className="workshop-icon">▦</span>
              <span className="status blue">
                <i />
                Agendada
              </span>
            </div>
            <h2>{w.name}</h2>
            <p>
              {formatDate(w.date)} · {w.duration} horas
            </p>
            <div className="participants">
              <span className="avatar small">{w.participantsCount}</span>
              <span>{w.participantsCount} participante(s)</span>
            </div>
            <div className="assign">
              <select
                value={assign[w.id] || ""}
                onChange={(e) =>
                  setAssign({ ...assign, [w.id]: e.target.value })
                }
              >
                <option value="">Adicionar voluntário</option>
                {volunteers
                  .filter((v) => !w.participants.includes(v.id))
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </select>
              <button
                className="icon-button"
                title="Registrar participação"
                onClick={() => addParticipant(w)}
              >
                ＋
              </button>
            </div>
          </article>
        ))}
        {!workshops.length && (
          <p className="muted">Nenhuma oficina cadastrada.</p>
        )}
      </div>

      {creating && (
        <Modal title="Nova oficina" close={() => setCreating(false)}>
          <form onSubmit={createWorkshop}>
            <label>
              Nome da oficina
              <input name="name" required placeholder="Ex.: Robótica criativa" />
            </label>
            <div className="form-row">
              <label>
                Data
                <input name="date" type="date" required />
              </label>
              <label>
                Duração (horas)
                <input name="duration" type="number" min="1" defaultValue="2" />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
              <button className="primary" disabled={busy}>
                Criar oficina
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
