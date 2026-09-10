import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/** Diamond mark — fills from theme `--primary` / `--primary-foreground`. */
export function LogoMark({ size = 34, className }: LogoMarkProps) {
  const radius = Math.max(8, Math.round(size * 0.29));
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground",
        className,
      )}
      style={{ width: size, height: size, borderRadius: radius }}
      aria-hidden
    >
      {/* Full-box SVG so the diamond stays centered at every size (no nested px rounding). */}
      <svg
        className="block"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 5.25 L18.75 12 L12 18.75 L5.25 12 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
