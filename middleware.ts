import NextAuth from "next-auth";
import { authConfig } from "./services/middlewareHandlers/auth.config";

// Use the auth method from NextAuth to protect routes
// This runs the 'authorized' callback defined in auth.config.ts
export default NextAuth(authConfig).auth;

// Check all routes except static assets and APIs
export const config = {
    // Added .jpg, .jpeg, .gif, .webp, .svg, and .ico
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.svg$|.*\\.ico$).*)'],
};
