import { z } from "zod";


//validate the feed pagination values sent by frontend
export const feedPaginationValidator  = z.object({
    limit: z.number().int().min(1).max(15).default(3), //####change default to 8 later 
    cursor: z.string().optional()     //optinal just for the sake of the first fetch!!
});

//TODO: mainly those down here for now !!

//validate post passed data
export const postValidator = z.object({
    title: z.string().min(1).max(300),
    body: z.string().optional(),
    community_name: z.string().min(1).max(100),
    picture_link: z.string().optional().nullable() //check what format to use for this field
  
});


//validate comment passed data



//validate votes passed data 


