import { ArrowRight, CheckCircle2, ChevronLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import Brand from "../../components/Brand";

type AuthScreenProps = {
  onEnterDemo: () => void;
};

export default function AuthScreen({ onEnterDemo }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitted, setSubmitted] = useState(false);
  const [loginNotice, setLoginNotice] = useState(false);

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-story-top"><Brand /><span>UNA COMUNIDAD, MÁS CERCA</span></div>
        <div className="story-content">
          <div className="story-kicker"><Sparkles size={14} /> La vida de la asociación, en tu bolsillo</div>
          <h1>Lo que compartimos<br />nos <em>hace comunidad.</em></h1>
          <p>Tu cartera Tangai reúne tus aportaciones y tus consumiciones. Sencillo, transparente y siempre contigo.</p>
          <div className="story-note"><span className="note-dot" /><span>Un espacio para las personas que hacen Tangai.</span></div>
        </div>
        <div className="story-bottom"><span>ASOCIACIÓN TANGAI</span><span>EST. 2012</span></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-top"><button className="back-link" type="button"><ChevronLeft size={16} /> Volver a Tangai</button><span className="secure-label"><span /> Acceso seguro</span></div>
        <div className="auth-card">
          {submitted ? (
            <div className="approval-state">
              <span className="approval-icon"><CheckCircle2 size={26} /></span>
              <p className="eyebrow">SOLICITUD ENVIADA</p>
              <h2>Ya casi estás en casa.</h2>
              <p>El equipo de Tangai revisará tu solicitud. Te avisaremos cuando tu cuenta esté aprobada.</p>
              <button className="primary-button full-button" onClick={() => setSubmitted(false)} type="button">Entendido</button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <p className="eyebrow">{mode === "login" ? "QUÉ BUENO VERTE" : "HAZTE SOCIO/A"}</p>
                <h2>{mode === "login" ? "Bienvenido de vuelta." : "Empieza por aquí."}</h2>
                <p>{mode === "login" ? "Accede a tu cartera de la Asociación Tangai." : "Crea tu cuenta. El equipo de Tangai validará tu alta."}</p>
              </div>
              <div className="auth-tabs" role="tablist">
                <button className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setLoginNotice(false); }} type="button" role="tab">Iniciar sesión</button>
                <button className={mode === "signup" ? "selected" : ""} onClick={() => { setMode("signup"); setLoginNotice(false); }} type="button" role="tab">Crear cuenta</button>
              </div>
              <form className="auth-fields" onSubmit={(event) => { event.preventDefault(); if (mode === "signup") setSubmitted(true); else setLoginNotice(true); }}>
                {mode === "signup" && <label>Nombre y apellidos<input autoComplete="name" placeholder="Tu nombre" required /></label>}
                <label>Correo electrónico<input autoComplete="email" placeholder="nombre@ejemplo.com" required type="email" /></label>
                <label>Contraseña<input autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Al menos 8 caracteres" required minLength={8} type="password" /></label>
                {mode === "login" && <button className="forgot-link" type="button">¿Has olvidado tu contraseña?</button>}
                <button className="primary-button full-button" type="submit">{mode === "login" ? "Iniciar sesión" : "Solicitar acceso"}<ArrowRight size={17} /></button>
              </form>
              {loginNotice && <p className="auth-notice" role="status">El inicio de sesión estará disponible cuando se configure Supabase. Mientras tanto, puedes explorar la demostración.</p>}
              <div className="auth-divider"><span /> o <span /></div>
              <button className="demo-button" onClick={onEnterDemo} type="button">Explorar la vista de demostración <ArrowRight size={15} /></button>
              <p className="auth-legal">Al continuar, aceptas las condiciones de uso y la política de privacidad de la asociación.</p>
            </>
          )}
        </div>
        <p className="auth-footer">¿Necesitas ayuda? <a href="mailto:hola@tangai.org">Contacta con la asociación</a></p>
      </section>
    </main>
  );
}
