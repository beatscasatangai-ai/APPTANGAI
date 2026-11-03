import { useState } from "react";
import AppShell from "../components/AppShell";
import AuthScreen from "../features/auth/AuthScreen";
import Dashboard from "../features/dashboard/Dashboard";
import { isSupabaseConfigured } from "../lib/supabase";
import type { AppRole } from "../types";

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<AppRole>("member");

  if (!signedIn) {
    return (
      <>
        <AuthScreen onEnterDemo={() => setSignedIn(true)} />
        {!isSupabaseConfigured && (
          <div className="configuration-toast">
            <span className="configuration-dot" />
            Modo de demostración · Supabase aún no está configurado
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AppShell role={role} onRoleChange={setRole} onSignOut={() => setSignedIn(false)}>
        <Dashboard role={role} />
      </AppShell>
      <div className="configuration-toast">
        <span className="configuration-dot" />
        Modo de demostración · datos de ejemplo, no persistentes
      </div>
    </>
  );
}
