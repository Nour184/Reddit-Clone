import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import {  GetUser,DeleteUser,SetAboutMe ,SetPfp ,SaveUserMediaInfo,ClearUserMediaInfo, GetUserMediaInfo} from '@utils/crud/user_crud';
import {profileValidator} from '@utils/validators';
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
  const aboutMe_to_be_validated = formData.get("about_me");
  const media = formData.get("media");

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const dataToValidate = {
      about_me: aboutMe_to_be_validated === null ? undefined : aboutMe_to_be_validated
  };
  const validationResult = profileValidator.safeParse(dataToValidate); //validate using zod

  if (!validationResult.success) { //return zod errors
    return NextResponse.json({
      error: "Invalid input",
      issues: validationResult.error.flatten().fieldErrors
    }, { status: 400 });
  }
  const validData = validationResult.data; //valid data
  if (validData.about_me !== undefined) {  //if about me is present query db
    await SetAboutMe(email, validData.about_me); //query db
  }  

//media logic
 if (media) {
    // CLEANUP: Delete the OLD image from Cloudinary first.
    //do it whether the new media is a hard file OR a URL string.
    const oldMediaInfo = await GetUserMediaInfo(email);

    if (oldMediaInfo && oldMediaInfo.public_id) {
        console.log("Found old Cloudinary image. Deleting:", oldMediaInfo.public_id);
        try {
            await cloudinary.uploader.destroy(oldMediaInfo.public_id);
        } catch (err) {
            console.error("Failed to delete old image from Cloudinary:", err);
            //continue anyway so the users profile still updates
        }
    }

    //handle the new media 
    if (typeof media === 'object' && media.size > 0) {
        //SCENARIO 1: its a file upload 
        console.log("File detected. Uploading to Cloudinary...");
        
        const uploadResult = await uploadToCloudinary(media);
        await SetPfp(email, uploadResult.url);
        // Save the new Public ID so we can delete it later
        await SaveUserMediaInfo(email, uploadResult.public_id);

    } else if (typeof media === 'string' && media.startsWith('http')) {
        //SCENARIO 2:frontend sends URL String
        console.log("URL string detected. Saving directly to DB...");
        
        await SetPfp(email, media);
        //remove old public_id from the database
        await ClearUserMediaInfo(email);
    }
  }
  return NextResponse.json({ message: "Successful profile update" });
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

  await ClearUserMediaInfo(email); //delete user entry(if present) in the user_media_info table

  await DeleteUser(email); //delete user from db

  return NextResponse.json({ success: true, message: "User and data deleted successfully" });

}


export const GET = errorHandlerMiddleware(get_Profile_Handler);

export const PATCH = errorHandlerMiddleware( patch_Profile_Handler);
export const DELETE = errorHandlerMiddleware(delete_user);
