import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { PageTitle } from "../../components/PageTitle.jsx";
import { Modal } from "../../components/Modal.jsx";
import { Alert } from "../../components/Alert.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { VolunteerTable } from "../../components/VolunteerTable.jsx";
import { initials, formatDate } from "../../lib/format.js";
import { VolunteerFormModal } from "./VolunteerFormModal.jsx";

const editableFields = ["name", "course", "period", "email", "phone", "cpf"];

export function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null); // {} para novo, voluntário para editar
  const [selected, setSelected] = useState(null);

  const load = () => {
    api
      .get(
        `/volunteers?q=${encodeURIComponent(q)}&status=${encodeURIComponent(filter)}`,
      )
      .then(setVolunteers)
      .catch((e) => setError(e.message));
  };

  useEffect(load, [q, filter]);

  const saveVolunteer = async (data) => {
    setBusy(true);
    setError("");
    try {
      if (form?.id) {
        const payload = Object.fromEntries(
          editableFields.map((f) => [f, data[f]]),
        );
        await api.patch(`/volunteers/${form.id}`, payload);
      } else {
        await api.post("/volunteers", data);
      }
      setForm(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (volunteer) => {
    try {
      await api.patch(`/volunteers/${volunteer.id}`, {
        status: volunteer.status === "Ativo" ? "Encerrado" : "Ativo",
      });
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeVolunteer = async (volunteer) => {
    try {
      await api.del(`/volunteers/${volunteer.id}`);
      setSelected(null);
      load();
    } catch (e) {
      setSelected(null);
      setError(e.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="GESTÃO DE PESSOAS"
        title="Voluntários"
        subtitle="Consulte cadastros e acompanhe a situação dos vínculos."
      >
        <button className="primary" onClick={() => setForm({})}>
          ＋ Novo voluntário
        </button>
      </PageTitle>
      <Alert message={error} onClose={() => setError("")} />
      <section className="panel list-panel">
        <div className="toolbar">
          <div className="search">
            <span>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, matrícula ou curso"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Todos</option>
            <option>Ativo</option>
            <option>Encerrado</option>
          </select>
          <span className="count">{volunteers.length} registros</span>
        </div>
        <VolunteerTable volunteers={volunteers} onSelect={setSelected} />
      </section>

      {form && (
        <VolunteerFormModal
          initial={form}
          busy={busy}
          onClose={() => setForm(null)}
          onSubmit={saveVolunteer}
        />
      )}

      {selected && (
        <Modal title="Perfil do voluntário" close={() => setSelected(null)}>
          <div className="profile-detail">
            <span className="avatar big">{initials(selected.name)}</span>
            <div>
              <h3>{selected.name}</h3>
              <p>
                {selected.registration} · <StatusBadge status={selected.status} />
              </p>
            </div>
          </div>
          <dl className="details">
            <dt>Curso</dt>
            <dd>{selected.course}</dd>
            <dt>Período</dt>
            <dd>{selected.period}</dd>
            <dt>E-mail</dt>
            <dd>{selected.email || "Não informado"}</dd>
            <dt>Telefone</dt>
            <dd>{selected.phone || "Não informado"}</dd>
            <dt>Entrada</dt>
            <dd>{formatDate(selected.joined)}</dd>
            <dt>Oficinas</dt>
            <dd>{selected.workshops.join(", ") || "Nenhuma registrada"}</dd>
            <dt>Termo</dt>
            <dd>
              <StatusBadge status={selected.termStatus} />
            </dd>
          </dl>
          <div className="modal-actions spread">
            <button
              className="secondary danger"
              onClick={() => removeVolunteer(selected)}
            >
              Excluir
            </button>
            <div className="actions-right">
              <button
                className="secondary"
                onClick={() => {
                  const target = selected;
                  setSelected(null);
                  setForm(target);
                }}
              >
                Editar
              </button>
              <button className="primary" onClick={() => toggleStatus(selected)}>
                {selected.status === "Ativo"
                  ? "Encerrar vínculo"
                  : "Reativar vínculo"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
