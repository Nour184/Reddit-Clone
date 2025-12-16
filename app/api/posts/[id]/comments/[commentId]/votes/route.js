import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {  VoteComment, GetCommentVotes, DeleteCommentVote} from '@utils/crud/comment_crud';
import {votesValidator} from '@utils/validators';


//used in testing before authentication
const testEmail1 = 'JohnDoe@example.com';
const testEmail2 = 'hamdahelal@forfun.com';

async function Get_Comment_Votes(request, context){
    const {params} = await context;
    const { commentId } = await params;
    const numericId = Number(commentId); 
    if (!Number.isInteger(numericId)) {
        // bad request
        return NextResponse.json({ message: "ERROR: ID is not an Integer!!" }, { status: 400 });
    }
    const votes = await GetCommentVotes(numericId);
    return NextResponse.json(votes);

}


async function Patch_Vote_Handler(request, context) {
    const { params } = await context;
    const { commentId } = await params;
    const numericId = Number(commentId);

    const data = await request.json(); //get data from frontend
    
    //validate input
    const partialValidator = votesValidator.partial();
    const validVote = partialValidator.parse(data);

    if (!validVote) {
        return NextResponse.json({ error: validVote.error }, { status: 400 }); //bad request!!
    }

    await VoteComment(testEmail1, numericId, validVote.flag); //query db
    return NextResponse.json({ message: "Vote added successfully" });
}

//for unvoting
async function Delete_Vote_Handler(request, context) {
    const { params } = await context;
    const { commentId } = await params;
    const numericId = Number(commentId);

    // unvote for the current user
    await DeleteCommentVote(testEmail1, numericId);

    return NextResponse.json({ message: "Vote removed" });
}



export const GET = errorHandlerMiddleware(Get_Comment_Votes);
export const PATCH = errorHandlerMiddleware(Patch_Vote_Handler);
export const DELETE = errorHandlerMiddleware(Delete_Vote_Handler);