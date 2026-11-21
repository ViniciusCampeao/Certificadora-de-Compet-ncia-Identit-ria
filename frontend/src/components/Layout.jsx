import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Brand } from "./Brand.jsx";
import { initials } from "../lib/format.js";

const navItems = [
  { to: "/app", end: true, label: "Visão geral", icon: "⌂" },
  { to: "/app/voluntarios", label: "Voluntários", icon: "♙" },
  { to: "/app/oficinas", label: "Oficinas", icon: "▦" },
  { to: "/app/documentos", label: "Documentos", icon: "▤" },
  { to: "/app/historico", label: "Histórico", icon: "◷" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sair = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <Brand />
        <div className="side-label">MENU PRINCIPAL</div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="project-note">
            <span className="note-icon">✳</span>
            <b>Projeto ELLP</b>
            <p>
              Extensão universitária
              <br />
              UTFPR · Cornélio Procópio
            </p>
          </div>
          <button className="profile" onClick={sair}>
            <span className="avatar admin">{initials(user.name)}</span>
            <span>
              <b>{user.name}</b>
              <small>Administrador</small>
            </span>
            <span className="dots">⋯</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            ELLP+ctrl <span>/</span> <b>Administração</b>
          </div>
          <div className="top-right">
            <span className="avatar admin">{initials(user.name)}</span>
            <button className="text-btn" onClick={sair}>
              Sair
            </button>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
        <footer>
          <span>
            ELLP+ctrl <b>·</b> Projeto de extensão UTFPR
          </span>
          <span>Gestão de voluntários</span>
        </footer>
      </main>
    </div>
  );
}
