import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { auth } from "../../../../services/auth.js";
import { GetCommunity } from "../../../../utils/crud/community_crud.ts";
import { LeaveCommunity, IsUserJoined } from "../../../../utils/crud/joined_communities_CRUD.ts";

async function leave_community(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.community_owner === session.user.email) {
        return NextResponse.json({ error: "You cannot leave your own community" }, { status: 400 });
    }

    if (!await IsUserJoined(session.user.email, name)) {
        return NextResponse.json({ error: "You are not a member of this community" }, { status: 400 });
    }

    await LeaveCommunity(session.user.email, name);

    return NextResponse.json({ message: "Left community successfully" }, { status: 200 });
}

export const POST = errorHandlerMiddleware(leave_community);