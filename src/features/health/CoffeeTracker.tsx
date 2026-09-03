import { useState } from "react";
import { Coffee, Minus, Plus, X } from "lucide-react";
import { useDailyRecords } from "./useDailyRecords";
import { PeriodTabs } from "./PeriodTabs";
import { StatBar } from "./StatBar";
import {
  recordsInPeriod, sumCoffeeCups, mostCommonCoffeeType, toDailySeries,
} from "./stats";
import type { CoffeeType, CoffeeLog, Period } from "./types";

const PRESETS: CoffeeType[] = [
  "Đen", "Sữa", "Espresso", "Cappuccino", "Latte", "Americano", "Bạc xỉu", "Cà phê muối", "Khác",
];

export function CoffeeTracker() {
  const { records, todayKey, getRecord, updateRecord } = useDailyRecords();
  const todayRecord = getRecord(todayKey);
  const coffeeList = todayRecord.coffee ?? [];

  const [selectedType, setSelectedType] = useState<CoffeeType>("Đen");
  const [customType, setCustomType] = useState("");
  const [cups, setCups] = useState(1);
  const [period, setPeriod] = useState<Period>("week");

  const addLog = () => {
    const log: CoffeeLog = {
      id: Date.now(),
      type: selectedType,
      ...(selectedType === "Khác" && customType ? { customType } : {}),
      cups,
    };
    updateRecord(todayKey, { coffee: [...coffeeList, log] });
    setCups(1);
    setCustomType("");
  };

  const removeLog = (id: number) => {
    updateRecord(todayKey, { coffee: coffeeList.filter((c) => c.id !== id) });
  };

  const list = recordsInPeriod(records, period, todayKey);
  const totalCups = sumCoffeeCups(list);
  const topType = mostCommonCoffeeType(list);
  const series = toDailySeries(list, (r) =>
    (r.coffee ?? []).reduce((s, c) => s + c.cups, 0),
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-[9px]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg text-amber-400" style={{ background: "#f59e0b20" }}>
          <Coffee size={15} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Cà phê</span>
      </div>

      {/* Type selector */}
      <div className="mb-3 flex flex-wrap gap-[6px]">
        {PRESETS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={
              "rounded-lg border px-2.5 py-[5px] text-[12.5px] font-semibold transition-colors " +
              (selectedType === t
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-border text-muted-foreground hover:border-amber-500")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {selectedType === "Khác" && (
        <input
          value={customType}
          onChange={(e) => setCustomType(e.target.value)}
          placeholder="Tên loại cà phê…"
          className="mb-3 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-primary"
        />
      )}

      {/* Cups stepper + add */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCups((c) => Math.max(1, c - 1))}
            className="grid h-[36px] w-[36px] place-items-center rounded-xl border-[1.5px] border-border hover:border-primary hover:text-primary"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-[40px] text-center text-lg font-bold">{cups}</span>
          <button
            onClick={() => setCups((c) => c + 1)}
            className="grid h-[36px] w-[36px] place-items-center rounded-xl border-[1.5px] border-border hover:border-primary hover:text-primary"
          >
            <Plus size={14} />
          </button>
          <span className="text-[12.5px] text-muted-foreground">cốc</span>
        </div>
        <button
          onClick={addLog}
          className="rounded-lg bg-primary px-4 py-[7px] text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Thêm
        </button>
      </div>

      {/* Today's logs */}
      {coffeeList.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5">
          {coffeeList.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px]">
              <span className="flex-1">
                {c.type === "Khác" ? (c.customType || "Khác") : c.type} · {c.cups} cốc
              </span>
              <button onClick={() => removeLog(c.id)} className="text-faint hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-muted-foreground">Thống kê</span>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        <div className="mb-3 flex gap-6 text-[13px]">
          <span>Tổng: <b className="font-bold">{totalCups} cốc</b></span>
          {topType && <span>Hay uống nhất: <b className="font-bold">{topType}</b></span>}
        </div>
        <StatBar data={series} color="#f59e0b" />
      </div>
    </div>
  );
}
