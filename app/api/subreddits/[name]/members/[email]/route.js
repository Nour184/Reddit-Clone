import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from "../../../../services/middlewareHandlers/errorHandlerMiddleware.js";
import { auth } from "../../../../services/auth.js";
import { GetCommunity } from "../../../../utils/crud/community_crud.ts";
import { IsAdmin, AddAdmin, RemoveAdmin } from "../../../../utils/crud/community_admin_CRUD.ts";

async function toggle_admin(request, { params }) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await params;

    const community = await GetCommunity(name);
    if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    if (community.community_owner !== session.user.email) {
        return NextResponse.json({ error: "You are not the owner of this community" }, { status: 400 });
    }

    const isMemberAdmin = await IsAdmin(email, name);
    if (isMemberAdmin) {
        await RemoveAdmin(email, name);
    } else {
        await AddAdmin(email, name);
    }

    return NextResponse.json({ message: "Toggled admin successfully" }, { status: 200 });
}

export const POST = errorHandlerMiddleware(toggle_admin);