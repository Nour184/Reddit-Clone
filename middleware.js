import { NextResponse } from "next/server";

//will add other stuff that middleware should take care of later !!
//Fast blocking BEFORE even the page loads; increasing effciency that way !!
export function middleware(request) {
  const token = request.cookies.get("token");

  if (!token && request.nextUrl.pathname.startsWith("/profile")) {
    return Response.redirect(new URL("/login", request.url));
  }
}