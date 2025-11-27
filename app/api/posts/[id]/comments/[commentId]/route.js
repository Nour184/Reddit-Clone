//TODO: GET , DELETE , PATCH(modify the comment)
import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//dummy data to simulate posts
import { mockData } from '@services/mockData';


/*
 implement the GET method so that when a comment id edited dont query the whole db to get all comments again 
 to rerender instead get that edited comment and rerender it only 
*/

//==========>  TO BE DONE make a function that queries the db !!!
function getComment(commentId){}


 async function get_Comment_Handler(request,{params}){

    const { commentId } = await params;
        
    //query db 
    const comment = mockData.Comments.find( p => String(p.commentID) === String(commentId) );
    if(!comment){ return NextResponse.json({ message: "No comment with this id found!!" }, { status: 404 });}//no comment found

    return NextResponse.json(comment);//comment found!!

}


//implement/edit it so that it modifies the db comment
function modifyComment(commentId , modifies){
    //can only modify body of the comment
    //query db 
    const comment = mockData.Comments.find( p=> String(p.commentID) === String(commentId) );
    if (!comment){return comment;}//no comment found

    comment.body = modifies.body; //if comment was found edit it 
    //update the db instead
    mockData.Comments.find( p => String(p.commentID) === String(commentId) ).body =  modifies.body; 
    return comment;

}

 async function patch_Comment_Handler(request,{ params }){

    const modifies = await request.json();
    const { commentId } = await params;

    let modifiedComment = modifyComment(commentId , modifies);
    if(!modifiedComment){ return NextResponse.json({ message: "No comment with this id found!!" }, { status: 404 });}//no comment found}

    return NextResponse.json(modifiedComment);//return comment after modifications
}




 async function delete_Comment_Handler(request , { params }){

    const { commentId } = await params;
    //simulate querying the DB!!!
    const IndexOfCommentToDelete = mockData.Comments.findIndex(comm=> String(comm.commentID) === String(commentId));

    if(IndexOfCommentToDelete < 0 ){ return NextResponse.json({ message: "No comment with this ID found!!" }, { status: 404 });}//comment not found

    console.log("before:", mockData.Comments.length); //for debugging
    const deletedComment = mockData.Comments.splice(IndexOfCommentToDelete,1); //array.splice(startIndex, deleteCount)=> returns an array of the deleted stuff
    console.log("after:", mockData.Comments.length); //for debugging 
    //it actually deletes it but it becomes reloaded again !!
    console.log("deleted comment: " , deletedComment);

    return NextResponse.json({message:"comment deleted successfully" 
        , comment : deletedComment
    });
}


export const GET = errorHandlerMiddleware(get_Comment_Handler);

export const DELETE = errorHandlerMiddleware( delete_Comment_Handler);

export const PATCH = errorHandlerMiddleware( patch_Comment_Handler);
