import pool, {Post} from "../interfaces";

const LIMIT_DEFAULT = 8; //######### change 3 to 8
/**
 * Creates a new post in the database.
 *
 * @param user_email - The user creating the post.
 * @param community_name - The community to post into.
 * @param title - The post title.
 * @param body - Optional body text.
 * @param picture_link - Optional image link.
 * @returns A promise resolving to the new post ID.
 */
export async function CreatePost(
    user_email: string,
    community_name: string,
    title: string,
    body?: string,
    picture_link?: string
): Promise<number> {
    try {
        const result = await pool.query(
            "SELECT create_post($1, $2, $3, $4, $5) AS post_id",
            [user_email, community_name, title, body ?? null, picture_link ?? null]
        );
        return result.rows[0].post_id;
    } catch (err) {
        console.error("Error creating post:", err);
        throw err;
    }
}

/**
 * Gets a post by its ID.
 *
 * @param post_id - The post ID.
 * @returns A Post object or null.
 */
export async function GetPost(post_id: number): Promise<Post | null> {
    try {
        const result = await pool.query(
            "SELECT * FROM get_post($1)",
            [post_id]
        );
        return result.rows[0] ?? null;
    } catch (err) {
        console.error("Error getting post:", err);
        throw err;
    }
}

/**
 * get posts inside a community using a cursor for pagination
 *
 * @param community_name - The community name.
 * @param limit - number of posts to fetch
 * @param cursor - the cursor timestamp to fetch posts created before that timestamp
 */
export async function GetCommunityPosts(community_name: string, limit: number = LIMIT_DEFAULT, cursor: string | null ): Promise<Post[]> {
    try {
        const safeLimit = limit || LIMIT_DEFAULT;
        const values = [community_name, safeLimit, cursor];
        const query = "SELECT * FROM get_community_posts($1,$2,$3)";
        const data = await pool.query(query,values);
        return data.rows;
    } catch (err) {
        console.error("Error getting community posts:", err);
        throw err;
    }
}
/* 
*/
export async function UpdatePost(
    post_id: number,
    user_email: string,
    updates: { title?: string; body?: string; picture_link?: string | null }
    ): Promise<Post[]> {
    try{
        const values = 
        [   post_id, 
            user_email, 
            updates.title || null,
            updates.body ?? null,
            updates.picture_link === undefined ? null : updates.picture_link
        ];
        const query = "SELECT * FROM update_post($1, $2, $3, $4, $5)";
        const data = await pool.query(query,values);
        return data.rows[0] || null;  //return null incase user doesnt even own the post
    }catch(error){
        console.error("Error updating post:", error);
        throw error;
    }
}

/*
  get all posts created by user
 */
export async function GetPostsCreatedByUser( user_email: string, limit: number = LIMIT_DEFAULT, cursor: string | null):Promise<Post[]>{
    try{
        const safeLimit = limit || LIMIT_DEFAULT;
        const values = [user_email, safeLimit, cursor];
        const query = "SELECT * FROM get_user_posts($1,$2,$3)";
        const data = await pool.query(query,values);
        return data.rows

    }catch(error){
        console.error("Error getting posts created by user:", error);
        throw error;
    }
}

/*
  gonna return posts for the feed using a cursor starting with 
  the newly added posts(with most recent timestamp)
 NOTE: limit is defaulted to 8 for later!!

 ###### DONT FORGET TO RETURN THE LIMIT DEFAI=ULT VALUE TO 8 AGAIN LATER!!
*/                                        
export async function GetPublicFeedPosts( limit: number = LIMIT_DEFAULT, cursor: string | null ):Promise<Post[]> {
    try {
        const safeLimit = limit || LIMIT_DEFAULT; 
        const query = "SELECT * FROM get_public_feed($1, $2)";
        const val = [safeLimit, cursor];
        const res = await pool.query(query,val);
        return res.rows;
    }catch(error){
        console.error("Error getting public feed posts:", error);
        throw error;
    }
}

//left cursor as an input incase i will leave the frontend specify it themselves!!
export async function GetPersonalizedFeedForLoggedInUser(user_email: string, limit: number = LIMIT_DEFAULT, cursor: string | null):Promise<Post[]>{
        try {
        const safeLimit = limit || LIMIT_DEFAULT; 
        const val = [user_email,safeLimit ,cursor];
        const result = await pool.query("SELECT * FROM get_personalized_feed($1,$2,$3)", val);
        return result.rows;
    }catch(error){
        console.error("Error getting personalized feed posts:", error);
        throw error;
    }
}




/**
 * Deletes a post from the database, but only if the user owns it.
 *
 * @param post_id - The post ID.
 * @param user_email - The email of the user attempting to delete.
 * @returns A promise resolving to true if deleted, false if not owned or not found.
 */
export async function DeletePost(post_id: number, user_email: string): Promise<boolean> {
    try {
        const result = await pool.query(
            "SELECT delete_post($1, $2) AS success",
            [post_id, user_email]
        );
        return result.rows[0].success ?? false;
    } catch (err) {
        console.error("Error deleting post:", err);
        throw err;
    }
}

/**
 * Likes or dislikes a post.
 * If they try to vote the same way twice, it removes their vote.
 * Otherwise, it replaces the vote.
 *
 * @param user_email - The user performing the vote.
 * @param post_id - The post to vote on.
 * @param flag - 1 for upvote, -1 for downvote.
 */
export async function VotePost(
    user_email: string,
    post_id: number,
    flag: 1 | -1
): Promise<void> {
    try {
        await pool.query(
            "SELECT vote_post($1, $2, $3)",
            [user_email, post_id, flag]
        );
    } catch (err) {
        console.error("Error voting on post:", err);
        throw err;
    }
}

/**
 * Gets the total votes on a post
 *
 * @param post_id - The post to get the votes of.
 */
export async function GetPostVotes(
    post_id: number
): Promise<number> {
    try {
        const result = await pool.query(
            "SELECT get_post_votes($1)",
            [post_id]
        );
        return result.rows[0].get_post_votes ?? 0;
    } catch (err) {
        console.error("Error getting post votes:", err);
        throw err;
    }
}

//to unvote a post
export async function DeleteVote(userEmail: string, postId: number): Promise<void> {
    try {
        // use SELECT to call the function because it returns void
        await pool.query("SELECT delete_vote($1, $2)", [userEmail, postId]);
    } catch (err) {
        console.error("Error deleting vote:", err);
        throw err;
    }
}

//for the post media public ip in cloudinary
export async function SavePostMediaInfo(postId: number, publicId: string): Promise<void> {
    const query = `
        INSERT INTO post_media_info (post_id, public_id)
        VALUES ($1, $2)
        ON CONFLICT (post_id) 
        DO UPDATE SET public_id = $2;
    `;
    await pool.query(query, [postId, publicId]);
}

//get the Public ID for a specific post
export async function GetPostMediaInfo(postId: number): Promise<{ public_id: string } | undefined> {
    const query = `
        SELECT public_id 
        FROM post_media_info 
        WHERE post_id = $1
    `;
    const res = await pool.query(query, [postId]);
    return res.rows[0]; //returns undefined if no image exists
}

//delete the post's media info (public_id) from the database
export async function ClearPostMediaInfo(post_id: number): Promise<void> {
    try {
        await pool.query("DELETE FROM post_media_info WHERE post_id = $1", [post_id]);
    } catch (err) {
        console.error("Error clearing post media info:", err);
        throw err;
    }
}