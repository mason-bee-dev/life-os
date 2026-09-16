import dayjs from "dayjs";

/** Format a logged-at timestamptz for tracker tables (`HH:mm`), or em dash. */
export function formatLoggedAt(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  return d.format("HH:mm");
}
