import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {GetPostVotes, VotePost, DeleteVote ,GetUserVote} from '@utils/crud/post_crud';
import {votesValidator} from '@utils/validators';
import { auth } from '@services/auth';

/*
do i delete only the whole votes or 
*/

//get total votes on a post
 async function get_Post_Votes_Handler(request , { params }){

    const { id } = await params;
    //make sure post id is a number/int
    const numericId = Number(id);
    if(!numericId){
        return NextResponse.json({ message: "ERROR: not valid post ID " }, { status: 400 });
    }
    const votes = await GetPostVotes(numericId);
    const session = await auth();
    let currentUserStatus = null;
    if (session?.user?.email) {
        try {
            //get that specific users vote status (1 or -1) on this post
            const flag = await GetUserVote(session.user.email, numericId);  
            // Convert database number (1/-1) to ('up'/'down') to directly use in frontend vote button
            if (flag === 1) currentUserStatus = 'up';
            else if (flag === -1) currentUserStatus = 'down';
        } catch (error) {
            console.error("Failed to fetch user vote status", error);
        }
    }
    return NextResponse.json({ 
        message: "successfull post votes fetching", 
        totalVotes: votes,
        userVote: currentUserStatus //front end needs it
    });
}

//vote a specific post 
async function vote_Patch_Handler(request, context){
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    const { params } = await context;
    const { id } = await params;
    const voteData = await request.json();
    voteData.post_id = Number(id);
    //make sure post id is a number(int)
    const validationResult = votesValidator.safeParse(voteData);

    //return Zod errors
    if (!validationResult.success) {
        return NextResponse.json({
            error: "Invalid input",
            issues: validationResult.error.flatten().fieldErrors, // Returns error messages
        }, { status: 400 });
    }
    const validData = validationResult.data;
    await VotePost(email, validData.post_id, validData.flag); // query db

    return NextResponse.json({ message: "Vote added successfully." });

}


//delete a vote of a post by a user
 async function delete_Votes_Handler (request , { params }){
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const { id } = await params;
    const postId = Number(id);
    if(postId){
        await DeleteVote(email,postId);//query db 
        return NextResponse.json({message: "succesfull unvote!!"});
    }
    return NextResponse.json({message: "ERROR: Could not unvote!!"}, {status:400});
}


export const GET = errorHandlerMiddleware(get_Post_Votes_Handler);
export const PATCH = errorHandlerMiddleware(vote_Patch_Handler);
export const DELETE = errorHandlerMiddleware( delete_Votes_Handler);