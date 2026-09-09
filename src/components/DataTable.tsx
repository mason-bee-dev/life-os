import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACTIONS_COLUMN_CLASS } from "@/components/TableActionsCell";
import { cn } from "@/lib/utils";

export const DEFAULT_PAGE_SIZE = 7;

type Column = {
  key: string;
  header: string;
  className?: string;
};

type Props<T> = {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column[];
  renderRow: (row: T) => ReactNode;
  empty: ReactNode;
  pageSize?: number;
};

/** Paginated data table shell for tracker list views. */
export function DataTable<T>({
  rows,
  rowKey,
  columns,
  renderRow,
  empty,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  if (!rows.length) return <>{empty}</>;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="-mx-1 overflow-x-auto sm:mx-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    col.key === "actions" && ACTIONS_COLUMN_CLASS,
                    col.className,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow key={rowKey(row)}>{renderRow(row)}</TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-[13px] text-muted-foreground">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
              Trước
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
