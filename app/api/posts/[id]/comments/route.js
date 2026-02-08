import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { CreateComment,GetPostComments, DeleteAllPostComments } from '@utils/crud/comment_crud';
import { GetPost } from '@utils/crud/post_crud';
import { GetUser } from '@utils/crud/user_crud';
import { commentsValidator } from '@utils/validators';
import { auth } from '@services/auth';

//TODO: do we need to get comments made by a specific user ??


//retrieve all comments on a specific post !!
 async function get_Comments_Handler (request, context){

    const { params } = await context;
    const { id } = await params; //gets the post id 

    let comments = [];
    const numericId = Number(id);  
    if(!id || !Number.isInteger(numericId)){   //check whether the id is an integer or not
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
    }
    comments =  await GetPostComments(numericId);
    if(!(comments.length)){return NextResponse.json({ message: "No comments for this post found!!" }, { status: 404 });}//no comments found

    // Enrich comments with usernames
    const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
            let username = null;
            if (comment.user_email) {
                try {
                    const user = await GetUser(comment.user_email);
                    username = user?.username || null;
                } catch (error) {
                    console.error(`Error fetching username for comment ${comment.comment_id}:`, error);
                }
            }
            return {
                ...comment,
                username: username
            };
        })
    );

    return NextResponse.json(enrichedComments);
}


//create a new comment 
 async function Post_Comments_Handler(request , context){
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    
    const { params } = await context;
    const { id } = await params; //gets the post id 
    const numericId = Number(id);
    if (!id || !Number.isInteger(numericId)) { //check if id is valid 
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
    }
    
    const newCommentData = await request.json();
    //validate comment data 
    const bodyValidator = commentsValidator.pick({ body: true }); //choose to validate body of the comment only
    const validationResult = bodyValidator.safeParse(newCommentData);

    if (!validationResult.success) { //return validation errors 
        return NextResponse.json({error: "Invalid input",issues: validationResult.error.flatten().fieldErrors}, 
        { status: 400 });
    }
    const validatedData = validationResult.data; //validated data returned from zod
    //Create Comment
    const commentId = await CreateComment(email, numericId, validatedData.body);

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
//when a post owner wants to delete all comments in its post
async function delete_Comments_Handler(request , {params}){
    //authenticate user
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email; //logged in user

    const { id } = await params; //get post id
    const numericId = Number(id);  
    if(!id || !Number.isInteger(numericId)){   //check whether the id is an integer or not
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
    }
        
    //check whether post belongs on user or not 
    const post = await GetPost(numericId);
    if (!post) {                        //check if post exists first!
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    if (post.user_email !== email) { //check if post belongs to user 
        return NextResponse.json({ message: "Forbidden: You are not the owner of this post" }, { status: 403 });
    }
    
    await DeleteAllPostComments(numericId);
    return NextResponse.json({ message: "Comments for post deleted successfully" });
}



export const GET = errorHandlerMiddleware(get_Comments_Handler);

export const DELETE = errorHandlerMiddleware( delete_Comments_Handler);

export const POST = errorHandlerMiddleware( Post_Comments_Handler);