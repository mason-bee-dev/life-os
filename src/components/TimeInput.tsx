import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
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

type Props = {
  value: string | null;
  onChange: (v: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Called when both hour and minute fields blur (useful for forms). */
  onBlurComplete?: () => void;
};

/**
 * Reusable HH:mm input with a fixed `:` separator.
 * Typing 2 hour digits auto-advances the caret into minutes.
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
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const [{ hours, minutes }, setParts] = useState(() => splitValue(value));

  useEffect(() => {
    setParts(splitValue(value));
  }, [value]);

  const commit = (nextHours: string, nextMinutes: string) => {
    const normalizedH =
      nextHours.length === 2 ? clampHour(nextHours) : nextHours;
    const normalizedM =
      nextMinutes.length === 2 ? clampMinute(nextMinutes) : nextMinutes;
    setParts({ hours: normalizedH, minutes: normalizedM });
    const hhmm = toHhMm(normalizedH, normalizedM);
    if (hhmm) onChange(hhmm);
  };

  const focusMinutes = (select = true) => {
    const el = minuteRef.current;
    if (!el) return;
    el.focus();
    if (select) el.select();
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
    // Colon / separator typed → jump to minutes
    if (raw.includes(":") || raw.includes(".")) {
      const d = digitsOnly(raw, 2);
      commit(d.length === 1 ? d.padStart(2, "0") : clampHour(d), minutes);
      focusMinutes();
      return;
    }
    const d = digitsOnly(raw, 2);
    // First digit 3–9 → treat as single-digit hour, pad & advance
    if (d.length === 1 && Number(d) >= 3) {
      const padded = d.padStart(2, "0");
      commit(padded, minutes);
      focusMinutes();
      return;
    }
    commit(d, minutes);
    if (d.length === 2) focusMinutes();
  };

  const onMinuteChange = (raw: string) => {
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
        if (hours.length === 1) commit(hours.padStart(2, "0"), minutes);
        focusMinutes();
      }
    }
  };

  const onMinuteKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !minutes) {
      e.preventDefault();
      focusHours(false);
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
          el.setSelectionRange(len, len);
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

  const normalizeOnBlur = () => {
    let h = hours;
    let m = minutes;
    if (h.length === 1) h = h.padStart(2, "0");
    if (m.length === 1) m = m.padStart(2, "0");
    h = h ? clampHour(h) : h;
    m = m ? clampMinute(m) : m;
    commit(h, m);
    onBlurComplete?.();
  };

  const segmentClass = cn(
    "h-9 w-10 rounded-md border-0 bg-transparent px-0 text-center text-body tabular-nums shadow-none",
    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <div
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
        value={hours}
        onChange={(e) => onHourChange(e.target.value)}
        onKeyDown={onHourKeyDown}
        onPaste={onPaste}
        onBlur={normalizeOnBlur}
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
        value={minutes}
        onChange={(e) => onMinuteChange(e.target.value)}
        onKeyDown={onMinuteKeyDown}
        onPaste={onPaste}
        onBlur={normalizeOnBlur}
        className={segmentClass}
      />
    </div>
  );
}
