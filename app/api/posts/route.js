import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { feedPaginationValidator, postValidator } from '@utils/validators';
import { GetAllCommunities , CreateCommunity , GetCommunity } from '@utils/crud/community_crud';
import {CreatePost ,GetCommunityPosts,
    GetPostsCreatedByUser, GetPublicFeedPosts,
    GetPersonalizedFeedForLoggedInUser} from '@utils/crud/post_crud';

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


/*
stuff to be made :
1)validate  incoming post data    (DONE)
2)check if the community exists before creating the post  (DONE)
3)authentication to get the email of user creating the post      <-----------totty hay3mlha
*/ 
//POST method --> to create a new post (returns the  id of the created post)
 async function post_Posts_Handler(request,response){

    const postInfo = await request.json();
    const validPostInfo = postValidator.parse(postInfo); //validate incoming post data 

    //first check the existance of the community
    let communityExists = await GetCommunity(validPostInfo.community_name);
    if(!communityExists){ return NextResponse.json({ message: "No Post with this ID found!!" }, { status: 404 }); }
    //if exists and data is validated create post
    const newPost = await CreatePost( testEmail2, validPostInfo.community_name, validPostInfo.title, validPostInfo.body, validPostInfo.picture_link);
    return NextResponse.json(newPost, { status: 201 });

}


export const GET = errorHandlerMiddleware(get_Posts_Handler);

export const POST = errorHandlerMiddleware( post_Posts_Handler);
