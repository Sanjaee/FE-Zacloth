import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is not authenticated, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based access control
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      // If non-admin tries to access admin routes, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname.startsWith("/dashboard") && token.role === "admin") {
      // If admin tries to access dashboard, redirect to admin
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to login page without token
        if (pathname === "/login") {
          return true;
        }

        // Require token for protected routes
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/dashboard")
        ) {
          return !!token;
        }

        // Allow access to public routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
