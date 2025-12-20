import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "@services/middlewareHandlers/errorHandlerMiddleware";
import { auth } from "@services/auth";
import { AddAdmin, GetCommunityAdmins, RemoveAdmin, IsAdmin } from "@utils/crud/community_admin_CRUD";
import { GetCommunity } from "@utils/crud/community_crud";
import { GetUser } from "@utils/crud/user_crud";

// GET: List all admins
async function get_admins(request, { params }) {
    const { name } = await params;
    const admins = await GetCommunityAdmins(name);
    return NextResponse.json(admins, { status: 200 });
}

// POST: Add an admin
async function add_admin(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const { userEmail } = await request.json();

    if (!userEmail) {
        return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    // Check if requester is owner
    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.community_owner !== session.user.email) {
        return NextResponse.json({ error: "Only the owner can add admins" }, { status: 403 });
    }

    // Validation: Cannot add yourself (owner is already super-admin)
    if (userEmail === community.community_owner) {
        return NextResponse.json({ error: "You are already the owner!" }, { status: 400 });
    }

    // Validation: Check if user exists
    const user = await GetUser(userEmail);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validation: Check if already admin
    const alreadyAdmin = await IsAdmin(userEmail, name);
    if (alreadyAdmin) {
        return NextResponse.json({ error: "User is already an admin" }, { status: 400 });
    }

    // Add admin
    await AddAdmin(userEmail, name);
    return NextResponse.json({ message: "Admin added successfully" }, { status: 201 });
}

// DELETE: Remove an admin
async function remove_admin(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await params;
    const { userEmail } = await request.json(); // Email of admin to remove

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.community_owner !== session.user.email) {
        return NextResponse.json({ error: "Only the owner can remove admins" }, { status: 403 });
    }

    await RemoveAdmin(userEmail, name);
    return NextResponse.json({ message: "Admin removed successfully" }, { status: 200 });
}

export const GET = errorHandlerMiddleware(get_admins);
export const POST = errorHandlerMiddleware(add_admin);
export const DELETE = errorHandlerMiddleware(remove_admin);
