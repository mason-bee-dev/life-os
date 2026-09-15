import { useEffect, useMemo, useState } from "react";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { countSegmentsForActivity } from "./api";
import {
  ACTIVITY_ICON_LABELS,
  ACTIVITY_ICON_OPTIONS,
  type Activity,
  type ActivityIconName,
  type ActivityInput,
  GROUPS,
  getActivityIcon,
  groupColor,
  isActivityIconName,
} from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
  isSaving: boolean;
  onCreate: (
    input: ActivityInput,
    opts?: { onSuccess?: () => void; onError?: () => void },
  ) => void;
  onUpdate: (
    args: {
      id: string;
      input: Partial<ActivityInput> & { archived?: boolean };
    },
    opts?: { onSuccess?: () => void; onError?: () => void },
  ) => void;
  onDelete: (
    id: string,
    opts?: { onSuccess?: () => void; onError?: () => void },
  ) => void;
};

type FormState = {
  name: string;
  icon: ActivityIconName;
  color: string;
  groupId: string;
};

const emptyForm = (): FormState => ({
  name: "",
  icon: "Moon",
  color: GROUPS[0].color,
  groupId: GROUPS[0].id,
});

export function ActivityManagerModal({
  open,
  onOpenChange,
  activities,
  isSaving,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const { notify } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(false);
    setConfirmId(null);
  }, [open]);

  const sorted = useMemo(
    () =>
      [...activities].sort((a, b) => {
        if (a.archived !== b.archived) return a.archived ? 1 : -1;
        return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
      }),
    [activities],
  );

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const startEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({
      name: a.name,
      icon: isActivityIconName(a.icon) ? a.icon : "Moon",
      color: a.color,
      groupId: a.groupId,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) return;
    const input: ActivityInput = {
      name,
      icon: form.icon,
      color: form.color,
      groupId: form.groupId,
    };
    if (editingId) {
      onUpdate(
        { id: editingId, input },
        {
          onSuccess: () => {
            notify("Đã cập nhật hoạt động");
            setShowForm(false);
            setEditingId(null);
          },
          onError: () => notify("Không lưu được. Thử lại sau."),
        },
      );
      return;
    }
    onCreate(
      { ...input, sortOrder: activities.length },
      {
        onSuccess: () => {
          notify("Đã thêm hoạt động");
          setShowForm(false);
        },
        onError: () => notify("Không lưu được. Thử lại sau."),
      },
    );
  };

  const handleArchiveOrDelete = async (a: Activity) => {
    try {
      const count = await countSegmentsForActivity(a.id);
      if (count > 0 || a.archived) {
        onUpdate(
          { id: a.id, input: { archived: !a.archived } },
          {
            onSuccess: () => {
              notify(a.archived ? "Đã khôi phục hoạt động" : "Đã lưu trữ hoạt động");
              setConfirmId(null);
            },
            onError: () => notify("Không thực hiện được. Thử lại sau."),
          },
        );
        return;
      }
      onDelete(a.id, {
        onSuccess: () => {
          notify("Đã xoá hoạt động");
          setConfirmId(null);
        },
        onError: () => notify("Không xoá được. Thử lại sau."),
      });
    } catch {
      notify("Không kiểm tra được bản ghi. Thử lại sau.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Quản lý hoạt động</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {!showForm ? (
            <>
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={startCreate}>
                  <Plus className="size-3.5" />
                  Thêm mới
                </Button>
              </div>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {sorted.map((a) => {
                  const Icon = getActivityIcon(a.icon);
                  const color = groupColor(a.groupId);
                  const confirming = confirmId === a.id;
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-md text-white"
                        style={{ backgroundColor: color }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-semibold">
                          {a.name}
                          {a.archived ? (
                            <span className="ml-1.5 text-[12px] font-normal text-muted-foreground">
                              (đã lưu trữ)
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          {GROUPS.find((g) => g.id === a.groupId)?.name ??
                            a.groupId}
                        </div>
                      </div>
                      {confirming ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isSaving}
                            onClick={() => void handleArchiveOrDelete(a)}
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
                        <div className="flex items-center gap-0.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label="Sửa"
                            onClick={() => startEdit(a)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label={a.archived ? "Khôi phục" : "Lưu trữ / Xoá"}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setConfirmId(a.id)}
                          >
                            {a.archived ? (
                              <Archive className="size-3.5" />
                            ) : (
                              <Trash2 className="size-3.5 text-destructive" />
                            )}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
                {sorted.length === 0 ? (
                  <li className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                    Chưa có hoạt động nào.
                  </li>
                ) : null}
              </ul>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="activity-name">Tên</Label>
                <Input
                  id="activity-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ví dụ: Đọc sách"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select
                  value={form.icon}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      icon: v as ActivityIconName,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_ICON_OPTIONS.map((name) => {
                      const Icon = getActivityIcon(name);
                      return (
                        <SelectItem key={name} value={name}>
                          <span className="inline-flex items-center gap-2">
                            <Icon className="size-3.5" />
                            {ACTIVITY_ICON_LABELS[name]}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Nhóm</Label>
                <Select
                  value={form.groupId}
                  onValueChange={(groupId) => {
                    const g = GROUPS.find((x) => x.id === groupId);
                    setForm((f) => ({
                      ...f,
                      groupId,
                      color: g?.color ?? f.color,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUPS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: g.color }}
                          />
                          {g.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="activity-color">Màu</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="activity-color"
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="font-mono tabular-nums"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Huỷ
                </Button>
                <Button
                  type="button"
                  disabled={isSaving || !form.name.trim()}
                  onClick={handleSave}
                >
                  {isSaving ? "Đang lưu…" : "Lưu"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
