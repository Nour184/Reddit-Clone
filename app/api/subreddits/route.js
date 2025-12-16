import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { GetAllCommunities, CreateCommunity, GetCommunity } from "../../../utils/crud/community_crud.ts";

async function get_communities(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;
    let communities = await GetAllCommunities(query, limit, offset);

    return NextResponse.json(communities, { status: 200 });
}

import { auth } from "../../../services/auth";

async function post_community(request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, communityPhotoLink } = await request.json();
    const community = await GetCommunity(name);

    if (community) {
        return NextResponse.json({ error: "Community already exists" }, { status: 400 });
    }

    await CreateCommunity(name, description, communityPhotoLink, session.user.email);
    return NextResponse.json({ message: "Community created successfully" }, { status: 201 });
}

export const GET = errorHandlerMiddleware(get_communities);
export const POST = errorHandlerMiddleware(post_community);
