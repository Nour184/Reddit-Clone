import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {  VoteComment, GetCommentVotes, DeleteCommentVote} from '@utils/crud/comment_crud';
import {votesValidator} from '@utils/validators';
import { auth } from '@services/auth';



async function Get_Comment_Votes(request, context){
    const {params} = await context;
    const { commentId } = await params;
    const numericId = Number(commentId); 
    if (!commentId || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "ERROR: ID is not an Integer!!" }, { status: 400 });
    }
    const votes = await GetCommentVotes(numericId);
    return NextResponse.json({ VoteCount: votes }); //retrun 0 or total votes

}


async function Patch_Vote_Handler(request, context) {
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const { params } = await context;
    const { commentId } = await params;
    const numericId = Number(commentId);
    //valiadate id 
    if (!commentId || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Comment ID" }, { status: 400 });
    }

    const data = await request.json(); //get data from frontend
    
    //validate input
    const partialValidator = votesValidator.pick({ flag: true });
    const validationResult = partialValidator.safeParse(data);
    const validVote = validationResult.data;
    //handle zod errors
    if (!validationResult.success) {
        return NextResponse.json({
            error: "Invalid input",
            issues: validationResult.error.flatten().fieldErrors, // returns custom msg: "Vote flag must be either 1 or -1"
        }, { status: 400 });
    }
    await VoteComment(email, numericId, validVote.flag); //query db
    return NextResponse.json({ message: "Vote added successfully" });
}

//for unvoting
async function Delete_Vote_Handler(request, context) {
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const { params } = await context;
    const { commentId } = await params;
    const numericId = Number(commentId);
    //validate id!!
    if (!commentId || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Comment ID" }, { status: 400 });
    }

    // unvote for the current user (no rows would be affected if user has no vote on comment!!)
    await DeleteCommentVote(email, numericId);

    return NextResponse.json({ message: "Vote removed" });
}



export const GET = errorHandlerMiddleware(Get_Comment_Votes);
export const PATCH = errorHandlerMiddleware(Patch_Vote_Handler);
export const DELETE = errorHandlerMiddleware(Delete_Vote_Handler);