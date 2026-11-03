import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Brand from "../../components/Brand";
import { supabase } from "../../lib/supabase";
import TurnstileCaptcha from "./TurnstileCaptcha";

type AuthScreenProps = {
  onEnterDemo: () => void;
  recoveryRequested: boolean;
  onPasswordUpdated: () => void;
  initialError?: string;
};

type AuthMode = "login" | "signup" | "reset";

const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";

export default function AuthScreen({
  onEnterDemo,
  recoveryRequested,
  onPasswordUpdated,
  initialError,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState("");

  const screen = recoveryRequested ? "recovery" : mode;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!supabase) {
      setError("Falta configurar la URL y la clave pública de Supabase en .env.");
      return;
    }
    if (captchaSiteKey && !captchaToken) {
      setError("Completa la verificación antibots para continuar.");
      return;
    }

    setBusy(true);
    try {
      const captchaOptions = captchaToken ? { captchaToken } : {};

      if (screen === "recovery") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setPassword("");
        setNotice("Contraseña actualizada.");
        onPasswordUpdated();
      } else if (screen === "reset") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
          ...captchaOptions,
        });
        if (resetError) throw resetError;
        setNotice("Si la dirección corresponde a una cuenta, recibirás un correo para restablecer la contraseña.");
      } else if (screen === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin,
            ...captchaOptions,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Cuenta creada. Confirma tu correo; después, el equipo de Tangai tendrá que aprobar el acceso.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: captchaOptions,
        });
        if (signInError) throw signInError;
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "No se pudo completar la solicitud.");
    } finally {
      setBusy(false);
      setCaptchaToken("");
      setCaptchaVersion((version) => version + 1);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  return (
    <main className="auth-page">
      <section className="auth-form-side">
        <div className="auth-card">
          <Brand />
          {screen === "recovery" && notice === "Contraseña actualizada." ? (
            <div className="approval-state">
              <span className="approval-icon"><CheckCircle2 size={26} /></span>
              <h2>Contraseña actualizada</h2>
              <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <h2>
                  {screen === "recovery" ? "Nueva contraseña" :
                    screen === "reset" ? "Restablecer contraseña" :
                      screen === "signup" ? "Crear cuenta" : "Iniciar sesión"}
                </h2>
              </div>
              {!recoveryRequested && screen !== "reset" && (
                <div className="auth-tabs" role="tablist" aria-label="Tipo de acceso">
                  <button
                    className={screen === "login" ? "selected" : ""}
                    onClick={() => changeMode("login")}
                    type="button"
                    role="tab"
                    aria-selected={screen === "login"}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className={screen === "signup" ? "selected" : ""}
                    onClick={() => changeMode("signup")}
                    type="button"
                    role="tab"
                    aria-selected={screen === "signup"}
                  >
                    Crear cuenta
                  </button>
                </div>
              )}
              <form className="auth-fields" onSubmit={handleSubmit}>
                {screen === "signup" && (
                  <label>Nombre y apellidos
                    <input
                      autoComplete="name"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Tu nombre"
                      required
                      value={name}
                    />
                  </label>
                )}
                {(screen === "login" || screen === "signup" || screen === "reset") && (
                  <label>Correo electrónico
                    <input
                      autoComplete="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nombre@ejemplo.com"
                      required
                      type="email"
                      value={email}
                    />
                  </label>
                )}
                {screen !== "reset" && (
                  <label>{screen === "recovery" ? "Nueva contraseña" : "Contraseña"}
                    <input
                      autoComplete={screen === "login" ? "current-password" : "new-password"}
                      minLength={8}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Al menos 8 caracteres"
                      required
                      type="password"
                      value={password}
                    />
                  </label>
                )}
                {screen === "login" && (
                  <button className="forgot-link" onClick={() => changeMode("reset")} type="button">
                    ¿Has olvidado tu contraseña?
                  </button>
                )}
                <TurnstileCaptcha
                  key={captchaVersion}
                  onError={setError}
                  onToken={setCaptchaToken}
                  siteKey={captchaSiteKey}
                />
                {error && <p className="auth-notice" role="alert">{error}</p>}
                {notice && <p className="auth-notice" role="status">{notice}</p>}
                <button className="primary-button full-button" disabled={busy} type="submit">
                  {busy ? "Un momento…" :
                    screen === "signup" ? "Crear cuenta" :
                      screen === "reset" ? "Enviar enlace" :
                        screen === "recovery" ? "Guardar contraseña" : "Iniciar sesión"}
                  {!busy && <ArrowRight size={17} />}
                </button>
              </form>
              {screen === "login" && (
                <>
                  <div className="auth-divider"><span /> o <span /></div>
                  <button className="demo-button" onClick={onEnterDemo} type="button">
                    Entrar en modo demostración <ArrowRight size={15} />
                  </button>
                </>
              )}
              {screen === "reset" && (
                <button className="forgot-link auth-back-link" onClick={() => changeMode("login")} type="button">
                  Volver al inicio de sesión
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
