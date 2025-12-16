import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { CreateComment,GetPostComments, DeleteAllPostComments } from '@utils/crud/comment_crud';
import { commentsValidator } from '@utils/validators';

//TODO: do we need to get comments made by a specific user ??

//used in testing before authentication
const testEmail1 = 'JohnDoe@example.com';
const testEmail2 = 'hamdahelal@forfun.com';


//retrieve all comments on a specific post !!
 async function get_Comments_Handler (request, context){

    const { params } = await context;
    const { id } = await params; //gets the post id 

    let comments = [];
    const numericId = Number(id);  
    if(id && Number.isInteger(numericId)){   //check whether the id is an integer or not
        comments =  await GetPostComments(numericId);
    }
    if(!(comments.length)){return NextResponse.json({ message: "No comments for this post found!!" }, { status: 404 });}//no comments found

    return NextResponse.json(comments);
}


//create a new comment 
 async function Post_Comments_Handler(request , context){

    const { params } = await context;
    const { id } = await params; //gets the post id 
    
    const newCommentData = await request.json();
    //validate comment data 
    const partialCommentValidator = commentsValidator.partial();
    const validatedData = partialCommentValidator.parse(newCommentData);
    //Create Comment
    const commentId = await CreateComment(testEmail2, numericId, validatedData.body);

    if (!commentId) {
        return NextResponse.json({ message: "ERROR: could not create comment" }, { status: 500 });
    }

    // Return 201 status created successfully
    return NextResponse.json({
        commentId: commentId,
        message: 'Comment created successfully'
    }, { status: 201 });
}


/*delete all post comments even though the db automatically deletes all post comments whenver its deleted 
  but the frontend might need to delete all post comments only not the whole post
*/
async function delete_Comments_Handler(request , {params}){
    const { id } = await params; //get post id
    const numericId = Number(id);  
    if(id && Number.isInteger(numericId)){   //check whether the id is an integer or not
        await DeleteAllPostComments(numericId); //query db
        return NextResponse.json({message: "comments for post deleted succesfully"});
    }
    else{
        return NextResponse.json({message: "ERROR: couldn't delete post comments"},{status:500});
    }
}



export const GET = errorHandlerMiddleware(get_Comments_Handler);

export const DELETE = errorHandlerMiddleware( delete_Comments_Handler);

export const POST = errorHandlerMiddleware( Post_Comments_Handler);