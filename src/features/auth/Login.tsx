import { useState, type FormEvent } from "react";
import { Activity, BookOpen, Eye, EyeOff, Heart, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validateForm } from "@/lib/validation/form";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { LogoMark } from "@/components/LogoMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Heart,
    label: "Theo dõi sức khoẻ",
    desc: "Nước, cà phê và thói quen cá nhân mỗi ngày.",
  },
  {
    icon: BookOpen,
    label: "Nhật ký & suy ngẫm",
    desc: "Ghi lại tâm trạng và những khoảnh khắc đáng nhớ.",
  },
  {
    icon: Activity,
    label: "Phân tích xu hướng",
    desc: "Nhìn lại cuộc sống qua số liệu và insight.",
  },
];

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={compact ? 36 : 44} className="rounded-[10px]" />
      <div>
        <div
          className={
            "font-bold tracking-tight text-foreground " +
            (compact ? "text-lg" : "text-2xl")
          }
        >
          Life OS
        </div>
        {!compact && (
          <div className="mt-0.5 text-sm text-muted-foreground">
            Phân tích đời sống cá nhân
          </div>
        )}
      </div>
    </div>
  );
}

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
      fieldErrors[field] && "border-destructive/50 focus-visible:ring-destructive/30",
    );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-sidebar px-10 py-12 lg:flex lg:flex-col lg:justify-between">
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

        <BrandLogo />

        <div className="relative z-10 max-w-md">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles size={13} />
            Hệ điều hành cho cuộc sống của bạn
          </div>
          <h1 className="m-0 text-[2rem] font-bold leading-tight tracking-tight text-foreground">
            Một nơi để theo dõi, ghi chép và hiểu rõ bản thân hơn.
          </h1>
          <p className="mt-4 text-xs text-muted-foreground">
            Life OS giúp bạn đồng bộ dữ liệu sức khoẻ, thói quen và nhật ký —
            mọi lúc, mọi thiết bị.
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {highlights.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-accent text-primary">
                  <Icon size={18} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {label}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {desc}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-faint">
          © {new Date().getFullYear()} Life OS · Dành riêng cho bạn
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12 lg:px-16">
        <div className="mb-8 lg:hidden">
          <BrandLogo compact />
        </div>

        <div className="mx-auto w-full max-w-[400px]">
          <h2 className="m-0 text-[26px] font-bold tracking-tight">
            Đăng nhập
          </h2>
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
    </div>
  );
}
