import { NextResponse } from "next/server";

/*
 Now all errors return a clean response and  No need to write try/catch everywhere
*/
export  function errorHandlerMiddleware(callee){ //takes the handled function itself as sn input
    return async function  (request , context) {
        try{

            return await callee (request , context);

        }catch(err){
            console.error(err);
            return NextResponse.json( { error: "Internal Server Error" }, { status: 500 });
        }
    };
}