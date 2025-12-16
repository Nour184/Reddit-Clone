import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {  GetUser,DeleteUser,SetAboutMe ,SetPfp ,SaveUserMediaInfo, GetUserMediaInfo} from '@utils/crud/user_crud';
import cloudinary from '@services/cloudinary';
import { auth } from '@services/auth';


async function get_Profile_Handler(request) {

  const session = await auth();
  if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email; //get email from auth!!
  if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

    //query db
  const user = await GetUser(email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
    // Return the user object
    return NextResponse.json(user, { status: 200 });
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

async function patch_Profile_Handler(request) {

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
    

  let email = session.user.email; //get email from auth
  const aboutMe = formData.get("about_me");
  const media = formData.get("media");

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  if (aboutMe !== null) await SetAboutMe(email, aboutMe);
  if (media && media.size > 0) {

    console.log("uploading now....");
    const uploadResult = await uploadToCloudinary(media); 
  
    await SetPfp(email, uploadResult.url);
    await SaveUserMediaInfo(email, uploadResult.public_id);//update public id of photo
  }
  return NextResponse.json({ success: true });
}


async function delete_user(request) {

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email = session.user.email; //get from auth 
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const mediaInfo = await GetUserMediaInfo(email);
  if (mediaInfo && mediaInfo.public_id) {
    try {
      await cloudinary.uploader.destroy(mediaInfo.public_id);
      console.log(`Deleted Cloudinary image: ${mediaInfo.public_id}`);
    } catch (err) {
      console.error("Failed to delete Cloudinary image:", err);
      //delete the user anyway
    }
  }
  await DeleteUser(email); //delete user from db

  return NextResponse.json({ success: true, message: "User and data deleted" });

}


export const GET = errorHandlerMiddleware(get_Profile_Handler);

export const PATCH = errorHandlerMiddleware( patch_Profile_Handler);
export const DELETE = errorHandlerMiddleware(delete_user);
