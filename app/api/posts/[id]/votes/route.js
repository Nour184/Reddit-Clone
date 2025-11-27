import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//dummy data to simulate posts
import { mockData } from '@services/mockData';

/*
do i delete only the whole votes or 
*/

//get all upvotes and downvotes on a post
 async function get_Votes_Handler(request , { params }){

    const { id } = await params;
    //query db for that post id (up votes table and down votes table)
    let upVotes = mockData.PostUpvotes.filter( p => String(p.postID) === String(id));
    let downVote = mockData.PostDownvotes.filter( p => String(p.postID) === String(id));

    if(!((upVotes.length)&&(downVote.length))){return NextResponse.json({ message: "No votes for this post found!!" }, { status: 404 });}//no votes found

    return NextResponse.json({ message: "successfull votes fetching",
        upVotes: `${upVotes}`, downVotes: `${downVote}`});

}



//delete all votes of a post thats gonna be deleted 
 async function delete_Votes_Handler (request , { params }){

    const { id } = await params;
    //delete from db when connected !! 
}


export const GET = errorHandlerMiddleware(get_Votes_Handler);

export const DELETE = errorHandlerMiddleware( delete_Votes_Handler);