import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {GetUserByUsername} from "@utils/crud/user_crud";

//get a specific post    
async function get_Post_Handler (request,context){
        
    const { params } = await context;
    const { username } = await params;

    //query DB
    const User = await GetUserByUsername(username);

    //If no post found
    if (!User) {
        return NextResponse.json({ message: "No user with this username found!!" }, { status: 404 });
    }

    return NextResponse.json(User); //User found
}

export const GET = errorHandlerMiddleware(get_Post_Handler);