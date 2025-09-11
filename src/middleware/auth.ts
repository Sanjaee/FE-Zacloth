import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Client routes protection
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/qr")) {
      if (!token || (token.role !== "client" && token.role !== "admin")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Redirect authenticated users from login page
    if (pathname === "/login" && token) {
      if (token.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = ["/", "/login", "/api/auth"];
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/qr/:path*", "/login"],
};
