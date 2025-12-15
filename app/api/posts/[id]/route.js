import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { GetPost, UpdatePost, DeletePost} from '@utils/crud/post_crud';
import { postValidator } from '@utils/validators';

//used in testing before authentication
const testEmail1 = 'JohnDoe@example.com';
const testEmail2 = 'hamdahelal@forfun.com';

//make a separatre function to be used by GET and DELETE to query the database when passed a specific post id !!!
//function Query_DB_For_Post(){}

//get a specific post 
async function get_Post_Handler (request,context){
        

    //const url = new URL(request.url);
    //const post_id = url.searchParams.get('postID');
    let searchedPost = {};
    const { params } = await context;
    const { id } = await params;
    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id form params: ",id);       //debugging purposes
    
    const numericId = Number(id);  
    if(id && Number.isInteger(numericId)){   //check whether the id is an integer or not 
        searchedPost = await GetPost(numericId); //query db
    }
    else{
        return NextResponse.json({ message: "Invalid Post ID!!" }, { status: 400 }); //invalid id
    }
    
    //if no post with this id found return an error msg
    if(!searchedPost){return NextResponse.json({ message: "No Post with this ID found!!" }, { status: 404 });}//post not found
 
    return NextResponse.json(searchedPost);//post found     
}


//editing a specific post !!
async function patch_Post_Handler (request , context){

//understand: next doesnt attach the dynamic route parameter like [id] to the request but its passed in params object inside context object 
    const { params } = await context; 
    const { id } = await params;
    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

    const data_to_be_updated = await request.json();
    const partialPostValidator  = postValidator.partial(); //to allow zod to zalidate only the passed fields
    const validUpdates = partialPostValidator.parse(data_to_be_updated);//valifdate incoming updates on post
    
    //if data is valid query the db to update the post
    if(validUpdates){
        const updatedPost = await UpdatePost(parseInt(id),testEmail1,validUpdates);
        return NextResponse.json(updatedPost); //return updated post
    }
    return NextResponse.json({message:'error updating post'}, {status : 500}); //if couldnt update post

}


//deleting a specific post!!
 async function delete_Post_Handler (request, context){

    const { params } = await context;
    const { id } = await params;

    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

    let deletedPost;
    const numericId = Number(id); 
    if(id && Number.isInteger(numericId)){   //check whether the id is an integer or not 
        deletedPost = await DeletePost(numericId); //query db
        return NextResponse.json({message:"post deleted successfully"});//won'y return the deleted post for now
    } 
    return NextResponse.json({message:"ERROR: could not delete post"},{status:500})
   
}

export const GET = errorHandlerMiddleware(get_Post_Handler);

export const PATCH = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Post_Handler);



