import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TimeInput } from "@/components/TimeInput";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (v: string) => void;
  label?: string;
  className?: string;
  id?: string;
};

/** Labeled time field with “now” shortcut — uses reusable TimeInput. */
export function TimeField({ value, onChange, label, className, id }: Props) {
  const setNow = () => onChange(dayjs().format("HH:mm"));

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex items-center gap-1.5">
        <TimeInput
          id={id}
          value={value}
          onChange={onChange}
          className="min-w-[7.5rem] flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          tabIndex={-1}
          title="Bây giờ"
          aria-label="Bây giờ"
          onClick={setNow}
        >
          <Clock className="size-4" />
        </Button>
      </div>
    </div>
  );
}
