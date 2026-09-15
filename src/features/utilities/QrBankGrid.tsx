import { QR_BANK_ITEMS } from "./data";

export function QrBankGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {QR_BANK_ITEMS.map((item) => (
        <article
          key={item.id}
          className="overflow-hidden rounded-2xl border bg-card"
        >
          <div className="bg-muted/40 p-3">
            <img
              src={item.imageSrc}
              alt={`QR ${item.bank} — ${item.accountName}`}
              className="mx-auto h-auto max-h-72 w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              {item.bank}
            </p>
            <p className="text-sm font-semibold tracking-wide">
              Tên TK: {item.accountName}
            </p>
            <p className="font-mono text-sm tabular-nums">
              Số TK: {item.accountNumber}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
