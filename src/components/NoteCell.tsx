import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Props = {
  note?: string | null;
  className?: string;
  maxLen?: number;
};

/** Truncated note cell with tooltip for full text. */
export function NoteCell({ note, className, maxLen = 40 }: Props) {
  const raw = note?.trim() ?? "";
  const truncated =
    raw.length > maxLen ? `${raw.slice(0, maxLen)}…` : raw || "—";

  return (
    <TableCell className={cn("max-w-[12rem]", className)}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block truncate">{truncated}</span>
          </TooltipTrigger>
          {raw ? (
            <TooltipContent className="max-w-xs">{raw}</TooltipContent>
          ) : null}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
}
