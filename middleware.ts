import { NextRequest, NextResponse } from "next/server";

// Fast, cookie-presence-only redirect for UX. The real check against the
// sessions table happens server-side in app/(app)/layout.tsx and in every
// API route, so this middleware is a convenience, not the security boundary.
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("session");
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

  if (!hasSession && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/accounts", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)"],
};
