import {
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import ActivityList from "../../components/ActivityList";
import { walletApi } from "../../api";
import type { Activity, AppRole } from "../../types";

type DashboardProps = {
  role: AppRole;
};

export default function Dashboard({ role }: DashboardProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const isMember = role === "member";

  useEffect(() => {
    void walletApi.getRecentActivities().then(setActivities);
  }, []);

  return (
    <>
      <div className="welcome-row">
        <h1>{isMember ? "Mi monedero" : "Monedero"}</h1>
      </div>

      <section className="balance-card" aria-label="Saldo de demostración">
        <div className="balance-label"><Wallet size={18} /> Saldo de ejemplo</div>
        <div className="balance-main"><strong>2.450</strong><span>pts</span></div>
      </section>
      <div className="lower-grid">
        <ActivityList activities={activities} />
      </div>
    </>
  );
}
