import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "@services/middlewareHandlers/errorHandlerMiddleware";
import { GetCommunity } from "@utils/crud/community_crud";
import { GetNumberOfMembers, JoinCommunity, LeaveCommunity, IsUserJoined } from "@utils/crud/joined_communities_CRUD";
import { auth } from "@services/auth";

async function get_members_handler(request, { params }) {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const checkUser = searchParams.get('check');

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Check if specific user is joined
    if (checkUser) {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ isJoined: false }, { status: 200 });
        }
        const isJoined = await IsUserJoined(session.user.email, name);
        return NextResponse.json({ isJoined }, { status: 200 });
    }

    // Default: Return member count
    const numberOfMembers = await GetNumberOfMembers(name);
    return NextResponse.json(numberOfMembers, { status: 200 });
}

async function join_community(request, { params }) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    await JoinCommunity(session.user.email, name);
    return NextResponse.json({ message: "Joined successfully" }, { status: 200 });
}

async function leave_community(request, { params }) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    // No need to check if community exists to delete relationship, but good practice
    // const community = await GetCommunity(name); 

    await LeaveCommunity(session.user.email, name);
    return NextResponse.json({ message: "Left successfully" }, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_members_handler);
export const POST = errorHandlerMiddleware(join_community);
export const DELETE = errorHandlerMiddleware(leave_community);