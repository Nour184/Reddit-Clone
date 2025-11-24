// THIS IS CALLED BY THE FRONTEND TO FETCH ALL POSTS FOR EXAMPLE FOR THE HOME FEED !!
import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//import { responseMiddleware } from '@services/middlewareHandlers/responseMiddleware';
//dummy data to simulate posts
import { mockData } from '@services/mockData';


//GET method
//get all posts 1) for a normal feed to a specific user , 2) for a specific community 
// , 3) the posts created by that user only 
 async function get_Posts_Handler(request){
    //=========================MOCKSSSS REMOVE ITTT=====================================\\
    const loggedINUser = true;
    const loggedInUserEmail = 'alice@user.com';
    let filter = {};


        const url = new URL(request.url);
        const communityName = url.searchParams.get('communityName');
        const userMail = url.searchParams.get('author');

      // Filter 1: Get posts for a specific Community (e.g., /api/posts?communityName=r/NextjsDevs)
      if(communityName){ filter.communityName = communityName;}

      // Filter 2: Get posts by a specific Author (e.g., /api/posts?author=alice@user.com)
      if(userMail){filter.UserMail = userMail;}

      // Filter 3: Default Feed Logic (e.g., /api/posts)....we can personalize this feed with some logic 
      // If no specific filter is applied, you can personalize the default feed.
  // else {
  //   // Example: Show posts from communities the loggedInUserEmail has joined
  //   // (Requires fetching the joined list from your JoinedCommunity model)
  //   // filter.communityName = { $in: [list of joined communities] };
  // }
       else{
    // This requires simulating the JOIN operation to get the list of community names.
    // Find all communities the user has joined:
    const joinedCommunitiesList = mockData.JoinedCommunities
      .filter(join => join.userEmail === loggedInUserEmail)
      .map(join => join.communityName);
    
    if (joinedCommunitiesList.length > 0) {
        // Add the $in operator to the filter object (MongoDB logic simulation)
        // This tells the database: 'communityName' must be IN the list provided.
        filter.communityName = { $in: joinedCommunitiesList };
     }
    }

    
   // 4. Apply the constructed filter to the entire dataset (simulating the DB query)
   let finalPosts = mockData.Posts;

   if (Object.keys(filter).length > 0) {
    // Filter the mock data based on the properties in the 'filter' object.
    finalPosts = finalPosts.filter(post => {
        
        // 1. Check for filtering by a specific Author (Scenario 2)
        // If filter.userEmail exists, the post's email must match.
        if (filter.UserMail && post.userEmail !== filter.UserMail) {
            return false;
        }

        // 2. Check for filtering by Community (Scenarios 1 & 3)
        if (filter.communityName) {
            const communityFilter = filter.communityName;

            // If it's a simple string, it's Scenario 1 (Equality check)
            if (typeof communityFilter === 'string') {
                if (post.communityName !== communityFilter) return false;
            } 
            
            // If it's an object with $in, it's Scenario 3 (Array inclusion check)
            else if (communityFilter['$in']) {
                // Check if the post's communityName is NOT included in the $in array.
                if (!communityFilter['$in'].includes(post.communityName)) return false;
            }
        }
        
        // If the post passes all checks, include it.
        return true;
    });
    }
    finalPosts.sort((a, b) => b.createdAt - a.createdAt);
    
    // 4. Execute the flexible MongoDB query      <<<<=============== UNCOMMENT when database Models are available!!
    //const posts = await PostModel.find(filter) // Use the constructed filter
    //.select('title body userEmail communityName voteScore')
    //.sort({ createdAt: -1 }) //show the newest first!!!
    //.limit(50);

      return NextResponse.json(finalPosts);

}

//helper function <----------ALERT!!!!! DELETE IT WHEN USING vod LIB !!!!!
function validatePostCreation(postInfo){
  
 // ALERT!!!! am i responsile for handling the the posts id here or what exactly does it et incremented on its own !!
    

    //*******************required fields validation******************\
    if (!(postInfo.userEmail)|| !(postInfo.communityName) || !(postInfo.title) || !(postInfo.body)) {
        console.error("Validation Error: Missing required fields (userEmail, communityName, title, body).");
        return false;
    }

    //**********************email validation****************************\
    if (typeof (postInfo.userEmail) !== 'string') {
        console.error("Validation Error: userEmail must be a string.");
        return false;
    }
    // Basic regex pattern for email format (not exhaustive, but good start)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test((postInfo.userEmail))) {
        console.error("Validation Error: Invalid userEmail format.");
        return false;
    }

    //*******************community name validation **************************\
    if (typeof (postInfo.communityName) !== 'string') {
        console.error("Validation Error: communityName must be a string.");
        return false;
    }
    // Allows letters, numbers, and underscores/hyphens.
    const communityRegex = /^r\/[a-zA-Z0-9_-]+$/;
    if (!communityRegex.test((postInfo.communityName))) {
        console.error("Validation Error: communityName must start with 'r/' and contain valid characters.");
        return false;
    }

    //******************title validation***************************\
    if (typeof (postInfo.title) !== 'string') {
        console.error("Validation Error: title must be a string.");
        return false;
    }
    // Check length constraints (e.g., min 5, max 300)
    if ((postInfo.title).length < 5 || (postInfo.title).length > 300) {
        console.error("Validation Error: Title must be between 5 and 300 characters.");
        return false;
    }
    //********************body validation***************************\
    if (typeof (postInfo.body) !== 'string') {
        console.error("Validation Error: body must be a string.");
        return false;
    }
    // Check length constraints (e.g., min 10, max 40,000)
    if ((postInfo.body).length < 10 || (postInfo.body).length > 40000) {
        console.error("Validation Error: Body must be between 10 and 40,000 characters.");
        return false;
    }

    //************************picture link validation****************\
    if (postInfo.pictureLink !== null && typeof postInfo.pictureLink !== 'undefined') {
        if (typeof postInfo.pictureLink !== 'string') {
            console.error("Validation Error: pictureLink must be a string or null.");
            return false;
        }
    }
    //if data is validated
    return true;
}


//POST method --> to create a new post
 async function post_Posts_Handler(request){
 
        //get the body of the request msg 
        const postInfo = await request.json();
        if(!validatePostCreation(postInfo)){
            //for invalid data!!
          return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }
    
        const newPost = {
            postID :'post-103', //hardcoded just for testing purposes !!
            userEmail: postInfo.userEmail,
            communityName: postInfo.communityName,
            title: postInfo.title,
            body: postInfo.body,
            pictureLink: postInfo.pictureLink,
            createdAt: new Date()
        }
        mockData.Posts.push(newPost); //ALERT!!!((DONT FORGET THIS PART WHEN DB IS READY!!!!!!!!!!!!!!!!))
        //if valid add the new post to db  ALERT!!!((DONT FORGET THIS PART WHEN DB IS READY!!!!!!!!!!!!!!!!))

        return NextResponse.json(newPost, { status: 201 }); //assume success msg is 201

}


export const GET = errorHandlerMiddleware(get_Posts_Handler);

export const POST = errorHandlerMiddleware( post_Posts_Handler);
