import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

function digitsOnly(raw: string, maxLen: number): string {
  return raw.replace(/\D/g, "").slice(0, maxLen);
}

function clampHour(raw: string): string {
  if (!raw) return "";
  if (raw.length === 1) return raw;
  const n = Math.min(23, Number(raw));
  if (!Number.isFinite(n)) return "";
  return String(n).padStart(2, "0");
}

function clampMinute(raw: string): string {
  if (!raw) return "";
  if (raw.length === 1) return raw;
  const n = Math.min(59, Number(raw));
  if (!Number.isFinite(n)) return "";
  return String(n).padStart(2, "0");
}

function toHhMm(hours: string, minutes: string): string | null {
  if (hours.length !== 2 || minutes.length !== 2) return null;
  const h = Number(hours);
  const m = Number(minutes);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${hours}:${minutes}`;
}

function splitValue(value: string | null | undefined): {
  hours: string;
  minutes: string;
} {
  if (!value) return { hours: "", minutes: "" };
  const [h = "", m = ""] = value.split(":");
  return { hours: h.slice(0, 2), minutes: m.slice(0, 2) };
}

type Parts = { hours: string; minutes: string };

type Props = {
  value: string | null;
  onChange: (v: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  onBlurComplete?: () => void;
};

/**
 * Reusable HH:mm input with a fixed `:` separator.
 * One tab stop (hours); minutes are reached by typing or arrows.
 */
export function TimeInput({
  value,
  onChange,
  id,
  className,
  disabled,
  onBlurComplete,
}: Props) {
  const autoId = useId();
  const hourId = id ?? `${autoId}-hour`;
  const minuteId = `${autoId}-minute`;

  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const partsRef = useRef<Parts>(splitValue(value));

  const [parts, setPartsState] = useState<Parts>(() => splitValue(value));

  const setParts = (next: Parts) => {
    partsRef.current = next;
    setPartsState(next);
  };

  useEffect(() => {
    const next = splitValue(value);
    partsRef.current = next;
    setPartsState(next);
  }, [value]);

  const emit = (hours: string, minutes: string) => {
    const hhmm = toHhMm(hours, minutes);
    if (hhmm) onChange(hhmm);
  };

  const commit = (nextHours: string, nextMinutes: string) => {
    const hours =
      nextHours.length === 2 ? clampHour(nextHours) : nextHours;
    const minutes =
      nextMinutes.length === 2 ? clampMinute(nextMinutes) : nextMinutes;
    setParts({ hours, minutes });
    emit(hours, minutes);
    return { hours, minutes };
  };

  const focusMinutes = () => {
    const el = minuteRef.current;
    if (!el) return;
    // Defer so React can flush the hour digit before blur/focus churn.
    requestAnimationFrame(() => {
      el.focus();
      el.select();
    });
  };

  const focusHours = (select = true) => {
    const el = hourRef.current;
    if (!el) return;
    el.focus();
    if (select) el.select();
  };

  const applyParsed = (raw: string) => {
    const cleaned = raw.trim().replace(".", ":").replace(/\s/g, "");
    let h = "";
    let m = "";
    if (/^\d{1,2}:\d{1,2}$/.test(cleaned)) {
      const [hs, ms] = cleaned.split(":");
      h = clampHour(digitsOnly(hs, 2).padStart(2, "0"));
      m = clampMinute(digitsOnly(ms, 2).padStart(2, "0"));
    } else {
      const d = digitsOnly(cleaned, 4);
      if (d.length >= 3) {
        h = clampHour(d.slice(0, d.length - 2).padStart(2, "0"));
        m = clampMinute(d.slice(-2));
      } else if (d.length > 0) {
        h = digitsOnly(d, 2);
      }
    }
    commit(h, m);
    if (h.length === 2) focusMinutes();
  };

  const onHourChange = (raw: string) => {
    const { minutes } = partsRef.current;
    if (raw.includes(":") || raw.includes(".")) {
      const d = digitsOnly(raw, 2);
      commit(d.length === 1 ? d.padStart(2, "0") : clampHour(d), minutes);
      focusMinutes();
      return;
    }
    const d = digitsOnly(raw, 2);
    if (d.length === 1 && Number(d) >= 3) {
      commit(d.padStart(2, "0"), minutes);
      focusMinutes();
      return;
    }
    commit(d, minutes);
    if (d.length === 2) focusMinutes();
  };

  const onMinuteChange = (raw: string) => {
    const { hours } = partsRef.current;
    const d = digitsOnly(raw, 2);
    if (d.length === 1 && Number(d) >= 6) {
      commit(hours, d.padStart(2, "0"));
      return;
    }
    commit(hours, d);
  };

  const onHourKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ":" || e.key === "." || e.key === "ArrowRight") {
      const input = e.currentTarget;
      if (
        e.key !== "ArrowRight" ||
        input.selectionStart === input.value.length
      ) {
        e.preventDefault();
        const { hours, minutes } = partsRef.current;
        if (hours.length === 1) commit(hours.padStart(2, "0"), minutes);
        focusMinutes();
      }
    }
  };

  const onMinuteKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !partsRef.current.minutes) {
      e.preventDefault();
      focusHours(false);
      const el = hourRef.current;
      if (el) {
        const len = el.value.length;
        requestAnimationFrame(() => el.setSelectionRange(len, len));
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      const input = e.currentTarget;
      if (input.selectionStart === 0 && input.selectionEnd === 0) {
        e.preventDefault();
        focusHours(false);
        const el = hourRef.current;
        if (el) {
          const len = el.value.length;
          requestAnimationFrame(() => el.setSelectionRange(len, len));
        }
      }
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    applyParsed(text);
  };

  /** Normalize only when focus leaves the whole control (not hour ↔ minute). */
  const onSegmentBlur = (e: FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && containerRef.current?.contains(next)) return;

    let { hours, minutes } = partsRef.current;
    if (hours.length === 1) hours = hours.padStart(2, "0");
    if (minutes.length === 1) minutes = minutes.padStart(2, "0");
    hours = hours ? clampHour(hours) : hours;
    minutes = minutes ? clampMinute(minutes) : minutes;
    commit(hours, minutes);
    onBlurComplete?.();
  };

  const segmentClass = cn(
    "h-9 w-10 rounded-md border-0 bg-transparent px-0 text-center text-body tabular-nums shadow-none",
    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-input bg-transparent px-2 shadow-sm transition-colors",
        "focus-within:ring-1 focus-within:ring-ring",
        disabled && "opacity-50",
        className,
      )}
    >
      <input
        ref={hourRef}
        id={hourId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        aria-label="Giờ"
        placeholder="HH"
        maxLength={2}
        value={parts.hours}
        onChange={(e) => onHourChange(e.target.value)}
        onKeyDown={onHourKeyDown}
        onPaste={onPaste}
        onBlur={onSegmentBlur}
        className={segmentClass}
      />
      <span
        aria-hidden
        className="select-none px-0.5 text-body font-medium text-muted-foreground"
      >
        :
      </span>
      <input
        ref={minuteRef}
        id={minuteId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        aria-label="Phút"
        placeholder="mm"
        maxLength={2}
        tabIndex={-1}
        value={parts.minutes}
        onChange={(e) => onMinuteChange(e.target.value)}
        onKeyDown={onMinuteKeyDown}
        onPaste={onPaste}
        onBlur={onSegmentBlur}
        className={segmentClass}
      />
    </div>
  );
}
