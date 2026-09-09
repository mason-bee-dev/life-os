import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DAILY_RECORDS_QUERY_KEY } from "@/features/health/useDailyRecords";
import { Button } from "@/components/ui/button";
import type { DailyRecords } from "@/features/health/types";

const STORAGE_KEY = "lifeos:dailyRecords";

function errorMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return err.message;
  }
  return String(err);
}

export function MigrateLocalData() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [okCount, setOkCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [empty, setEmpty] = useState(false);

  const run = async () => {
    setRunning(true);
    setOkCount(null);
    setErrors([]);
    setEmpty(false);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setEmpty(true);
      setRunning(false);
      return;
    }

    let parsed: DailyRecords;
    try {
      parsed = JSON.parse(raw) as DailyRecords;
    } catch {
      setErrors(["Không đọc được dữ liệu localStorage (JSON không hợp lệ)."]);
      setRunning(false);
      return;
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      setErrors(["Dữ liệu localStorage không đúng định dạng DailyRecords."]);
      setRunning(false);
      return;
    }

    const dates = Object.keys(parsed);
    if (dates.length === 0) {
      setEmpty(true);
      setRunning(false);
      return;
    }

    let ok = 0;
    const failed: string[] = [];

    for (const date of dates) {
      const record = parsed[date];
      try {
        const { error: upsertError } = await supabase
          .from("daily_records")
          .upsert({
            date,
            water_glasses: record.waterGlasses ?? null,
            masturbation_count: record.masturbationCount ?? null,
            watched_porn: record.watchedPorn ?? null,
            wp_note: record.wpNote ?? null,
            updated_at: new Date().toISOString(),
          });
        if (upsertError) throw upsertError;

        const { error: delError } = await supabase
          .from("coffee_logs")
          .delete()
          .eq("date", date);
        if (delError) throw delError;

        const drinks = record.drinks ?? record.coffee ?? [];
        if (drinks.length > 0) {
          const { error: insError } = await supabase.from("coffee_logs").insert(
            drinks.map((c) => ({
              date,
              type: c.type,
              custom_type: c.customType ?? null,
              cups: c.cups,
              category: c.category ?? "cafe",
              amount: c.amount ?? 0,
              note: c.note?.trim() ? c.note.trim() : null,
            })),
          );
          if (insError) throw insError;
        }

        ok++;
      } catch (err) {
        failed.push(`${date}: ${errorMessage(err)}`);
      }
    }

    setOkCount(ok);
    setErrors(failed);
    setRunning(false);
    await queryClient.invalidateQueries({ queryKey: DAILY_RECORDS_QUERY_KEY });
  };

  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-5">
      <h2 className="m-0 text-heading tracking-tight">Migrate dữ liệu local</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Đọc <code className="text-foreground">lifeos:dailyRecords</code> từ
        localStorage và ghi vào Supabase. Chạy một lần sau khi schema đã được
        tạo. Trang này sẽ được xoá sau khi xác nhận dữ liệu đúng.
      </p>

      <Button className="mt-5" onClick={run} disabled={running}>
        {running ? "Đang migrate…" : "Bắt đầu migrate"}
      </Button>

      {empty && (
        <p className="mt-4 text-sm text-muted-foreground">
          Không tìm thấy dữ liệu DailyRecords trong localStorage.
        </p>
      )}

      {okCount !== null && (
        <p className="mt-4 text-sm">
          Đã migrate thành công <span className="text-body">{okCount}</span>{" "}
          ngày.
        </p>
      )}

      {errors.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-red-400">Lỗi ({errors.length})</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-400">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
