import { ArrowUp, ArrowDown } from "lucide-react";

export type DeltaProps = {
  dir: "up" | "down";
  value: string;
  color: string;
};

export function Delta({ dir, value, color }: DeltaProps) {
  const Icon = dir === "up" ? ArrowUp : ArrowDown;
  return (
    <span
      className="inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-semibold"
      style={{ color }}
    >
      <Icon size={12} strokeWidth={2.6} /> {value}
    </span>
  );
}
