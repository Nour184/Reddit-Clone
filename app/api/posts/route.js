import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { feedPaginationValidator, postValidator } from '@utils/validators';
import { GetAllCommunities , CreateCommunity , GetCommunity } from '@utils/crud/community_crud';
import {CreatePost ,GetCommunityPosts,
    GetPostsCreatedByUser, GetPublicFeedPosts,
    GetPersonalizedFeedForLoggedInUser} from '@utils/crud/post_crud';
import cloudinary from '@services/cloudinary';

//used in testing before authentication
 const testEmail1 = 'JohnDoe@example.com';
 const testEmail2 = 'hamdahelal@forfun.com';

//GET method
//get all posts 1) for a normal feed to a specific user , 2) for a specific community 
// , 3) the posts created by that user only 
 async function get_Posts_Handler(request,response){
    
    let isLoggedInUser = true; //hard coded just for testing !!
    const loggedInUser = testEmail1; //hard coded just for testing !!
    
    const url = new URL(request.url);
    const communityName = url.searchParams.get('communityName');
    const myPosts = url.searchParams.has('myPosts');
    const cursor = url.searchParams.get('cursor');
    let posts = {}; //posts to be returned
    let nextCursor = null;//cursor to be retunrd

    //************************************validate pagination params********************************//
    //let the limit = 8 for now (its default value)
    const limit = 3; //######change to 8 again later!!
    let  validLimit,validCursor ;
    try{
        const validatedParams = feedPaginationValidator.parse({limit,cursor: cursor || undefined});
        validLimit = validatedParams.limit;
        validCursor = validatedParams.cursor || null;
    }catch(error){
        console.log("data validation error",error);
    }

    //************************************logic to fetch posts**************************************//

    //fetch public feed posts for not logged in users
    if(!isLoggedInUser){         
        //TODO:
        //need to validate the limit(if gonna be even passed) and the cursor they pass!!
        //use feedPaginationValidator() from validation file
        //let the limit = 8 for now (its default value)
        posts = await GetPublicFeedPosts(validLimit +1 ,validCursor); //+1 to check if there are new posts to return

        if(posts.length > validLimit){ 
           posts.pop();  //remove last post since it exists
           const lastPost = posts[posts.length - 1];        
           nextCursor = lastPost.created_on; //set cursor to the last post created_on timestamp
        }
        else{ 
            //leave nextCursor = null -> to make sure infinite scrolling works right 
            nextCursor = null;
        }
    }

    /*
      TODO:
      implement GetPersonalizedFeedForLoggedInUser() in crud operations with cursor style pagination
    */
    //else if(isLoggedInUser){
    //    posts = await GetPersonalizedFeedForLoggedInUser(loggedInUser);
    //}
    /*
      TODO:
      implement GetCommunityPosts() in crud operations with cursor style pagination 
    */
    else if(communityName /*&& isLoggedInUser*/){
        //get posts for that specific community
        posts = await GetCommunityPosts(communityName, validLimit ,validCursor); 
        const lastPost = posts[posts.length -1];
        nextCursor = lastPost? lastPost.created_on : null; //set cursor to timestamp that posts will be fetched with next
    }
    /*frontend should pass the user email that they want to fetch their posts
      (as they dont have to be the loggedInUser butt just a normal user)
      TODO:
      see how do i get the user email from the frontend in a secure way!!
      also implement GetPostsCreatedByUser() in crud operations with cursor style pagination
    */
    else if (myPosts /*&& isLoggedInUser*/){       
        console.log("the problem is caught it !!!!!"); 
        posts = await GetPostsCreatedByUser(loggedInUser,validLimit,validCursor);
        const  lastPost = posts[posts.length -1];
        nextCursor = lastPost? lastPost.created_on : null; //set cursor to timestamp that posts will be fetched with next
    }

    else if(!myPosts){ 
        console.log("caught it !!!!!");
    }

    
    //return the posts fetched
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
          type: result.resource_type // Returns 'image' or 'video'
        });
      }
    ).end(buffer);
  });

}
//TODO: add authentication just to get user email!! 
//POST method --> to create a new post (returns the  id of the created post)
 async function post_Posts_Handler(request,response){

    const postInfo = await request.formData();

    const community_name = postInfo.get("community_name");
    const title = postInfo.get("title");
    const body = postInfo.get("body");
    const media = postInfo.get("media");
    const data_to_be_validated = {community_name,title,body}

    const validPostInfo = postValidator.parse(data_to_be_validated); //validate incoming post data 

    //check if community exists!!
    let communityExists = await GetCommunity(validPostInfo.community_name);
    if (!communityExists) {
        return NextResponse.json({ message: "Community not found!" }, { status: 404 });
    }

    if (media && media.size > 0) {
            // Call uploader helper
            console.log("uploading now....");
            const uploadResult = await uploadToCloudinary(media);  

            mediaUrl = uploadResult.url; //return this to frontend and save it in db
        }
    //if exists and data is validated create post
    const newPost = await CreatePost( testEmail2, validPostInfo.community_name, validPostInfo.title, validPostInfo.body,mediaUrl);
    return NextResponse.json(newPost, { status: 201 });

}

export const GET = errorHandlerMiddleware(get_Posts_Handler);

export const POST = errorHandlerMiddleware( post_Posts_Handler);
