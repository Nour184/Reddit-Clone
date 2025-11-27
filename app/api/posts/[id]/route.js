import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//dummy data to simulate posts
import { mockData } from '@services/mockData';


//make a separatre function to be used by GET and DELETE to query the database when passed a specific post id !!!
//function Query_DB_For_Post(){}

//get a specific post 
 async function get_Post_Handler (request,{ params }){

        
    const { id } = await params;
    //const searchedPostID =  id;
    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id form params: ",id);       //debugging purposes
   // const postID = url.searchParams.get('PostID');
    //simulate querying the DB!!!
    const searchedPost = mockData.Posts.find(p => String(p.postID) === String(id));
    if(!searchedPost){return NextResponse.json({ message: "No Post with this ID found!!" }, { status: 404 });}//post not found
 

    return NextResponse.json(searchedPost);//post found 

    
}


//editing a specific post !!
 async function patch_Post_Handler (request , { params }){

    const { id } = await params;
    //ALERT!!!! UPDATE THE POST WITH THE SPECIFIED IF -> id WHEN CONNECTING DB

}


//deleting a specific post!!
 async function delete_Post_Handler (request, { params }){

    const { id } = await params;

    console.log("this is the params recieved: ",params);   //debugging purposes
    console.log("this is the id form params: ",id);       //debugging purposes
     //simulate querying the DB!!!
    const IndexOfpostToDelete = mockData.Posts.findIndex(p=> String(p.postID) === String(id));
    if(!IndexOfpostToDelete){ return NextResponse.json({ message: "No Post with this ID found!!" }, { status: 404 });}//post not found
    const deletedPost = mockData.Posts.splice(IndexOfpostToDelete,1); //array.splice(startIndex, deleteCount)=> returns an array of the deleted stuff

    return NextResponse.json({message:"post deleted successfully"},{deletedPost});

}

export const GET = errorHandlerMiddleware(get_Post_Handler);

export const POST = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Post_Handler);



