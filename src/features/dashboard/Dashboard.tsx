import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CircleHelp,
  Clock3,
  Coffee,
  Gift,
  Heart,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import ActivityList from "../../components/ActivityList";
import StatusPill from "../../components/StatusPill";
import { walletApi } from "../../api";
import type { Activity, AppRole } from "../../types";

type DashboardProps = {
  role: AppRole;
};

export default function Dashboard({ role }: DashboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const isMember = role === "member";
  const heading = isMember ? "Tu comunidad, tu cartera." : role === "admin" ? "Todo en orden, Marina." : "Hola, Marina.";
  const today = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date()).toLocaleUpperCase("es-ES");

  useEffect(() => {
    void walletApi.getRecentActivities().then(setActivities);
  }, []);

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="welcome-overline"><span className="live-dot" /> {today}</div>
          <h1>{heading}</h1>
          <p>{isMember ? "Cada aportación suma. Gracias por formar parte de Tangai." : "Aquí tienes el pulso de la asociación hoy."}</p>
        </div>
        <button className="outline-button" type="button"><CircleHelp size={16} /> ¿Cómo funciona?</button>
      </div>

      {!isMember && (
        <section className="staff-banner">
          <div className="staff-banner-icon"><Sparkles size={19} /></div>
          <div><strong>Panel de operaciones</strong><span>Registra aportaciones o valida vales de forma presencial.</span></div>
          <StatusPill tone="amber">Vista de demostración</StatusPill>
        </section>
      )}

      <section className="dashboard-grid">
        <div className="balance-card">
          <div className="balance-card-top">
            <div className="balance-label"><span className="balance-icon"><Wallet size={16} /></span> SALDO DISPONIBLE</div>
            <span className="card-period">Actualizado ahora</span>
          </div>
          <div className="balance-main"><strong>2.450</strong><span>pts</span></div>
          <p className="balance-caption">Equivalentes a <strong>24,50 €</strong> en aportaciones</p>
          <div className="balance-card-bottom">
            <span><span className="balance-dot" /> 100 puntos por cada 1 € aportado</span>
            <button className="balance-link" type="button">{isMember ? "Ver movimientos" : "Registrar donación"} <ArrowRight size={15} /></button>
          </div>
          <div className="balance-decoration" aria-hidden="true">t.</div>
        </div>
        <div className="reward-card">
          <div className="reward-top"><div className="reward-icon"><Coffee size={18} /></div><span className="reward-tag">EN LA BARRA</span></div>
          <p className="eyebrow">UN PEQUEÑO CAPRICHO</p>
          <h2>Tu próximo<br />refresco te espera.</h2>
          <div className="reward-progress-label"><span>Una bebida desde 250 pts</span><strong>2.450 <small>pts</small></strong></div>
          <div className="progress-track"><span style={{ width: "100%" }} /></div>
          <button className="reward-link" type="button">Ver refrescos disponibles <ArrowUpRight size={15} /></button>
          <div className="reward-watermark"><Gift size={76} strokeWidth={0.75} /></div>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-icon stat-green"><ArrowDownLeft size={18} /></span>
          <div><span className="stat-label">Aportaciones totales</span><strong>245,00 €</strong><span className="stat-note">Desde que formas parte de Tangai</span></div>
          <span className="stat-corner">↗</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-purple"><Gift size={18} /></span>
          <div><span className="stat-label">Refrescos disfrutados</span><strong>8 <small>este año</small></strong><span className="stat-note">Pequeños momentos compartidos</span></div>
          <span className="stat-corner">↗</span>
        </article>
        <article className="stat-card community-card">
          <span className="stat-icon stat-orange"><Heart size={18} /></span>
          <div><span className="stat-label">Tu vínculo con Tangai</span><strong>Desde 2022</strong><span className="stat-note">¡Gracias por estar aquí!</span></div>
          <span className="stat-corner">✳</span>
        </article>
      </section>

      <div className="lower-grid">
        <ActivityList activities={activities} />
        <aside className="panel next-step-panel">
          <div className="panel-heading"><div><p className="eyebrow">FÁCIL Y PRESENCIAL</p><h2>¿Cómo sumar puntos?</h2></div><span className="question-mark">?</span></div>
          <p className="next-step-copy">Haz tu aportación en la barra y el equipo te dará un código QR para acreditar tus puntos.</p>
          <div className="step-list">
            <div className="step-row"><span>01</span><div><strong>Aporta en la barra</strong><small>En efectivo o con tarjeta</small></div><ArrowDownLeft size={16} /></div>
            <div className="step-row"><span>02</span><div><strong>Escanea tu código</strong><small>Tienes 5 minutos para hacerlo</small></div><Clock3 size={16} /></div>
            <div className="step-row"><span>03</span><div><strong>Disfruta tus puntos</strong><small>100 puntos por cada euro</small></div><Gift size={16} /></div>
          </div>
          <div className="help-note"><Plus size={14} /> <span>El personal de la asociación puede ayudarte en cualquier momento.</span></div>
        </aside>
      </div>
      <div className="demo-footnote"><span><span className="footnote-dot" /> DATOS DE DEMOSTRACIÓN</span><span>El saldo y la actividad mostrados son ejemplos y no reflejan datos reales.</span></div>
    </>
  );
}
