# Tracker / Habits Page Pattern

Canonical reference: `src/features/sleep` (NightSleepTab + NapTab).

Mục tiêu: mọi trang theo dõi (sleep, coffee, water, habits, …) dùng **cùng bố cục và cùng ngôn ngữ UI**, để user không phải học lại layout mỗi feature, và agent/dev không invent pattern mới.

Khi implement feature mới: copy khung này trước, chỉ thay domain logic. Chỉ lệch pattern khi có lý do rõ (ghi trong PR).

---

## 1. Page anatomy (thứ tự cố định)

```
┌─────────────────────────────────────────────────────────┐
│  [Tabs?]  feature-level (Sleep: đêm | trưa)             │
├─────────────────────────────────────────────────────────┤
│  Toolbar                                                │
│  [Filter / Period]                    [+ Primary CTA]   │
│  Date range caption (muted)                             │
├─────────────────────────────────────────────────────────┤
│  Insight / Evaluation box  (optional)                   │
├─────────────────────────────────────────────────────────┤
│  Stats cards grid                                       │
├─────────────────────────────────────────────────────────┤
│  Chart (optional — week/month trends)                   │
├─────────────────────────────────────────────────────────┤
│  Data table                                             │
│  · columns · row actions · empty state                  │
│  · pagination (khi > PAGE_SIZE)                         │
│  · sort / extra filters (optional)                      │
└─────────────────────────────────────────────────────────┘
│  Create / Edit modal (portal, không nằm trong flow)     │
└─────────────────────────────────────────────────────────┘
```

**Không** đảo thứ tự (ví dụ table trước stats). Insight luôn **trên** stats; stats luôn **trên** chart (nếu có); chart luôn **trên** table.

Vertical rhythm: container `flex flex-col gap-4`.

---

## 2. Toolbar

### Layout

```tsx
<div className="flex flex-wrap items-center justify-between gap-3">
  {/* left: filters */}
  {/* right: primary action */}
</div>
```

- **Trái:** period filter và/hoặc filter khác (status, category…).
- **Phải:** một primary CTA — thêm bản ghi / habit / log.

### Primary action button

- Dùng `Button` từ `@/components/ui/button`.
- Icon `Plus` (`lucide-react`) + label tiếng Việt ngắn: `Thêm giấc ngủ`, `Thêm thói quen`, `Ghi nhận…`.
- Mở modal create (không inline form trên page, trừ quick-log đơn giản như coffee cups).

### Period filter

Chuẩn hiện tại (Sleep / Health):

| Value   | Label  |
|---------|--------|
| `day`   | Ngày   |
| `week`  | Tuần   |
| `month` | Tháng  |
| `year`  | Năm *(chỉ khi domain cần — Sleep chưa dùng)* |

Style active:

```
rounded-lg border px-2.5 py-1 text-[12.5px] font-semibold
active:   border-primary bg-primary/10 text-primary
inactive: border-border text-muted-foreground hover:border-primary hover:text-primary
```

**Debt:** Period filter style is shared via `PeriodFilter`; each feature passes its own `PERIOD_OPTIONS`.

### Date range caption

Ngay dưới toolbar:

```
text-[13px] text-muted-foreground
DD/MM – DD/MM/YYYY
```

Tính từ `periodBounds(refDate, period)`.

---

## 3. Insight / Evaluation box (optional)

Đặt **giữa** caption và stats.

Vai trò: diễn giải (“ổn không?”), không lặp lại số liệu của stats.

| Trạng thái | UI |
|------------|-----|
| Có dữ liệu + có điểm cần chú ý | Box đầy đủ: title, score `xx/100`, badge verdict, bullets tiêu chí, ≤2 tips, disclaimer nếu coverage thấp |
| `allGood` | Collapse 1 dòng ✓ + title + “ổn · score/100” |
| Không có data trong kỳ | **Ẩn** box (không hiện empty insight) |

Reference: `SleepEvaluationBox` + `sleepEvaluation.ts`.

Feature khác có thể reuse pattern (verdict + criteria + tips) hoặc tạm skip cho đến khi có đủ data.

---

## 4. Stats cards

### Container

```
grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-{n} md:gap-4
```

`n` = số card (Sleep đêm: 5 → `xl:grid-cols-5`).

### Card shell

```
rounded-2xl border border-border bg-card p-4 md:p-5
flex flex-col gap-1 min-w-0
```

| Element | Class |
|---------|--------|
| Label   | `text-[12.5px] text-muted-foreground` |
| Value   | `text-[20px] md:text-[22px] font-semibold tabular-nums tracking-tight` |
| Sub     | `text-[13px] tabular-nums text-muted-foreground` (optional) |

Value thiếu → `"—"`, không để trống / `null` trên UI.

### Nội dung

- 3–5 card / tab; tránh >6.
- Chỉ metric **đã aggregate** theo period đang chọn.
- Logic tính tách file `*Stats.ts` / `*stats.ts`, UI chỉ nhận `{ label, value, sub? }[]`.

**Use** `@/components/StatsCards`.

---

## 4b. Chart (optional)

Đặt **sau** stats, **trước** table.

- Hiện cho **tuần / tháng** (hoặc kỳ có nhiều điểm); ẩn ở view ngày nếu không thêm insight.
- Series fill **mọi ngày trong kỳ** (ngày chưa log = cột trống), để thấy gap.
- Shell giống card: `rounded-2xl border border-border bg-card p-4 md:p-5`.
- Tooltip format domain (vd. `7h 15p`, `25 phút`); có thể thêm `ReferenceLine` mốc mục tiêu.
- Reference Sleep: `SleepChart.tsx` + `nightDurationSeries` / `napDurationSeries`.

---

## 5. Data table

### Shell

```
rounded-2xl border border-border bg-card p-4 md:p-5
```

Dùng `@/components/ui/table` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`).

### Columns

Khai báo declarative:

```ts
const columns = [
  { key: "date", header: "Ngày" },
  { key: "duration", header: "Thời lượng" },
  // …
  { key: "actions", header: "Thao tác" },
];
```

- Cột số / giờ: `tabular-nums` trên `TableCell`.
- Cột ngày: dùng `@/components/RelativeDateCell` — format `T2 - 09/09/26`, thêm ` - (Hôm nay)` / ` - (Hôm qua)` khi đúng hôm nay/hôm qua.
- Cột ghi chú dài: dùng `NoteCell` (truncate + `Tooltip`); đặt **trước** cột Thao tác.
- Cột actions: luôn cuối, căn phải — `TableActionsCell` + `key: "actions"` trên `DataTable`.

### Pagination

| Rule | Value |
|------|--------|
| `PAGE_SIZE` | `7` via `DEFAULT_PAGE_SIZE` in `@/components/DataTable` — giữ đồng bộ trừ khi có lý do |
| UI | Chỉ hiện khi `totalPages > 1` |
| Controls | `Trang X / Y` + `Button size="sm" variant="outline"` Trước / Sau + chevron |
| Reset | Đổi filter/period → remount table (`key={\`${tab}-${period}\`}`) hoặc clamp page |

### Sort (optional)

Khi cần:

- Default: date **desc** (mới nhất trên).
- Header clickable hoặc control riêng trên toolbar — đừng sort ngầm không báo.
- Sort **trước** pagination (sort full list, rồi slice page).

### Filter (optional, ngoài period)

- Đặt **trái toolbar**, cạnh period (hoặc hàng filter thứ 2 nếu đông).
- Chip / segmented control cùng style period filter.
- Filter client-side trên list đã load theo period (trừ khi dataset lớn → server filter).

### Empty state

Trong cùng visual language với card (border + `bg-card`):

```
flex flex-col items-center justify-center gap-3 rounded-2xl border … py-12 text-center
icon (muted, opacity-50)
text-[13px] text-muted-foreground
Button size="sm" → cùng CTA “Thêm …”
```

---

## 6. Create / Edit modal

- `Dialog` / modal riêng (`*Modal.tsx`).
- Props tối thiểu: `open`, `onOpenChange`, `onSave`, `isSaving`, `record?` (edit), `defaultDate`.
- Create vs edit: cùng modal; `record` null = create.
- **Ghi chú (note):** mặc định mọi modal thêm/sửa tracker nên có field `Ghi chú` (textarea, optional). Persist theo entity:
  - Log từng dòng (vd. đồ uống / sleep): `note` trên từng log.
  - Bản ghi theo ngày (vd. WP): `wpNote` (hoặc field note riêng của domain) trên daily row.
- Bảng list: cột **Ghi chú** trước **Thao tác**; truncate + tooltip — dùng `@/components/NoteCell`.
- Conflict cùng ngày (nếu domain 1 record/ngày): `window.confirm` hoặc dialog xác nhận ghi đè.
- Toast success/error qua `useToast` — không silent fail.
- Disable submit khi `isSaving`.

### Health tabs (reference)

| Tab | Modal | Note field |
|-----|-------|------------|
| Uống nước | `WaterModal` | *(chưa có — thêm khi cần)* |
| Đồ uống | `DrinkModal` | `DrinkLog.note` → `coffee_logs.note` |
| WP | `WpModal` | `DailyRecord.wpNote` → `daily_records.wp_note` |

---

## 7. File / module layout (per feature)

```
src/features/<domain>/
  <Domain>.tsx              # page shell + tabs (nếu có)
  <Entity>Tab.tsx           # 1 view = toolbar → insight → stats → table
  <Entity>Modal.tsx         # create/edit
  types.ts                  # Period, records, PAGE_SIZE, labels
  api.ts                    # Supabase / persistence
  use<Domain>Data.ts        # compose hooks + period bounds fetch
  use<Domain>Records.ts     # react-query CRUD
  <domain>Stats.ts          # pure aggregates
  <domain>Evaluation.ts     # optional insight scoring
  # shared UI tạm thời nằm trong feature; promote ra shared khi feature thứ 2 copy
```

### Data flow

```
Page → use*Data({ periods })
     → Tab(records, period, todayKey, onSave, onClear)
         → filter/sort rows (useMemo)
         → compute stats + evaluation
         → StatsCards / EvaluationBox / DataTable
         → Modal
```

- `todayKey` = `dayjs().format("YYYY-MM-DD")`.
- `refDate` thường = `todayKey` (period neo vào hôm nay).
- Fetch range bao phủ mọi period đang mở (xem `useSleepData`).

---

## 8. Shared UI checklist

Shared components (extracted from Sleep):

| Component | Path |
|-----------|------|
| Period filter chips | `src/components/PeriodFilter.tsx` |
| Stats grid | `src/components/StatsCards.tsx` |
| Paginated table | `src/components/DataTable.tsx` (`DEFAULT_PAGE_SIZE = 7`) |
| Date cell | `src/components/RelativeDateCell.tsx` — `T2 - 09/09/26` (+ Hôm nay/Hôm qua) |
| Note cell (truncate + tooltip) | `src/components/NoteCell.tsx` |
| Row actions (edit + confirm delete) | `src/components/TableActionsCell.tsx` |
| Evaluation box | `SleepEvaluationBox` — feature-specific; optional generic `InsightBox` later |
| Health chart | `src/features/health/HealthChart.tsx` |

Period options live per-feature (`PERIOD_OPTIONS` in `types.ts`) vì Sleep = 3 kỳ, Health = 4 kỳ (có Năm).

Tokens / spacing dùng CSS variables có sẵn (`--primary`, `--border`, `--card`, `--muted-foreground`, `--score-good`, `--destructive`). Không invent màu feature-specific trừ semantic (vd. coffee amber).

---

## 9. Copy & i18n tone

- UI tiếng Việt, ngắn, không marketing fluff.
- Số luôn `tabular-nums`.
- Empty / error nói rõ hành động tiếp (“Thêm…”, “Thử lại sau”).
- Tip / insight: tối đa 1–2 câu, actionable.

---

## 10. Implementation checklist (feature mới)

1. [ ] `types.ts` — record shape, `Period`, `PAGE_SIZE`
2. [ ] `api` + hooks CRUD + period fetch
3. [ ] Tab shell: toolbar (filter trái + CTA phải) + date caption
4. [ ] Stats pure functions + StatsCards
5. [ ] Table + empty state + pagination
6. [ ] Modal create/edit + toast
7. [ ] (Optional) Evaluation / insight box trên stats
8. [ ] (Optional) Sort, secondary filters
9. [ ] Mobile: `flex-wrap` toolbar, stats `grid-cols-2`, table scroll ngang nếu cần
10. [ ] Không lệch pattern Sleep trừ khi document lý do

---

## 11. Anti-patterns

- Form create dài nằm giữa stats và table
- Stats và table dùng period khác nhau
- Pagination mà không remount/reset khi đổi filter
- Card stats với chart nặng (chart để section riêng hoặc Insights)
- Primary CTA nhiều hơn một (secondary → `variant="outline"` hoặc menu)
- Empty state chỉ chữ, không có nút thêm

---

## Reference map (Sleep)

| Concern | File |
|---------|------|
| Page + tabs | `Sleep.tsx` |
| Tab composition | `NightSleepTab.tsx`, `NapTab.tsx` |
| Period chips | `@/components/PeriodFilter` + `PERIOD_OPTIONS` in `types.ts` |
| Stats UI | `@/components/StatsCards` |
| Stats logic | `sleepStats.ts` |
| Chart | `SleepChart.tsx` + series helpers in `sleepStats.ts` |
| Insight UI | `SleepEvaluationBox.tsx` |
| Insight logic | `sleepEvaluation.ts` |
| Table + paging | `@/components/DataTable` |
| Date highlight | `SleepDateCell.tsx` |
| Modals | `NightSleepModal.tsx`, `NapModal.tsx` |
| Data | `useSleepData.ts`, `useSleepRecords.ts`, `api.ts` |
