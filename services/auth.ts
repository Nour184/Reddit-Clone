import NextAuth, { User } from "next-auth";
import { authConfig } from "./middlewareHandlers/auth.config";
import Credentials from "next-auth/providers/credentials";
import { GetUser, GetPassword } from "../utils/crud/user_crud";
import { loginSchema } from "../utils/validators";
import { VerifyPassword } from "../utils/hash";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email ?? null;
                token.name = user.name ?? null;
                token.picture = user.image ?? null;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = (token.id as string) ?? null;
                session.user.email = (token.email as string) ?? null;
                session.user.name = (token.name as string) ?? null;
                session.user.image = (token.picture as string) ?? null;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<User | null> {
                const parsed = loginSchema.safeParse(credentials);

                if (!parsed.success) {
                    console.log("Validation Error:", parsed.error);
                    return null;
                }

                const { email, password } = parsed.data;

                const user = await GetUser(email);
                if (!user) {
                    return null;
                }

                const storedPassword = await GetPassword(email);
                if (!storedPassword) {
                    return null;
                }

                const isPasswordValid = await VerifyPassword(
                    password,
                    storedPassword
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.email,
                    email: user.email,
                    name: user.username,
                    image: user.profile_picture_link ?? null,
                };
            },
        }),
    ],
});
