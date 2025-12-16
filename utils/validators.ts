import { z } from "zod";


//validate the feed pagination values sent by frontend
export const feedPaginationValidator  = z.object({
    limit: z.number().int().min(1).max(15).default(3), //####change default to 8 later 
    cursor: z.string().optional()     //optinal just for the sake of the first fetch!!
});

//TODO: mainly those down here for now !!

//validate post's passed data
export const postValidator = z.object({
    title: z.string().min(1).max(300),
    body: z.string().optional(),
    community_name: z.string().min(1).max(100),
   // picture_link: z.string().optional().nullable() //check what format to use for this field
});


//validate comment's passed data
export const commentsValidator = z.object({
    post_id: z.number().int(),
    body: z.string().min(1).max(2000)
});


//validate votes passed data 
export const votesValidator = z.object({
    post_id: z.number().int(),
    flag: z.union([z.literal(1), z.literal(-1)]) //make sure flag is either 1 or -1 only
});


export const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});