import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthBypass } from "@/lib/auth-bypass";

const { auth } = NextAuth(authConfig);

/** Manifest, SEO e ícones — sem sessão; não inclui "/" (landing). */
function isPublicAssetOrSeoRoute(pathname: string): boolean {
  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/")
  ) {
    return true;
  }
  return false;
}

const authMiddleware = auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (isPublicAssetOrSeoRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = !!req.auth;

  if (!isAuthenticated) {
    if (pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname === "/") {
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
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|sw\\.js|icons/|.*\\.(?:png|svg|ico|webp|jpg|jpeg|gif)$).*)",
  ],
};
