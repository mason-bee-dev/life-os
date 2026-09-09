import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Props = {
  confirming: boolean;
  onEdit?: () => void;
  onAskDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleting?: boolean;
  /** Show "Sửa" label next to pencil (Sleep style). */
  editLabel?: boolean;
  className?: string;
};

/** Right-aligned row actions with red delete + inline confirm. */
export function TableActionsCell({
  confirming,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
  isDeleting,
  editLabel = false,
  className,
}: Props) {
  return (
    <TableCell className={cn("text-right", className)}>
      {confirming ? (
        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirmDelete}
          >
            Xác nhận
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancelDelete}
          >
            Huỷ
          </Button>
        </div>
      ) : (
        <div className="inline-flex items-center justify-end gap-1">
          {onEdit ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              aria-label="Sửa"
              onClick={onEdit}
            >
              <Pencil className="size-3.5" />
              {editLabel ? "Sửa" : null}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Xoá"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onAskDelete}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      )}
    </TableCell>
  );
}

/** Class for actions column header — stick to the right. */
export const ACTIONS_COLUMN_CLASS =
  "w-[1%] whitespace-nowrap text-right";
