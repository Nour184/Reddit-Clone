import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../../services/middlewareHandlers/errorHandlerMiddleware";
import { auth } from "../../../../../services/auth";
import { GetOwnedCommunities } from "../../../../../utils/crud/community_crud";

async function get_owned_communities(request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const communities = await GetOwnedCommunities(session.user.email);
    return NextResponse.json(communities, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_owned_communities);
