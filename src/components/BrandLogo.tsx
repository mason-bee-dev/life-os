import { LogoMark } from "@/components/LogoMark";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  markClassName?: string;
};

export function BrandLogo({
  size = 34,
  className,
  markClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <LogoMark size={size} className={markClassName} />
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <div className="truncate text-[17px] font-bold leading-none tracking-[-0.02em] text-foreground">
          Life OS
        </div>
        <div className="hidden truncate text-[12px] leading-none tracking-[0.01em] text-muted-foreground lg:block">
          Enjoy your life
        </div>
      </div>
    </div>
  );
}
