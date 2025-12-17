import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "@services/middlewareHandlers/errorHandlerMiddleware";
import { GetCommunity } from "@utils/crud/community_crud";
import { GetNumberOfMembers } from "@utils/crud/joined_communities_CRUD";

async function get_number_of_members(request, { params }) {
    const { name } = await params;

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const numberOfMembers = await GetNumberOfMembers(name);

    return NextResponse.json(numberOfMembers, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_number_of_members);