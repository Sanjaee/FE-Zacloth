import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "@/middlewares/WithAuth";
//middleware
export function mainMiddleware(request: NextRequest) {
  const res = NextResponse.next();
  return res;
}

export default withAuth(mainMiddleware, [
  "/admin",
  "/checkout",
  "/payment",
  "/dashboard",
]); // Routes yang memerlukan authentication
