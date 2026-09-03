import { useState } from "react";
import { Tag, Moon, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { moodFaces, moodLabels } from "@/lib/mood";
import { tagPalette } from "./data";
import type { JournalEntry, Mood } from "./types";

const card = "rounded-2xl border border-border bg-card p-[18px]";

type JournalProps = {
  journal: JournalEntry[];
  addEntry: (text: string, mood: Mood, tags?: string[]) => void;
};

export function Journal({ journal, addEntry }: JournalProps) {
  const { notify } = useToast();
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood>(4);
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (t: string) =>
    setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));

  const publish = () => {
    if (!text.trim()) return;
    addEntry(text.trim(), mood, tags);
    setText("");
    setTags([]);
    notify("Đã thêm ghi chú ✓");
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* Composer */}
      <div className={card}>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight">Ghi chú mới</span>
          <span className="text-[12.5px] text-muted-foreground">31/08/2026</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hôm nay đã xảy ra chuyện gì? Bạn cảm thấy ra sao?"
          className="mb-2.5 min-h-[92px] w-full resize-y rounded-xl border-[1.5px] border-border bg-transparent px-3.5 py-3 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-primary"
        />
        <div className="mb-3 flex gap-1.5">
          {moodFaces.map((f, i) => (
            <button
              key={i}
              onClick={() => setMood((i + 1) as Mood)}
              className={
                "h-9 w-9 rounded-[10px] border-[1.5px] text-lg transition-colors " +
                (mood === i + 1 ? "border-violet-500 bg-violet-500/10" : "border-border grayscale-[0.5]")
              }
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-[7px]">
          {tagPalette.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={
                "inline-flex items-center gap-1 rounded-full border px-[9px] py-1 text-[11.5px] font-semibold transition-colors " +
                (tags.includes(t)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-[#2a3752]")
              }
            >
              <Tag size={11} /> {t}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={publish}><Plus size={16} /> Thêm ghi chú</Button>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-4">
        {journal.map((e) => (
          <div key={e.id} className={card}>
            <div className="mb-2.5 flex items-center gap-[11px]">
              <span className="text-2xl">{moodFaces[e.mood - 1]}</span>
              <span className="text-sm font-bold">{e.date}</span>
              <span className="ml-auto rounded-full bg-accent px-[9px] py-[3px] text-[11.5px] font-semibold text-muted-foreground">
                {moodLabels[e.mood - 1]}
              </span>
            </div>
            <p className="mb-3 text-[13.5px] leading-relaxed">{e.text}</p>
            {e.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-[7px]">
                {e.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-[9px] py-1 text-[11.5px] font-semibold text-muted-foreground">
                    <Tag size={11} /> {t}
                  </span>
                ))}
              </div>
            )}
            {(e.sleep || e.exercise) && (
              <div className="flex gap-4 border-t border-border pt-3">
                {e.sleep && <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Moon size={13} /> {e.sleep}</span>}
                {e.exercise && <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Dumbbell size={13} /> {e.exercise}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
