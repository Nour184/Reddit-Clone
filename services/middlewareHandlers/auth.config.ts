import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {

            // TODO: need to revise this.
            const protectedPaths = ["/create-community", "/submit", "/settings", "/profile"];

            const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

            if (isProtected) {
                return !!auth?.user;
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
