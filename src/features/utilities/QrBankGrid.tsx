import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { QR_BANK_ITEMS, type QrBankItem } from "./data";

function digitsOnly(accountNumber: string) {
  return accountNumber.replace(/\s+/g, "");
}

function AccountNumberRow({
  item,
  copied,
  onCopy,
}: {
  item: QrBankItem;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="font-mono text-sm tabular-nums">
        Số TK: {item.accountNumber}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onCopy}
        aria-label={`Copy số tài khoản ${item.bank}`}
      >
        {copied ? <Check className="text-primary" /> : <Copy />}
      </Button>
    </div>
  );
}

export function QrBankGrid() {
  const { notify } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<QrBankItem | null>(null);

  const copyAccount = async (item: QrBankItem) => {
    const value = digitsOnly(item.accountNumber);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(item.id);
      notify("Đã copy số tài khoản");
      window.setTimeout(() => {
        setCopiedId((current) => (current === item.id ? null : current));
      }, 1500);
    } catch {
      notify("Không copy được số tài khoản");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QR_BANK_ITEMS.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <button
              type="button"
              onClick={() => setPreview(item)}
              className="block w-full bg-muted/40 p-3 text-left transition-opacity hover:opacity-90"
              aria-label={`Xem ảnh QR ${item.bank} kích thước gốc`}
            >
              <img
                src={item.imageSrc}
                alt={`QR ${item.bank} — ${item.accountName}`}
                className="mx-auto h-auto max-h-72 w-full object-contain"
              />
            </button>
            <div className="flex flex-col gap-1 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">
                {item.bank}
              </p>
              <p className="text-sm font-semibold tracking-wide">
                Tên TK: {item.accountName}
              </p>
              <AccountNumberRow
                item={item}
                copied={copiedId === item.id}
                onCopy={() => void copyAccount(item)}
              />
            </div>
          </article>
        ))}
      </div>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="flex max-h-[95vh] max-w-[min(96vw,720px)] flex-col overflow-hidden p-3 sm:p-4">
          {preview ? (
            <>
              <DialogHeader className="shrink-0 space-y-2 pr-8 text-left">
                <DialogTitle className="text-base">
                  {preview.bank} — {preview.accountName}
                </DialogTitle>
                <AccountNumberRow
                  item={preview}
                  copied={copiedId === preview.id}
                  onCopy={() => void copyAccount(preview)}
                />
              </DialogHeader>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                <img
                  src={preview.imageSrc}
                  alt={`QR ${preview.bank} — ${preview.accountName}`}
                  className="max-h-[min(80vh,800px)] w-full object-contain"
                />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

