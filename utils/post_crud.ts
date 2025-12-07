import pool, {Post} from "./interfaces";

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
 * Gets all posts inside a community.
 */
export async function GetCommunityPosts(community_name: string): Promise<Post[]> {
    try {
        const result = await pool.query(
            "SELECT * FROM get_community_posts($1)",
            [community_name]
        );
        return result.rows;
    } catch (err) {
        console.error("Error getting community posts:", err);
        throw err;
    }
}

/**
 * Deletes a post from the database.
 *
 * @param post_id - The post ID.
 */
export async function DeletePost(post_id: number): Promise<void> {
    try {
        await pool.query("SELECT delete_post($1)", [post_id]);
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
