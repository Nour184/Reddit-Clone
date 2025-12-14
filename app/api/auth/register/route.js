import { CreateUser, GetUser } from "../../../../utils/crud/user_crud.ts";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request) {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            {
                error: "Invalid input",
                issues: result.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { name, email, password } = result.data;
    const user = await GetUser(email);
    if (user) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    await CreateUser(email, name, password);
    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
}