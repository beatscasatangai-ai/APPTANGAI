import {
  ArrowUpRight,
  CircleHelp,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings2,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import type { AppRole } from "../types";
import Brand from "./Brand";

type AppShellProps = {
  role: AppRole;
  onRoleChange: (role: AppRole) => void;
  onSignOut: () => void;
  children: React.ReactNode;
};

const memberNavigation = [
  { label: "Resumen", icon: LayoutDashboard },
  { label: "Mi cartera", icon: WalletCards },
  { label: "Refrescos", icon: Gift },
];

const staffNavigation = [
  { label: "Resumen", icon: LayoutDashboard },
  { label: "Registrar donación", icon: WalletCards },
  { label: "Validar vale", icon: ShieldCheck },
  { label: "Socios", icon: Users },
];

export default function AppShell({
  role,
  onRoleChange,
  onSignOut,
  children,
}: AppShellProps) {
  const [activeNav, setActiveNav] = useState("Resumen");
  const navigation = role === "member" ? memberNavigation : staffNavigation;
  const currentUser = role === "member" ? "Alex Morgan" : "Marina Torres";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand />
          <span className="association-label">ASOCIACIÓN</span>
        </div>
        <div className="workspace-label">ESPACIO PERSONAL</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              className={`nav-item ${activeNav === label ? "nav-active" : ""}`}
              key={label}
              onClick={() => setActiveNav(label)}
              type="button"
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Refrescos" && <ArrowUpRight className="nav-trailing" size={14} />}
            </button>
          ))}
          {role === "admin" && (
            <button className="nav-item" onClick={() => setActiveNav("Productos")} type="button">
              <Package size={18} strokeWidth={1.8} /><span>Productos y precios</span>
            </button>
          )}
        </nav>
        {role !== "member" && (
          <>
            <div className="workspace-label staff-label">GESTIÓN</div>
            <nav className="side-nav" aria-label="Gestión">
              <button className="nav-item" onClick={() => setActiveNav("Socios")} type="button">
                <Users size={18} strokeWidth={1.8} /><span>Socios</span>
              </button>
              {role === "admin" && (
                <button className="nav-item" onClick={() => setActiveNav("Productos")} type="button">
                  <Settings2 size={18} strokeWidth={1.8} /><span>Configuración</span>
                </button>
              )}
            </nav>
          </>
        )}
        <div className="sidebar-bottom">
          <button className="nav-item help-link" type="button">
            <CircleHelp size={18} /><span>Ayuda y soporte</span>
          </button>
          <div className="sidebar-user">
            <div className="avatar">{currentUser.split(" ").map((part) => part[0]).join("")}</div>
            <div className="user-copy"><strong>{currentUser}</strong><span>{role === "member" ? "Socio · Tangai" : role === "admin" ? "Administradora" : "Personal"}</span></div>
            <button className="icon-button logout-button" onClick={onSignOut} type="button" aria-label="Cerrar sesión"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" type="button" aria-label="Abrir menú"><Menu size={19} /></button>
          <div className="breadcrumb"><span>Asociación Tangai</span><span className="crumb-slash">/</span><strong>Monedero</strong></div>
          <div className="topbar-right">
            <label className="role-picker-label" htmlFor="role-picker">Vista de demostración</label>
            <select id="role-picker" className="role-picker" value={role} onChange={(event) => onRoleChange(event.target.value as AppRole)}>
              <option value="member">Socio</option>
              <option value="staff">Personal</option>
              <option value="admin">Administración</option>
            </select>
            <div className="top-avatar">{currentUser.split(" ").map((part) => part[0]).join("")}</div>
          </div>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}
