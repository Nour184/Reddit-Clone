import NextAuth, { User } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { GetUser, GetPassword } from "../../../../utils/crud/user_crud";
import { loginSchema } from "../../../../utils/validators";
import { VerifyPassword } from "../../../../utils/hash";

const handler = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<User | null> {
                const { email, password } = loginSchema.parse(credentials);

                const user = await GetUser(email);
                if (!user) {
                    throw new Error("Invalid credentials");
                }

                const storedPassword = await GetPassword(email);
                if (!storedPassword) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await VerifyPassword(
                    password,
                    storedPassword
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
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

export { handler as GET, handler as POST };

