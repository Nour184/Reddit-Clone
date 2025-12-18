import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { GetPost, UpdatePost, DeletePost,GetPostMediaInfo,
         SavePostMediaInfo, ClearPostMediaInfo} from '@utils/crud/post_crud';
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
          type: result.resource_type // Returns media type image or video
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
    //console.log("this is the params recieved: ",params);   //debugging purposes
    //console.log("this is the id from params: ",id);       //debugging purposes
    const numericId = Number(id);
    //validate ID first
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 }); //bad req
    }

    //check if post exists in the first place 
    const existingPost = await GetPost(numericId);
    if (!existingPost) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    //check if user owns the post in the first place
    if (existingPost.user_email !== email) { 
        return NextResponse.json({ error: "You do not have permission to edit this post" }, { status: 403 });
    }
    //extract data
    const postInfo = await request.formData();
    const title = postInfo.get("title");
    const body = postInfo.get("body");
    const media = postInfo.get("media"); //could be a file or a url to the photo

    const data_to_be_validated = {};
    if (title) data_to_be_validated.title = title;
    if (body !== null) data_to_be_validated.body = body;

    const partialValidator = postValidator.partial();
    const validUpdates = partialValidator.parse(data_to_be_validated);

    //*******************************media logic**************************\\
    if (media) {
        //clean old media info first (public id)
        const oldMediaInfo = await GetPostMediaInfo(numericId);    
        if (oldMediaInfo && oldMediaInfo.public_id) {
            try {
                await cloudinary.uploader.destroy(oldMediaInfo.public_id);
                console.log("Deleted old image from Cloudinary");
            } catch (err) {
                console.error("Failed to delete old image:", err);
            }
        }
    //handle new media now after cleaning old one
    if (typeof media === 'object' && media.size > 0) {
            //scenario 1: file upload
            console.log("New file detected. Uploading...");
            const uploadResult = await uploadToCloudinary(media);           
            //update post content
            validUpdates.picture_link = uploadResult.url;     

            await SavePostMediaInfo(numericId, uploadResult.public_id); //save new cloudinary public id in db

        } else if (typeof media === 'string' && media.startsWith('http')) {
            //scenario 2: url string
            console.log("URL string detected. Using it directly...");           
            //update post content
            validUpdates.picture_link = media;  
            //Clear old Cloudinary ID (public id) from the db
            await ClearPostMediaInfo(numericId);
        }
    }
    const updatedPost = await UpdatePost(numericId, email, validUpdates); //update db now

    if (!updatedPost) { //post not found or couldnt update it
        return NextResponse.json({ message: "Post not found or could not be updated" }, { status: 404 });
    }
    return NextResponse.json(updatedPost); //if post updated successfully

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

    //console.log("this is the params recieved: ",params);   //debugging purposes
    //console.log("this is the id from params: ",id);       //debugging purposes

   //validate ID
    if (!id || !Number.isInteger(numericId)) {
        return NextResponse.json({ message: "Invalid Post ID" }, { status: 400 });
    }
    const mediaInfo = await GetPostMediaInfo(numericId);
    //check if user owns the post
    const deletionSuccess = await DeletePost(numericId, email);  // query db 
    if (!deletionSuccess) {
        return NextResponse.json({ message: "Post not found or user do not have permission to delete it" }, { status: 400 });
    }

    if (mediaInfo && mediaInfo.public_id) {
        try {
            await cloudinary.uploader.destroy(mediaInfo.public_id);
            console.log("Deleted post image from Cloudinary");
        } catch (err) {
            console.error("Failed to delete image:", err);
        }
    }
    // post deleted successfully
    return NextResponse.json({ message: "Post deleted successfully" });  
}


export const GET = errorHandlerMiddleware(get_Post_Handler);

export const PATCH = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Post_Handler);



