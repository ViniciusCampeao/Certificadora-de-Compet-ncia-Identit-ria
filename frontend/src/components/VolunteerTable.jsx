import { initials, formatDate } from "../lib/format.js";
import { StatusBadge } from "./StatusBadge.jsx";

export function VolunteerTable({ volunteers, onSelect, compact }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>VOLUNTÁRIO</th>
            <th>MATRÍCULA</th>
            <th>CURSO</th>
            <th>DATA DE ENTRADA</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v) => (
            <tr
              key={v.id}
              className={onSelect ? "clickable" : ""}
              onClick={() => onSelect?.(v)}
            >
              <td>
                <div className="person">
                  <span className="avatar">{initials(v.name)}</span>
                  <span>
                    <b>{v.name}</b>
                    <small>{v.email}</small>
                  </span>
                </div>
              </td>
              <td>{v.registration}</td>
              <td className="course">{v.course}</td>
              <td>{formatDate(v.joined)}</td>
              <td>
                <StatusBadge status={v.status} />
              </td>
            </tr>
          ))}
          {!volunteers.length && (
            <tr>
              <td colSpan="5" className="empty">
                Nenhum cadastro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
