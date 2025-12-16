import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { GetPost, UpdatePost, DeletePost,GetPostMediaInfo, SavePostMediaInfo} from '@utils/crud/post_crud';
import { postValidator } from '@utils/validators';
import cloudinary from '@services/cloudinary';
import { auth } from '@services/auth';


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

//helper to upload to cloudinary
async function uploadToCloudinary(data){
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "reddit-demo-posts",
        resource_type: "auto" 
      }, 
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          public_id: result.public_id, //public id from cloudinary
          type: result.resource_type // Returns 'image' or 'video'
        });
      }
    ).end(buffer);
  });

}

//editing a specific post !!
async function patch_Post_Handler (request , context){

    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
//understand: next doesnt attach the dynamic route parameter like [id] to the request but its passed in params object inside context object 
    const { params } = await context; 
    const { id } = await params;
    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

    const numericId = Number(id);
    //validate ID first
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 }); //bad req
    }
    //extract data
    const postInfo = await request.formData();
    const title = postInfo.get("title");
    const body = postInfo.get("body");
    const media = postInfo.get("media");

    const data_to_be_validated = {};
    if (title) data_to_be_validated.title = title;
    if (body !== null) data_to_be_validated.body = body;

    const partialValidator = postValidator.partial();
    const validUpdates = partialValidator.parse(data_to_be_validated);

    //handle media logic
    if (media && media.size > 0) {
        console.log("New media detected. Uploading...");

        //Upload New Image
        const uploadResult = await uploadToCloudinary(media);   
        //Add the new URL to our update object
        validUpdates.picture_link = uploadResult.url;
        //Get the old public_id from the sidecar table
        const oldMediaInfo = await GetPostMediaInfo(numericId);
        
        if (oldMediaInfo && oldMediaInfo.public_id) {
            try {
                await cloudinary.uploader.destroy(oldMediaInfo.public_id);
                console.log("Deleted old image from Cloudinary");
            } catch (err) {
                console.error("Failed to delete old image (not a fatal pb):", err);
            }
        }
        //Save the new public_id to the new db table
        await SavePostMediaInfo(numericId, uploadResult.public_id);
    }
    const updatedPost = await UpdatePost(numericId, email, validUpdates); 

    if (!updatedPost) {
        return NextResponse.json({ message: "Post not found or could not be updated" }, { status: 404 });
    }
    return NextResponse.json(updatedPost); //if couldnt update post

}


//deleting a specific post!! (i think i should check if the post belongs to a user)
 async function delete_Post_Handler (request, context){
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const { params } = await context;
    const { id } = await params;
    const numericId = Number(id);

    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

   //validate ID
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
    }
    //check if user owns the post
    const deletionSuccess = await DeletePost(numericId, email);  // query db 
    if (!deletionSuccess) {
        return NextResponse.json({ message: "Post not found or user do not have permission to delete it" }, { status: 400 });
    }

    const mediaInfo = await GetPostMediaInfo(numericId);
    if (mediaInfo && mediaInfo.public_id) {
        try {
            await cloudinary.uploader.destroy(mediaInfo.public_id);
            console.log("Deleted post image from Cloudinary");
        } catch (err) {
            console.error("Failed to delete image:", err);
        }
    }
    //delete post
    return NextResponse.json({ message: "Post deleted successfully" });  
}


export const GET = errorHandlerMiddleware(get_Post_Handler);

export const PATCH = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Post_Handler);



