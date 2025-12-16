import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { GetPost, UpdatePost, DeletePost,GetPostMediaInfo, SavePostMediaInfo} from '@utils/crud/post_crud';
import { postValidator } from '@utils/validators';
import cloudinary from '@services/cloudinary';

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

//helper to upload to cloudinary
async function uploadToCloudinary(data){
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "user_profiles",
        resource_type: "image" 
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
    if (body) data_to_be_validated.body = body;

    const partialValidator = postValidator.partial();
    const validUpdates = partialValidator.parse(data_to_be_validated);

    //**************************stooppreddd hereee!!! *******/
    //Handle Media Logic
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
                console.error("Failed to delete old image (non-fatal):", err);
            }
        }

        // D. Save the NEW public_id to the sidecar table
        await SavePostMediaInfo(numericId, uploadResult.public_id);
    }
    const updatedPost = await UpdatePost(numericId, testEmail1, validUpdates); 

    if (!updatedPost) {
        return NextResponse.json({ message: "Post not found or could not be updated" }, { status: 404 });
    }
    return NextResponse.json(updatedPost); //if couldnt update post

}


//deleting a specific post!!
 async function delete_Post_Handler (request, context){

    const { params } = await context;
    const { id } = await params;
    const numericId = Number(id);

    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id from params: ",id);       //debugging purposes

   //validate ID
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
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
    // query db 
    await DeletePost(numericId);
    return NextResponse.json({ message: "Post deleted successfully" });  
}


export const GET = errorHandlerMiddleware(get_Post_Handler);

export const PATCH = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Post_Handler);



