import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { auth } from "../../../../services/auth.js";
import { GetCommunity } from "../../../../utils/crud/community_crud.ts";
import { JoinCommunity } from "../../../../utils/crud/joined_communities_CRUD.ts";
import { IsUserJoined } from "../../../../utils/crud/joined_communities_CRUD.ts";

async function join_community(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.community_owner === session.user.email || await IsUserJoined(session.user.email, name)) {
        return NextResponse.json({ error: "You are already a member" }, { status: 400 });
    }

    await JoinCommunity(session.user.email, name);

    return NextResponse.json({ message: "Joined community successfully" }, { status: 200 });
}

export const POST = errorHandlerMiddleware(join_community);