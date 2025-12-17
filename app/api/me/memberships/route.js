import { errorHandlerMiddleware } from "@services/middlewareHandlers/errorHandlerMiddleware";
import { auth } from "@services/auth";
import { GetJoinedCommunities } from "@utils/crud/joined_communities_CRUD";
import { NextResponse } from "next/server";

async function get_memberships(request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await GetJoinedCommunities(session.user.email);
    return NextResponse.json(memberships, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_memberships);
