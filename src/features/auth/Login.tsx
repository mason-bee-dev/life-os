import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateForm } from "@/lib/validation/form";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearFieldError = (field: keyof LoginInput) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = validateForm(loginSchema, { email, password });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword(
      parsed.data,
    );
    setSubmitting(false);
    if (authError) {
      setFormError(
        authError.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    }
  };

  const inputClass = (field: keyof LoginInput) =>
    cn(
      "h-11 rounded-xl border-border bg-card",
      fieldErrors[field] &&
        "border-destructive/50 focus-visible:ring-destructive/30",
    );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sidebar px-6 py-12">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--login-orb) 0%, transparent 70%)",
        }}
      />

      <div className="absolute left-6 top-6 z-10 sm:left-10 sm:top-10">
        <BrandLogo size={40} />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        <h2 className="m-0 text-[26px] font-bold tracking-tight">Đăng nhập</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Chào mừng trở lại. Nhập thông tin tài khoản để tiếp tục.
        </p>

        <form
          noValidate
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass("email")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              aria-invalid={!!fieldErrors.email}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(inputClass("password"), "pr-11")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                aria-invalid={!!fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          {formError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {formError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={submitting}
          >
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
