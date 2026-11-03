type StatusPillProps = {
  children: string;
  tone?: "green" | "amber" | "slate";
};

export default function StatusPill({
  children,
  tone = "green",
}: StatusPillProps) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}
