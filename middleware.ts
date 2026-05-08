import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthBypass } from "@/lib/auth-bypass";

const { auth } = NextAuth(authConfig);

const authMiddleware = auth((req) => {
  const isAuthenticated = !!req.auth;
  const isPublicRoute = req.nextUrl.pathname === "/";

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
});

export default function middleware(
  req: NextRequest,
  ctx: Parameters<typeof authMiddleware>[1]
) {
  if (isAuthBypass()) {
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  return authMiddleware(req, ctx);
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
