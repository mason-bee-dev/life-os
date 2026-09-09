import { Check, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CriterionLevel,
  SleepEvaluation,
} from "./sleepEvaluation";

type Props = {
  evaluation: SleepEvaluation;
  title: string;
};

const verdictStyles: Record<
  "good" | "ok" | "attention",
  { badge: string; border: string }
> = {
  good: {
    badge: "bg-primary/10 text-primary border-primary/30",
    border: "border-l-primary",
  },
  ok: {
    badge:
      "bg-[color:var(--score-good)]/10 text-[color:var(--score-good)] border-[color:var(--score-good)]/30",
    border: "border-l-[color:var(--score-good)]",
  },
  attention: {
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    border: "border-l-destructive",
  },
};

const levelDot: Record<CriterionLevel, string> = {
  good: "bg-primary",
  ok: "bg-[color:var(--score-good)]",
  attention: "bg-destructive",
  unknown: "bg-faint",
};

export function SleepEvaluationBox({ evaluation, title }: Props) {
  if (evaluation.allGood) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-[13px] text-muted-foreground">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
        <span>
          <span className="font-medium text-foreground">{title}</span>
          {" — "}
          {evaluation.periodLabel} ổn
          {evaluation.score != null ? (
            <span className="tabular-nums"> · {evaluation.score}/100</span>
          ) : null}
        </span>
      </div>
    );
  }

  const styles = verdictStyles[evaluation.verdict];
  const visibleCriteria = evaluation.criteria.filter(
    (c) => c.level !== "unknown",
  );

  return (
    <div
      className={cn(
        "rounded-2xl border border-border border-l-[3px] bg-card p-4 md:p-5",
        styles.border,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold tracking-tight">
            {title}
          </div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            Đánh giá {evaluation.periodLabel}
            {evaluation.score != null ? (
              <span className="tabular-nums">
                {" "}
                · {evaluation.score}/100
              </span>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "rounded-lg border px-2.5 py-1 text-[12px] font-semibold",
            styles.badge,
          )}
        >
          {evaluation.verdictLabel}
        </span>
      </div>

      {visibleCriteria.length > 0 ? (
        <ul className="mt-3.5 flex flex-col gap-2">
          {visibleCriteria.map((c) => (
            <li key={c.key} className="flex gap-2.5 text-[13px] leading-snug">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  levelDot[c.level],
                )}
                aria-hidden
              />
              <span>
                <span className="font-medium text-foreground">{c.label}:</span>{" "}
                <span className="text-muted-foreground">{c.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {evaluation.tips.length > 0 ? (
        <div className="mt-3.5 flex flex-col gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-[13px] text-muted-foreground">
          {evaluation.tips.map((tip) => (
            <div key={tip} className="flex gap-2">
              <Lightbulb
                className="mt-0.5 size-3.5 shrink-0 text-primary"
                strokeWidth={2}
              />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      ) : null}

      {evaluation.disclaimer ? (
        <p className="mt-2.5 text-[12px] text-faint">{evaluation.disclaimer}</p>
      ) : null}
    </div>
  );
}
