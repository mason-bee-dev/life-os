import * as React from "react";
import { Check } from "lucide-react";

type ToastContextValue = { notify: (message: string) => void };

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * Minimal toast system. Wrap the app in <ToastProvider> and call
 * useToast().notify("Saved") anywhere. This is intentionally dependency-free;
 * you can later swap it for shadcn's radix-based toast via `npx shadcn add toast`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = React.useState<string | null>(null);

  const notify = React.useCallback((msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      {message && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f172a] px-[18px] py-[11px] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <Check size={15} strokeWidth={3} className="text-primary" />
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
