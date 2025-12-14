// THIS IS CALLED BY THE FRONTEND TO FETCH ALL POSTS FOR EXAMPLE FOR THE HOME FEED !!
import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//import { responseMiddleware } from '@services/middlewareHandlers/responseMiddleware';

import { GetAllCommunities , CreateCommunity } from '@utils/crud/community_crud';
import {CreatePost, GetPost , GetPostsCreatedByUser, GetPublicFeedPosts, GetPersonalizedFeedForLoggedInUser} from '@utils/crud/post_crud';

 const testEmail1 = 'JohnDoe@example.com';
 const testEmail2 = 'hamdahelal@forfun.com';

//GET method
//get all posts 1) for a normal feed to a specific user , 2) for a specific community 
// , 3) the posts created by that user only 
 async function get_Posts_Handler(request){


    //const posts =await GetPostsCreatedByUser(testEmail1);//hard coded just for testing the just created post !!
    //const posts = await GetPublicFeedPosts();
    const posts = await GetPersonalizedFeedForLoggedInUser(testEmail1);//hard coded just for testing!!
    return NextResponse.json(posts);

}


/*
stuff to be made :
1)validate  incoming post data
2)check if the community exists before creating the post
3)authentication to get the user creating the post      <-----------totty hay3mlha
*/ 
//POST method --> to create a new post
 async function post_Posts_Handler(request){



    let postInfo = await request.json();
    const newPost = await CreatePost(postInfo.userEmail, postInfo.communityName, postInfo.title, postInfo.body, null);
    return NextResponse.json(newPost, { status: 201 });

}


export const GET = errorHandlerMiddleware(get_Posts_Handler);

export const POST = errorHandlerMiddleware( post_Posts_Handler);
