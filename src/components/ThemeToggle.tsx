import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Chuyển giao diện sáng/tối"
      aria-label="Chuyển giao diện sáng/tối"
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
