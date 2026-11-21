import { useState } from "react";
import { Modal } from "../../components/Modal.jsx";

const clean = (value) => (value && value !== "Não informado" ? value : "");

export function VolunteerFormModal({ initial, onSubmit, onClose, busy }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState({
    name: initial?.name || "",
    registration: initial?.registration || "",
    cpf: initial?.cpf || "",
    course: clean(initial?.course),
    period: clean(initial?.period),
    email: initial?.email || "",
    phone: initial?.phone || "",
    joined: initial?.joined || "",
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      title={editing ? "Editar voluntário" : "Novo voluntário"}
      close={onClose}
    >
      <form onSubmit={submit}>
        <label>
          Nome completo
          <input
            value={form.name}
            onChange={update("name")}
            required
            placeholder="Nome do voluntário"
          />
        </label>
        <div className="form-row">
          <label>
            Matrícula
            <input
              value={form.registration}
              onChange={update("registration")}
              required
              placeholder="20260001"
              disabled={editing}
            />
          </label>
          <label>
            CPF
            <input
              value={form.cpf}
              onChange={update("cpf")}
              placeholder="000.000.000-00"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Curso
            <input
              value={form.course}
              onChange={update("course")}
              placeholder="Curso"
            />
          </label>
          <label>
            Período
            <input
              value={form.period}
              onChange={update("period")}
              placeholder="1º período"
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            E-mail
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="nome@exemplo.edu.br"
            />
          </label>
          <label>
            Telefone
            <input
              value={form.phone}
              onChange={update("phone")}
              placeholder="(43) 99999-9999"
            />
          </label>
        </div>
        {!editing && (
          <label>
            Data de entrada
            <input type="date" value={form.joined} onChange={update("joined")} />
          </label>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary" disabled={busy}>
            {editing ? "Salvar alterações" : "Cadastrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
