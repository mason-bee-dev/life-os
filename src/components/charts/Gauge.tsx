export function Gauge({ value }: { value: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="relative mx-auto mt-0.5 h-32 w-32">
      <svg width="128" height="128" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold leading-none tracking-tight">{value}</div>
        <div className="mt-0.5 text-xs text-faint">/100</div>
      </div>
    </div>
  );
}
