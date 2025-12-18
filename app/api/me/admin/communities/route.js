import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../../services/middlewareHandlers/errorHandlerMiddleware";
import { auth } from "../../../../../services/auth";
import { GetAdminCommunities } from "../../../../../utils/crud/community_admin_CRUD";

async function get_admin_communities(request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const communities = await GetAdminCommunities(session.user.email);
    return NextResponse.json(communities, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_admin_communities);
