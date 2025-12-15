import { CreateUser, GetUser, IsUsernameAvailable } from "../../../../utils/crud/user_crud.ts";
import { NextResponse } from "next/server";
import { registerSchema } from "../../../../utils/validators.ts";

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

    const isAvailable = await IsUsernameAvailable(name);
    if (!isAvailable) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    await CreateUser(email, name, password);
    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
}