import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { mockData } from "../../../../services/mockData.js";

async function get_community(request, { params }) {
    const { name } = await params;
    const communities = mockData.Communities;

    const community = communities.find(c => c.name === name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json(community, { status: 200 });
}

async function delete_community(request, { params }) {
    const { name } = await params;
    const communities = mockData.Communities;

    const community = communities.find(c => c.name === name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const index = communities.indexOf(community);
    communities.splice(index, 1);

    // Delete all posts from this community
    mockData.Posts = mockData.Posts.filter(p => p.communityName !== name);

    return NextResponse.json({ message: "Community deleted successfully" }, { status: 200 });
}

async function patch_community(request, { params }) {
    const { name } = await params;
    const { description, communityPhotoLink } = await request.json();

    const communities = mockData.Communities;

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

    return NextResponse.json(community, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_community);
export const DELETE = errorHandlerMiddleware(delete_community);
export const PATCH = errorHandlerMiddleware(patch_community);
