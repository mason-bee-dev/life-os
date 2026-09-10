import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/** Diamond mark — fills from theme `--primary` / `--primary-foreground`. */
export function LogoMark({ size = 34, className }: LogoMarkProps) {
  const icon = Math.round(size * (20 / 34));
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] bg-primary text-primary-foreground",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2 L22 12 L12 22 L2 12 Z"
          fill="currentColor"
          fillOpacity="0.95"
        />
      </svg>
    </div>
  );
}
