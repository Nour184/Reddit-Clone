import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { mockData } from "../../../services/mockData.js";

async function get_communities(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    let communities = mockData.Communities;

    if (query) {
        const lowerQuery = query.toLowerCase();
        communities = communities.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery)
        );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCommunities = communities.slice(startIndex, endIndex);

    return NextResponse.json(paginatedCommunities, { status: 200 });
}

async function post_community(request) {
    const { name, description, communityPhotoLink } = await request.json();
    const communities = mockData.Communities;

    if (communities.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        return NextResponse.json({ error: "Community already exists" }, { status: 400 });
    }

    const newCommunity = {
        id: communities.length + 1,
        name,
        description,
        communityPhotoLink,
        createdOn: new Date(),
    };
    communities.push(newCommunity);
    return NextResponse.json(newCommunity, { status: 201 });
}

export const GET = errorHandlerMiddleware(get_communities);
export const POST = errorHandlerMiddleware(post_community);
