import { NextResponse } from "next/server";
import { errorHandlerMiddleware } from '@services/middlewareHandlers/errorHandlerMiddleware';
import { CreateUser, GetUser } from '@utils/crud/user_crud';

import {  GetJoinedCommunities } from '@utils/crud/joined_communities_CRUD';
import {CreateCommunity , GetAllCommunities} from '@utils/crud/community_crud'
import {JoinCommunity } from '@utils/crud/joined_communities_CRUD';

 const testEmail1 = 'JohnDoe@example.com';
 const testEmail2 = 'hamdahelal@forfun.com';
//temp create a user to use for testing db operations!!!! 

//export async function POST(req,res){
//    const testEmail = 'JohnDoe@example.com';
//    const testUsername = 'JohnDoe';
//    const testPassword = 'JohnDoe123';    
//    const newUser = await  CreateUser(testEmail, testUsername, testPassword);
//    return NextResponse.json(newUser, { status: 201 });
//} 

//dump to create cummunites for testing
export async function POST(request,response){
    //const user = await CreateUser(testEmail2, 'hamo', 'hamo123');
    //const community1 = await CreateCommunity('programming', 'A community for programming enthusiasts',null, testEmail2);
    //const community2 = await CreateCommunity('music', 'A community for music lovers',null, testEmail1);
    //const community1 = await JoinCommunity(testEmail1,'programming');

    return NextResponse.json({community1}, { status: 201 });
}



export async function GET(req,res){
   
   // const user = await GetUser(testEmail);
 //  try{
   // return NextResponse.json(user);
   //}catch(err){ 
   // console.log(err);
  // }

  const allCommunities = await GetAllCommunities();
  //const joinedCummunities  = await GetJoinedCommunities(testEmail1);
    try{
       return NextResponse.json(allCommunities);
   }catch(err){ 
    console.log(err);
   }
    
}