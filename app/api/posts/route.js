import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { feedPaginationValidator, postValidator } from '@utils/validators';
import { GetAllCommunities , CreateCommunity , GetCommunity } from '@utils/crud/community_crud';
import {CreatePost ,GetCommunityPosts,
    GetPostsCreatedByUser, GetPublicFeedPosts,
    GetPersonalizedFeedForLoggedInUser , SavePostMediaInfo} from '@utils/crud/post_crud';
import cloudinary from '@services/cloudinary';

import { auth } from '@services/auth';

//GET method
//get all posts 1) for a normal feed to a specific user , 2) for a specific community 
// , 3) the posts created by that user only 
 async function get_Posts_Handler(request,response){
    
    const session = await auth();
    const isLoggedIn = Boolean(session?.user);
    const userEmail = session?.user?.email;
    
    const url = new URL(request.url);
    const communityName = url.searchParams.get('communityName');
    const myPosts = url.searchParams.has('myPosts');
    const cursor = url.searchParams.get('cursor');
    let posts = []; //posts to be returned
    let nextCursor = null;//cursor to be returned from frontend

  
    //************************************validate pagination params********************************//
    let validCursor = cursor || null;
    const limit = 8; //let it be constant 8 wont let frontend choose

    const fetchLimit = limit + 1;
  

    //************************************fetch posts logic**************************************//

    //fetch community posts
    if (communityName) {
        posts = await GetCommunityPosts(communityName, fetchLimit, validCursor);
    }
    //fetch users made posts (requires user to be logged in)
    else if (myPosts) {
      if (!isLoggedIn) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      posts = await GetPostsCreatedByUser(userEmail, fetchLimit, validCursor);
    }

    else {
      if (isLoggedIn) {
        // Now fetches Joined Posts + Viral Posts
        posts = await GetPersonalizedFeedForLoggedInUser(userEmail, fetchLimit, validCursor);
      } else {
        // Logged out users just see everything (Public Feed)
        posts = await GetPublicFeedPosts(fetchLimit, validCursor);
      }
    }
  
  if (posts && posts.length > limit) {
    posts.pop(); // Remove the 9th item (it was just for checking)
    const lastPost = posts[posts.length - 1];       
    nextCursor = lastPost ? lastPost.created_on : null; 
    } else {
      nextCursor = null;
    }
    //return posts fetched
    return NextResponse.json({
        FeedData: posts,
        meta: {
        nextCursor: nextCursor
        }
    });
}

//helper to upload to cloudinary
async function uploadToCloudinary(data){
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: "reddit-demo-posts",
        resource_type: "auto" //Auto-detect if image or video
      }, 
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          public_id: result.public_id, //get media public ip
          type: result.resource_type // Returns 'image' or 'video'
        });
      }
    ).end(buffer);
  });

}

//POST method --> to create a new post (returns the  id of the created post)
 async function post_Posts_Handler(request,response){
    //authorize user 
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const postInfo = await request.formData();

    const community_name = postInfo.get("community_name");
    const title = postInfo.get("title");
    const body = postInfo.get("body")|| undefined;
    const media = postInfo.get("media");
    const data_to_be_validated = {community_name,title,body};

    const validPostInfo = postValidator.parse(data_to_be_validated); //validate incoming post data 

    //check if community exists!!
    let communityExists = await GetCommunity(validPostInfo.community_name);
    if (!communityExists) {
        return NextResponse.json({ message: "Community not found!" }, { status: 404 });
    }
    let mediaUrl = null;
    let mediaPublicId = null;

    if (media && media.size > 0) {
      // Call uploader helper
      console.log("uploading now....");
      const uploadResult = await uploadToCloudinary(media);  

      mediaUrl = uploadResult.url; //return this to frontend and save it in db
      mediaPublicId = uploadResult.public_id;
    }
    //if exists and data is validated create post
    const newPost = await CreatePost( email, validPostInfo.community_name, validPostInfo.title, validPostInfo.body,mediaUrl);
    //save the media public ip in db
    if (mediaPublicId && newPost ) {
      await SavePostMediaInfo(newPost, mediaPublicId);
   } 
   return NextResponse.json({  //return succ msgS
    post_id: newPost,
    message: "Post created successfully" }, { status: 201 });

}

export const GET = errorHandlerMiddleware(get_Posts_Handler);

export const POST = errorHandlerMiddleware( post_Posts_Handler);
