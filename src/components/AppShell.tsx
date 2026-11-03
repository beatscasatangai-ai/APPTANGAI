import { LogOut } from "lucide-react";
import Brand from "./Brand";

type AppShellProps = {
  onSignOut: () => Promise<void>;
  signOutError: string;
  children: React.ReactNode;
};

export default function AppShell({
  onSignOut,
  signOutError,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Brand />
        <div className="app-header-actions">
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
