import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { GetAllCommunities, DeleteCommunity } from "@/utils/crud/community_crud.js";

async function get_community(request, { params }) {
    const { name } = await params;
    const communities = GetAllCommunities();

    const community = communities.find(c => c.name === name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json(community, { status: 200 });
}

// TODO: add a security layer to delete_community
/*
    Authentication (only logged-in users)
    Authorization (only community creator can delete)
*/
async function delete_community(request, { params }) {
    const { name } = await params;
    const communities = GetAllCommunities();

    const community = communities.find(c => c.name === name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    await DeleteCommunity(name); // Community Deletion cascades to posts

    return NextResponse.json({ message: "Community deleted successfully" }, { status: 200 });
}

// TODO: add a security layer to patch_community
/*
    Authentication (only logged-in users)
    Authorization (only community creator or moderators can edit)
    Input validation (string length, URL format, etc.)
*/
async function patch_community(request, { params }) {
    const { name } = await params;
    const { description, communityPhotoLink } = await request.json();

    const communities = await GetAllCommunities();

    const community = communities.find(c => c.name === name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (description) {
        community.description = description;
    }

    if (communityPhotoLink) {
        community.communityPhotoLink = communityPhotoLink;
    }

    await UpdateCommunity(name, community.description, community.communityPhotoLink);

    return NextResponse.json(community, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_community);
export const DELETE = errorHandlerMiddleware(delete_community);
export const PATCH = errorHandlerMiddleware(patch_community);
