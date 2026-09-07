import { useState } from "react";
import dayjs from "dayjs";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SleepEmptyState } from "./SleepEmptyState";
import {
  formatDuration,
  napDuration,
  nightSleepDuration,
} from "./stats";
import { qualityLabels, type SleepQuality, type SleepRecord } from "./types";

const qualityBadge: Record<SleepQuality, string> = {
  kho_ngu: "border-destructive/40 bg-destructive/10 text-destructive",
  binh_thuong: "border-border bg-muted text-muted-foreground",
  ngu_ngon: "border-primary/40 bg-primary/10 text-primary",
};

type Props = {
  records: SleepRecord[];
  onEdit: (date: string) => void;
  onDelete: (id: string) => void;
  onLog: () => void;
  isDeleting?: boolean;
};

export function SleepHistoryTable({
  records,
  onEdit,
  onDelete,
  onLog,
  isDeleting,
}: Props) {
  const rows = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-[13px] font-semibold text-muted-foreground">
        Lịch sử
      </div>
      {!rows.length ? (
        <SleepEmptyState onLog={onLog} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[12.5px] text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Ngày</th>
                <th className="pb-2 pr-3 font-medium">Giờ ngủ → dậy</th>
                <th className="pb-2 pr-3 font-medium">Thời lượng</th>
                <th className="pb-2 pr-3 font-medium">Dậy đêm</th>
                <th className="pb-2 pr-3 font-medium">Trạng thái</th>
                <th className="pb-2 pr-3 font-medium">Ngủ trưa</th>
                <th className="pb-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const night = nightSleepDuration(r);
                const nap = napDuration(r);
                const wakingCount = r.nightWakingTimes.length;
                const confirming = confirmId === r.id;
                return (
                  <tr
                    key={r.id || r.date}
                    onClick={() => onEdit(r.date)}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/40"
                  >
                    <td className="py-2.5 pr-3 tabular-nums">
                      {dayjs(r.date).format("DD/MM/YYYY")}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">
                      {r.bedtime && r.wakeTime
                        ? `${r.bedtime} → ${r.wakeTime}`
                        : "—"}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {night != null ? formatDuration(night) : "—"}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">{wakingCount}</td>
                    <td className="py-2.5 pr-3">
                      {r.quality ? (
                        <Badge
                          variant="outline"
                          className={qualityBadge[r.quality]}
                        >
                          {qualityLabels[r.quality]}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {nap != null ? formatDuration(nap) : "—"}
                    </td>
                    <td
                      className="py-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {confirming ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => {
                              onDelete(r.id);
                              setConfirmId(null);
                            }}
                          >
                            Xác nhận
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmId(null)}
                          >
                            Huỷ
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(r.date)}
                          >
                            <Pencil className="size-3.5" />
                            Sửa
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setConfirmId(r.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
