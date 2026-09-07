import { Moon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onLog: () => void;
  compact?: boolean;
};

export function SleepEmptyState({ onLog, compact }: Props) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-3 text-center " +
        (compact ? "py-8" : "py-12")
      }
    >
      <Moon className="size-8 text-faint opacity-50" strokeWidth={1.5} />
      <p className="text-[13px] text-muted-foreground">
        Chưa có dữ liệu giấc ngủ trong kỳ này
      </p>
      <Button type="button" size="sm" onClick={onLog}>
        <Plus className="size-3.5" />
        Ghi giấc ngủ đầu tiên
      </Button>
    </div>
  );
}
