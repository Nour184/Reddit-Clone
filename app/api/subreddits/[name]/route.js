import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "@services/middlewareHandlers/errorHandlerMiddleware.js";
import { GetCommunity, DeleteCommunity, UpdateCommunity } from "@utils/crud/community_crud.ts";
import { IsAdmin } from "@utils/crud/community_admin_CRUD.ts";
import { auth } from "@services/auth.ts";

async function get_community(request, { params }) {
    const { name } = await params;

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json(community, { status: 200 });
}

async function delete_community(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.community_owner !== session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await DeleteCommunity(name);

    return NextResponse.json({ message: "Community deleted successfully" }, { status: 200 });
}

async function patch_community(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const { description, communityPhotoLink } = await request.json();

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const isAdmin = await IsAdmin(session.user.email, name);
    if (community.community_owner !== session.user.email && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (description) {
        community.description = description;
    }

    if (communityPhotoLink) {
        community.community_photo_link = communityPhotoLink;
    }

    await UpdateCommunity(name, community.description, community.community_photo_link);

    return NextResponse.json(community, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_community);
export const DELETE = errorHandlerMiddleware(delete_community);
export const PATCH = errorHandlerMiddleware(patch_community);
