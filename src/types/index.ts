export type AppRole = "member" | "staff" | "admin";

export type Activity = {
  id: string;
  title: string;
  detail: string;
  date: string;
  points: number;
  kind: "donation" | "redeem";
};
