import { cookies } from "next/headers";

export async function getServerUser() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("admin_user");

  if (!cookie) return null;

  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}
