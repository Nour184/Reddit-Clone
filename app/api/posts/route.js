import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { feedPaginationValidator, postValidator } from '@utils/validators';
import { GetCommunity } from '@utils/crud/community_crud';
import {CreatePost ,GetCommunityPosts,
    GetPostsCreatedByUser, GetPublicFeedPosts,
    GetPersonalizedFeedForLoggedInUser , SavePostMediaInfo,
    ClearPostMediaInfo,GetBatchUserVotes} from '@utils/crud/post_crud';
import { GetUser } from '@utils/crud/user_crud';
import cloudinary from '@services/cloudinary';

import { auth } from '@services/auth';

//GET method
//get all posts 1) for a normal feed to a specific user , 2) for a specific community 
// , 3) the posts created by that user only 
 async function get_Posts_Handler(request,response){
    
    const session = await auth();
    const isLoggedIn = Boolean(session?.user);
    const userEmail = session?.user?.email;

    const { searchParams } = request.nextUrl;

    const communityName = searchParams.get('communityName');
    const myPosts = searchParams.has('myPosts');
    const cursor = searchParams.get('cursor');
    const targetEmail = searchParams.get('Email'); // username for which get all the posts of

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
    //fetch users made posts
    else if (myPosts) {
        // If a username is provided, fetch by that. Otherwise, fallback to logged-in user
        if (targetEmail) {
            posts = await GetPostsCreatedByUser(targetEmail, fetchLimit, validCursor);
        } else if (isLoggedIn) {
            posts = await GetPostsCreatedByUser(userEmail, fetchLimit, validCursor);
        } else {
            return NextResponse.json({ error: "No user specified" }, { status: 400 });
        }
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
    if (isLoggedIn && posts.length > 0) {
        try {
            const postIds = posts.map(p => p.post_id);
            const userVotes = await GetBatchUserVotes(userEmail, postIds);
            const voteMap = {};   
            userVotes.forEach(v => {
                voteMap[v.post_id] = v.flag;
            });

            //Attach the 'user_vote' property to each post object
            posts = posts.map(p => ({
                ...p,
                // If found in map, use flag (1/-1), otherwise null
                user_vote: voteMap[p.post_id] || null 
            }));

        } catch (error) {
            console.error("Failed to enrich feed with votes", error);
        }
    }

    // Enrich posts with usernames
    const uniqueEmails = [...new Set(posts.map(p => p.user_email).filter(Boolean))];
    const usernameMap = {};
    
    await Promise.all(
        uniqueEmails.map(async (email) => {
            try {
                const user = await GetUser(email);
                if (user) {
                    usernameMap[email] = user.username;
                }
            } catch (error) {
                console.error(`Error fetching username for ${email}:`, error);
            }
        })
    );

    // Add usernames to posts
    const enrichedPosts = posts.map(post => ({
        ...post,
        username: usernameMap[post.user_email] || null
    }));
  
  if (enrichedPosts && enrichedPosts.length > limit) {
    enrichedPosts.pop(); // Remove the 9th item (it was just for checking)
    const lastPost = enrichedPosts[enrichedPosts.length - 1];       
    nextCursor = lastPost ? lastPost.created_on : null; 
    } else {
      nextCursor = null;
    }
    //return posts fetched
    return NextResponse.json({
        FeedData: enrichedPosts,
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

    const postInfo = await request.formData(); //get the data sent 

    const community_name = postInfo.get("community_name");
    const title = postInfo.get("title");
    const body = postInfo.get("body")|| undefined;
    const media = postInfo.get("media");  //this can be a file or a string for the link directly
    const data_to_be_validated = {community_name,title,body};

    const validationResult = postValidator.safeParse(data_to_be_validated); //validate incoming post data 
    if (!validationResult.success) { //return error msgs from zod if violation found!!
      return NextResponse.json(
      { error: "Invalid input",
        issues: validationResult.error.flatten().fieldErrors,},{ status: 400 });
    }

    const validPostInfo = validationResult.data;
    //check if community even exists!!
    let communityExists = await GetCommunity(validPostInfo.community_name);
    if (!communityExists) {
      return NextResponse.json({ message: "Community not found!" }, { status: 404 });
    }

    //*******************************media logic********************************\\
    let mediaUrl = null;
    let mediaPublicId = null;

    if (media) {
      //case 1: file upload
      if (typeof media === 'object' && media.size > 0) {
        console.log("File detected. Uploading to Cloudinary...");
        const uploadResult = await uploadToCloudinary(media);
            
        mediaUrl = uploadResult.url;
        mediaPublicId = uploadResult.public_id;
      } 
        //case 2: url string
      else if (typeof media === 'string' && media.startsWith('http')) { //check if its a valid url (starts with http)
        console.log("URL string detected. Using directly...");
        mediaUrl = media;
        // no public_id for external urls saved (they need to be handled by frontend)
      }
    }

    //if community exists and data is validated create post
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
