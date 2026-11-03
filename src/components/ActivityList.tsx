import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Activity } from "../types";

type ActivityListProps = {
  activities: Activity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div>
          <h2>Actividad reciente</h2>
        </div>
      </div>
      <div className="activity-list">
        {activities.length === 0 && <p className="empty-state">Todavía no hay movimientos.</p>}
        {activities.map((activity) => {
          const donation = activity.kind === "donation";
          const Icon = donation ? ArrowDownLeft : ArrowUpRight;
          return (
            <article className="activity-row" key={activity.id}>
              <span className={`activity-icon ${donation ? "icon-in" : "icon-out"}`}>
                <Icon size={17} strokeWidth={2.2} />
              </span>
              <div className="activity-copy">
                <strong>{activity.title}</strong>
                <span>{activity.detail}</span>
                <span>{activity.date}</span>
              </div>
              <strong className={`activity-points ${donation ? "positive" : ""}`}>
                {donation ? "+" : "−"}{Math.abs(activity.points).toLocaleString("es-ES")} pts
              </strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}
