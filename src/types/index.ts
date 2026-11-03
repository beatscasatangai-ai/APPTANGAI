export type AppRole = "member" | "staff" | "admin";

export type NavigationItem = {
  id: string;
  label: string;
};

export type Activity = {
  id: string;
  title: string;
  detail: string;
  date: string;
  points: number;
  kind: "donation" | "redeem";
};
