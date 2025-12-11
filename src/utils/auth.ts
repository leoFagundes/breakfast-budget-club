// src/app/utils/auth.ts
import { getCookie } from "cookies-next";

export function isLoggedIn(): boolean {
  try {
    const cookie = getCookie("admin_user");

    if (!cookie) return false;

    // Garantir que é JSON válido
    const parsed = JSON.parse(cookie as string);

    return Boolean(parsed?.id);
  } catch {
    return false;
  }
}
