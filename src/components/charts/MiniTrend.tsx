export function MiniTrend({ color }: { color: string }) {
  return (
    <svg width="52" height="34" viewBox="0 0 52 34" fill="none" className="shrink-0">
      <polyline
        points="2,28 12,22 20,25 30,14 40,17 50,5"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
