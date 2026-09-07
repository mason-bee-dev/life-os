import { z } from "zod";

/** Reusable field schemas — import in feature-level form schemas. */
export const emailField = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập email.")
  .email("Email không hợp lệ.");

export const passwordField = z
  .string()
  .min(1, "Vui lòng nhập mật khẩu.")
  .min(6, "Mật khẩu phải có ít nhất 6 ký tự.");
