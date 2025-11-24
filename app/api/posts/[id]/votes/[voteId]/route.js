import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
//dummy data to simulate db
import { mockData } from '@services/mockData';
/*
dont know if i should implement the patch request here or what !!
delete a specific vote + handle switching between upvotes and downvotes !!
*/


 async function get_Vote_Handler (request , { params }){

/*
query db for tha specific vote(wether its a down vote or an upvote) 
based on the user id -> to show the the upvote or doen vote symbol in frontend
*/


}



//delete a specific vote...approach: first check wether its an upvote or a down vote 
async function delete_Vote_Handler(request , { params }){ /*implement */}



export const GET = errorHandlerMiddleware(get_Vote_Handler);

//dont know if i should implement the patch request here or what !!
//export const POST = errorHandlerMiddleware( patch_Post_Handler);

export const DELETE = errorHandlerMiddleware( delete_Vote_Handler);