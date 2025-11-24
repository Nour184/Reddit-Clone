import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//dummy data to simulate db
import { mockData } from '@services/mockData';

//delete needs implementation !!
//retrieve all comments on a specific post !!
 async function get_Comments_Handler (request, { params }){

    const { id } = await params;
    let comments = [];
    comments =  mockData.Comments.filter(p => String(p.postID) === String(id));

    if(!(comments.length)){return NextResponse.json({ message: "No comments for this post found!!" }, { status: 404 });}//no comments found

    return NextResponse.json(comments);

}


//needs implementation!!!!
//function validateCommentInfo(commentInfo,){}


 async function Post_Comments_Handler(request , {params}){

    const commentInfo = await request.json();
    const { id } = await params;

        //invalid or incomplete comment data!!
       // if(!validateCommentInfo(commentInfo)){
      //      return NextResponse.json({ error: "Invalid comment's data" }, { status: 400 });
        //}
    const newComment = {
        commentID : 'comm-504', //  <=========== hardcoded just for testing purposes!! 
        postID : id,            //id of this post to be commented!!
        userEmail : commentInfo.userEmail,
        body : commentInfo.body,
        createdAt : new Date(),
        }
    mockData.Comments.push(newComment); //ALERT!!! ((DONT FORGET THIS PART WHEN DB IS READY!!!!!!!!!!!!!!!!))

    return NextResponse.json({message: 'comment created successfully'} );
}


//delete needs implementation !!
async function delete_Comments_Handler(request , {params}){/*implement*/}



export const GET = errorHandlerMiddleware(get_Comments_Handler);

export const DELETE = errorHandlerMiddleware( delete_Comments_Handler);

export const POST = errorHandlerMiddleware( Post_Comments_Handler);