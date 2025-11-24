import { NextResponse } from "next/server";


//ensuring every successful response has a consistent format
export function responseMiddleware(callee){ //takes the function that calls it as a parameter

    return async (request, context) =>{
        const responseToSend =  await callee(request, context); //wait for the returned response from the callee function
        if (responseToSend instanceof NextResponse){ return response;
        }

        //standarize the successfull msg sent from all api's
        return NextResponse.json({message: 'success', data: responseToSend }, 
         { status: 200 });
    };
}
