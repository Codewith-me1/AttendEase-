import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const publicRoutes = ["/pages/au", "/pages/signup"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    // Retrieve auth token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      throw new Error("No token found");
    }

    // Since Firebase Admin SDK isn't supported in middleware,
    // redirect to an API route for validation
    const verifyUrl = new URL("/api/token", request.url);
    verifyUrl.searchParams.set("token", token);

    const verifyResponse = await fetch(verifyUrl.toString());

    if (!verifyResponse.ok) {
      throw new Error("Invalid token");
    }

    // Token is valid, continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error("Authentication error:", error);

    // Redirect unauthenticated users to the login page
    return NextResponse.redirect(new URL("/pages/au", request.url));
  }
}

// Apply middleware to authenticated routes
export const config = {
  matcher: "/Authenticated/:path*",
};
