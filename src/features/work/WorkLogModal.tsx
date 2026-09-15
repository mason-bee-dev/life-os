import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  HOUR_CHIPS,
  PROJECT_SUGGESTIONS,
  type WorkCategory,
  type WorkLog,
  type WorkLogInput,
} from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: WorkLogInput) => void;
  isSaving: boolean;
  record?: WorkLog | null;
  defaultDate: string;
  /** Extra project names already used (any category). */
  knownProjects?: string[];
};

export function WorkLogModal({
  open,
  onOpenChange,
  onSave,
  isSaving,
  record,
  defaultDate,
  knownProjects = [],
}: Props) {
  const [date, setDate] = useState<Date | undefined>(
    dayjs(defaultDate).toDate(),
  );
  const [category, setCategory] = useState<WorkCategory>("company");
  const [project, setProject] = useState("");
  const [hours, setHours] = useState<number | null>(null);
  const [customHours, setCustomHours] = useState("");
  const [useCustomHours, setUseCustomHours] = useState(false);
  const [note, setNote] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const editing = Boolean(record);

  useEffect(() => {
    if (!open) return;
    const d = record?.date ?? defaultDate;
    setDate(dayjs(d).toDate());
    setCategory(record?.category ?? "company");
    setProject(record?.project ?? "");
    const h = record?.hours ?? null;
    setHours(h);
    const isChip = h != null && (HOUR_CHIPS as readonly number[]).includes(h);
    setUseCustomHours(h != null && !isChip);
    setCustomHours(h != null && !isChip ? String(h) : "");
    setNote(record?.note ?? "");
    setDatePickerOpen(false);
    setProjectOpen(false);
  }, [open, defaultDate, record]);

  const suggestions = useMemo(() => {
    const base = PROJECT_SUGGESTIONS[category];
    const extra = knownProjects.filter(
      (p) => !base.includes(p) && p.trim().length > 0,
    );
    return [...base, ...extra];
  }, [category, knownProjects]);

  const canSave = project.trim().length > 0 && date != null;

  const resolvedHours = (): number | null => {
    if (useCustomHours) {
      const raw = customHours.trim();
      if (!raw) return null;
      const n = Number(raw.replace(",", "."));
      return Number.isFinite(n) && n >= 0 ? n : null;
    }
    return hours;
  };

  const handleSave = () => {
    if (!date || !project.trim()) return;
    onSave({
      ...(record?.id ? { id: record.id } : {}),
      date: dayjs(date).format("YYYY-MM-DD"),
      category,
      project: project.trim(),
      hours: resolvedHours(),
      note: note.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Sửa log" : "Thêm log"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-1.5">
            <Label>Ngày</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-semibold"
                >
                  <CalendarIcon className="size-3.5" />
                  {date ? dayjs(date).format("DD/MM/YYYY") : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    if (d) setDatePickerOpen(false);
                  }}
                  disabled={{ after: dayjs().endOf("day").toDate() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="text-[13px] text-muted-foreground">Loại</div>
            <div className="flex gap-1">
              {(["company", "personal"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={
                    "rounded-lg border px-2.5 py-1 text-[12.5px] font-semibold transition-colors " +
                    (category === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                  }
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Project</Label>
            <Popover open={projectOpen} onOpenChange={setProjectOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={projectOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className={cn(!project && "text-muted-foreground")}>
                    {project || "Chọn hoặc nhập project…"}
                  </span>
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter>
                  <CommandInput
                    placeholder="Tìm hoặc nhập…"
                    value={project}
                    onValueChange={setProject}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {project.trim()
                        ? `Dùng “${project.trim()}”`
                        : "Không có gợi ý"}
                    </CommandEmpty>
                    <CommandGroup>
                      {suggestions.map((name) => (
                        <CommandItem
                          key={name}
                          value={name}
                          onSelect={(value) => {
                            setProject(value);
                            setProjectOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              project === name ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {project.trim() && !suggestions.includes(project.trim()) ? (
              <p className="text-[12px] text-muted-foreground">
                Sẽ lưu project mới: {project.trim()}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-[13px] text-muted-foreground">Giờ</div>
            <div className="flex flex-wrap gap-2">
              {HOUR_CHIPS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setUseCustomHours(false);
                    setHours((prev) => (prev === h && !useCustomHours ? null : h));
                    setCustomHours("");
                  }}
                  className={
                    "rounded-lg border px-3 py-1.5 text-[13px] font-semibold tabular-nums transition-colors " +
                    (!useCustomHours && hours === h
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                  }
                >
                  {h}h
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setUseCustomHours(true);
                  setHours(null);
                }}
                className={
                  "rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors " +
                  (useCustomHours
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary")
                }
              >
                Khác
              </button>
            </div>
            {useCustomHours ? (
              <input
                type="number"
                min={0}
                step={0.5}
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder="Số giờ…"
                className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm tabular-nums placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            ) : null}
            <p className="text-[12px] text-muted-foreground">
              Có thể để trống giờ.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="work-log-note">Ghi chú</Label>
            <textarea
              id="work-log-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tuỳ chọn…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={isSaving || !canSave}
            onClick={handleSave}
          >
            {isSaving ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
