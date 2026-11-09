import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Skip Next.js internal static assets and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Multi-tenant Subdomain & Custom Domain Detection
  // Supports:
  // - Query param: ?tenant=sazzad
  // - Subdomain: sazzad.localhost:3001, sazzad.omnistay-web.vercel.app, sazzad.omnistay.com
  let tenantSlug: string | null = searchParams.get("tenant") || null;

  const cleanHost = host.split(":")[0]?.toLowerCase() || "";
  const rootDomains = [
    "localhost",
    "omnistay-web.vercel.app",
    "omnistay.com",
    "127.0.0.1",
  ];

  if (!tenantSlug) {
    for (const root of rootDomains) {
      if (cleanHost.endsWith(`.${root}`)) {
        const sub = cleanHost.replace(`.${root}`, "").trim();
        if (sub && sub !== "www") {
          tenantSlug = sub;
          break;
        }
      }
    }
  }

  // 3. Inject Tenant Headers
  const requestHeaders = new Headers(request.headers);
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }
  requestHeaders.set("x-tenant-host", cleanHost);

  // 4. Guest Protected Route Guard
  const isGuestDashboard = pathname.startsWith("/guest");
  const guestToken =
    request.cookies.get("omnistay_guest_token")?.value ||
    request.cookies.get("guest_token")?.value;

  if (isGuestDashboard && !guestToken) {
    // If accessing guest dashboard without session, redirect to guest login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

