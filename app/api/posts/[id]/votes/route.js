import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {GetPostVotes, VotePost, DeleteVote} from '@utils/crud/post_crud';
import {votesValidator} from '@utils/validators';

//used in testing before authentication
const testEmail1 = 'JohnDoe@example.com';
const testEmail2 = 'hamdahelal@forfun.com';

/*
do i delete only the whole votes or 
*/

//get total votes on a post
 async function get_Post_Votes_Handler(request , { params }){

    const { id } = await params;
    //make sure post id is a number/int
    const numericId = parseInt(Number(id));
    if(numericId){ 
        const votes = await GetPostVotes(numericId);
        return NextResponse.json({ message: "successfull votes fetching",totalVotes: votes});
    }
    else if(!numericId){
        //id is not numeric 
        return NextResponse.json({ message: "ERROR: not valid post ID " }, { status: 400 });
    }

}
//vote a specific post 
async function vote_Patch_Handler(request, context){
    const { params } = await context;
    const { id } = await params;
    const voteData = await request.json();
    voteData.post_id = Number(id);
    //make sure post id is a number/int
    const validatedVoteData = votesValidator.parse(voteData);
    if(validatedVoteData){
       await  VotePost(testEmail1,validatedVoteData.post_id,validatedVoteData.flag); //query db
        return NextResponse.json({ message: "Vote added successfully."});
    }
    return NextResponse.json({message: "ERROR voting!!"},{status: 400});

}

/*
  does this even needs implementation ??
*/

//delete a vote of a post by a user
 async function delete_Votes_Handler (request , { params }){

    const { id } = await params;
    const postId = Number(id);
    if(postId){
        DeleteVote(testEmail1,postId);//query db 
        return NextResponse.json({message: "succesfull unvote!!"});
    }
    return NextResponse.json({message: "ERROR: Could not unvote!!"});

}


export const GET = errorHandlerMiddleware(get_Post_Votes_Handler);
export const PATCH = errorHandlerMiddleware(vote_Patch_Handler);
export const DELETE = errorHandlerMiddleware( delete_Votes_Handler);