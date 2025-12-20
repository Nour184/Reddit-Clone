import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { SearchUsers } from "../../../../utils/crud/user_crud.ts";

async function search_users(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '10', 10), 100));
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const offset = (page - 1) * limit;

        const users = await SearchUsers(query, limit, offset);

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error("Search users API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const GET = errorHandlerMiddleware(search_users);
