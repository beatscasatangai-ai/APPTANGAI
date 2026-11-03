import { LogOut } from "lucide-react";
import type { AppRole } from "../types";
import Brand from "./Brand";

type AppShellProps = {
  role: AppRole;
  isDemo: boolean;
  onRoleChange: (role: AppRole) => void;
  onSignOut: () => Promise<void>;
  signOutError: string;
  children: React.ReactNode;
};

export default function AppShell({
  role,
  isDemo,
  onRoleChange,
  onSignOut,
  signOutError,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <div className="app-header-actions">
          {isDemo && (
            <>
              <label className="role-picker-label" htmlFor="role-picker">Demo</label>
              <select id="role-picker" className="role-picker" value={role} onChange={(event) => onRoleChange(event.target.value as AppRole)}>
                <option value="member">Socio</option>
                <option value="staff">Personal</option>
                <option value="admin">Administración</option>
              </select>
            </>
          )}
          <button className="icon-button logout-button" onClick={() => { void onSignOut(); }} type="button" aria-label="Cerrar sesión"><LogOut size={18} /></button>
        </div>
      </header>
      {signOutError && <p className="app-error" role="alert">{signOutError}</p>}
      <main className="main-area">
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}
