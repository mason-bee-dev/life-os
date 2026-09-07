import type { ZodType } from "zod";

export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;

type ValidateSuccess<T> = { success: true; data: T };
type ValidateFailure<T extends Record<string, unknown>> = {
  success: false;
  fieldErrors: FieldErrors<T>;
};

/** Parse form data with a Zod schema; returns field-level errors (first per field). */
export function validateForm<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  data: unknown,
): ValidateSuccess<T> | ValidateFailure<T> {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && fieldErrors[field as keyof T] === undefined) {
      fieldErrors[field as keyof T] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}
