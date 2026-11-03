import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import AppShell from "../components/AppShell";
import Brand from "../components/Brand";
import AuthScreen from "../features/auth/AuthScreen";
import Dashboard from "../features/dashboard/Dashboard";
import { supabase } from "../lib/supabase";
import type { AppRole } from "../types";

type AccountStatus = "pending" | "approved" | "rejected";
type MemberProfile = {
  id: string;
  full_name: string | null;
  role: AppRole;
  status: AccountStatus;
};
type ProfileResult = {
  userId: string;
  profile?: MemberProfile;
  error?: string;
};

function isAppRole(value: unknown): value is AppRole {
  return value === "member" || value === "staff" || value === "admin";
}

function isAccountStatus(value: unknown): value is AccountStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [authError, setAuthError] = useState("");
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setRecoveryRequested(true);
      if (event === "SIGNED_OUT") setRecoveryRequested(false);
    });

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setAuthError(error.message);
        else setSession(data.session);
        setAuthLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAuthError(error instanceof Error ? error.message : "No se pudo recuperar la sesión.");
        setAuthLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setProfileResult(null);
      return;
    }

    let active = true;
    const userId = session.user.id;

    void (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, status")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          throw new Error("No existe tu perfil. Ejecuta la migración de perfiles en Supabase y vuelve a iniciar sesión.");
        }
        if (typeof data.id !== "string" || (data.full_name !== null && typeof data.full_name !== "string")) {
          throw new Error("El perfil tiene datos con un formato no válido. Revísalo en Supabase.");
        }
        if (!isAppRole(data.role) || !isAccountStatus(data.status)) {
          throw new Error("El perfil tiene un rol o estado no válido. Revísalo en Supabase.");
        }
        if (active) {
          setProfileResult({
            userId,
            profile: {
              id: data.id,
              full_name: data.full_name,
              role: data.role,
              status: data.status,
            },
          });
        }
      } catch (error) {
        if (active) {
          setProfileResult({
            userId,
            error: error instanceof Error ? error.message : "No se pudo consultar el perfil.",
          });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [session]);

  async function handleSignOut() {
    setSignOutError("");
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) setSignOutError(error.message);
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "No se pudo cerrar la sesión.");
    }
  }

  if (authLoading) {
    return <main className="auth-page"><p role="status">Conectando…</p></main>;
  }

  if (!session || recoveryRequested) {
    return (
      <AuthScreen
        initialError={authError}
        onPasswordUpdated={() => setRecoveryRequested(false)}
        recoveryRequested={recoveryRequested}
      />
    );
  }

  if (profileResult?.userId !== session.user.id) {
    return <main className="auth-page"><p role="status">Comprobando aprobación de la cuenta…</p></main>;
  }

  if (profileResult?.error) {
    return (
      <AccountNotice
        message={profileResult.error}
        onSignOut={() => { void handleSignOut(); }}
        title="No se pudo comprobar la cuenta"
      />
    );
  }

  if (profileResult?.profile?.status !== "approved") {
    const rejected = profileResult?.profile?.status === "rejected";
    return (
      <AccountNotice
        message={rejected
          ? "La solicitud de acceso no ha sido aprobada. Contacta con la asociación si necesitas más información."
          : "Tu cuenta está creada y el correo confirmado. El equipo de la asociación debe aprobarla antes de que puedas acceder."}
        onSignOut={() => { void handleSignOut(); }}
        title={rejected ? "Acceso no aprobado" : "Cuenta pendiente de aprobación"}
      />
    );
  }

  return (
    <AppShell onSignOut={handleSignOut} signOutError={signOutError}>
      <Dashboard role={profileResult.profile.role} />
    </AppShell>
  );
}

function AccountNotice({
  title,
  message,
  onSignOut,
}: {
  title: string;
  message: string;
  onSignOut: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card account-notice-card">
        <Brand />
        <h1>{title}</h1>
        <p>{message}</p>
        <button className="primary-button full-button" onClick={onSignOut} type="button">
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}
