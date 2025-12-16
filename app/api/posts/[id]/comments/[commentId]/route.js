import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { GetComment,UpdateComment, DeleteComment } from '@utils/crud/comment_crud';
import { commentsValidator } from '@utils/validators';

//used in testing before authentication
const testEmail1 = 'JohnDoe@example.com';
const testEmail2 = 'hamdahelal@forfun.com';



 async function get_Comment_Handler(request,context){

    const { params } = await context;
    const { commentId } = await params;
    let comment;
    //make sure id is a number
    const numericId = Number(commentId);  
    if(commentId && Number.isInteger(numericId)){   //check whether the id is an integer or not
        comment =  await GetComment(numericId); //query db
    }
    if(comment){ return NextResponse.json(comment); }//comment found!!

    //else return comment not found
    return NextResponse.json({ message: "No comment with this id found!!" }, { status: 404 });//no comment found
}



 async function patch_Comment_Handler(request,context){

    const { params } = await context;
    const { commentId } = await params;
    const commentUpdates = await request.json(); //get data to update 
    //validate new comment updates (body and postid)
    const partialCommentValidator = commentsValidator.partial();
    const validatedData = partialCommentValidator.parse(commentUpdates);

    const numericId = Number(commentId);  
    if(validatedData){
        const updatedComment = await UpdateComment(numericId,testEmail1,validatedData.body)
        return NextResponse.json(updatedComment);//return comment after modifications
    }//no comment found

    return NextResponse.json({ message: "No comment with this id found to modify!!" }, { status: 404 });//else no comment found
}

//delete a comment 
async function delete_Comment_Handler(request, { params }) {
    const { commentId } = await params;
    const numericId = Number(commentId);

    // Validate ID format
    if (!commentId || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Comment ID" }, { status: 400 });
    }

    //perform deletetion
    await DeleteComment(numericId);

    return NextResponse.json({
        message: "Comment deleted successfully",
        commentID: commentId
    });
}


export const GET = errorHandlerMiddleware(get_Comment_Handler);

export const DELETE = errorHandlerMiddleware( delete_Comment_Handler);

export const PATCH = errorHandlerMiddleware( patch_Comment_Handler);
