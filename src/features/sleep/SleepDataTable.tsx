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
import { PAGE_SIZE } from "./types";

type Props<T> = {
  rows: T[];
  rowKey: (row: T) => string;
  columns: { key: string; header: string; className?: string }[];
  renderRow: (row: T) => ReactNode;
  empty: ReactNode;
};

export function SleepDataTable<T>({
  rows,
  rowKey,
  columns,
  renderRow,
  empty,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  if (!rows.length) return <>{empty}</>;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{pageRows.map((row) => (
          <TableRow key={rowKey(row)}>{renderRow(row)}</TableRow>
        ))}</TableBody>
      </Table>

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
