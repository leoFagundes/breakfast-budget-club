import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const cookie = req.cookies.get("admin_user");

  const isAdminRoute = url.pathname.startsWith("/admin");
  const isLoginRoute = url.pathname.startsWith("/login");

  if (isAdminRoute && !cookie) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && cookie) {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
