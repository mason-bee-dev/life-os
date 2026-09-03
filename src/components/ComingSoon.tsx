import { Sparkles } from "lucide-react";
import { allNav } from "./Sidebar";
import type { PageId } from "@/types";

export function ComingSoon({ label }: { label: PageId }) {
  const item = allNav.find((n) => n.label === label);
  const Icon = item?.icon ?? Sparkles;
  const labelText = item?.labelVi ?? label;
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 py-20 text-center">
      <div className="mb-[22px] grid h-[72px] w-[72px] place-items-center rounded-[20px] border border-border bg-card text-muted-foreground">
        <Icon size={30} />
      </div>
      <div className="mb-2 text-[22px] font-bold">{labelText}</div>
      <p className="mb-[18px] max-w-[360px] text-sm leading-relaxed text-muted-foreground">
        Mục này đang nằm trong kế hoạch phát triển. Cấu trúc dữ liệu đã sẵn
        sàng — chỉ là giao diện chưa được xây.
      </p>
      <div className="rounded-full bg-primary/10 px-[13px] py-[5px] text-[11.5px] font-bold uppercase tracking-[0.4px] text-primary">
        Sắp ra mắt
      </div>
    </div>
  );
}
