import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { GetPost, UpdatePost, DeletePost} from '@utils/crud/post_crud';
import { postValidator } from '@utils/validators';

//used in testing before authentication
const testEmail1 = 'JohnDoe@example.com';
const testEmail2 = 'hamdahelal@forfun.com';


//get a specific post 
async function get_Post_Handler (request,context){
        
    const { params } = await context;
    const { id } = await params;
    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id form params: ",id);       //debugging purposes
    
    const numericId = Number(id);  
   if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 }); //bad request
    }

    //query DB
    const searchedPost = await GetPost(numericId);

    //If no post found
    if (!searchedPost) {
        return NextResponse.json({ message: "No Post with this ID found!!" }, { status: 404 });
    }
    return NextResponse.json(searchedPost);//post found     
}


//editing a specific post !!
async function patch_Post_Handler (request , context){

//understand: next doesnt attach the dynamic route parameter like [id] to the request but its passed in params object inside context object 
    const { params } = await context; 
    const { id } = await params;
    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

    //validate ID first
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 }); //bad req
    }

    const data_to_be_updated = await request.json();

    //Validation
    const partialPostValidator = postValidator.partial();
    //Zod .parse() will throw error if invalid; errorHandlerMiddleware will catch it.
    const validUpdates = partialPostValidator.parse(data_to_be_updated);

    const updatedPost = await UpdatePost(numericId, testEmail1, validUpdates); //query db
    if (!updatedPost) {
        // This means the ID didn't exist in the DB
        return NextResponse.json({ message: "Post not found or could not be updated" }, { status: 404 });
    }
    return NextResponse.json(updatedPost); //if couldnt update post

}


//deleting a specific post!!
 async function delete_Post_Handler (request, context){

    const { params } = await context;
    const { id } = await params;

    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

   //validate ID
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
    }

    // query db 
    await DeletePost(numericId);

    return NextResponse.json({ message: "Post deleted successfully" });  
}


export const GET = errorHandlerMiddleware(get_Post_Handler);

export const PATCH = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Post_Handler);



