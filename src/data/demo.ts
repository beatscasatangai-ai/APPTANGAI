import type { Activity, AppRole } from "../types";

export const demoActivities: Activity[] = [
  {
    id: "1",
    title: "Donación acreditada",
    detail: "Aportación en barra · 10,00 €",
    date: "Hoy, 11:42",
    points: 1000,
    kind: "donation",
  },
  {
    id: "2",
    title: "Refresco canjeado",
    detail: "Agua con gas",
    date: "Ayer, 19:18",
    points: -250,
    kind: "redeem",
  },
  {
    id: "3",
    title: "Donación acreditada",
    detail: "Aportación en barra · 5,00 €",
    date: "12 oct, 18:05",
    points: 500,
    kind: "donation",
  },
];

export const roleNames: Record<AppRole, string> = {
  member: "Socio",
  staff: "Personal",
  admin: "Administración",
};
