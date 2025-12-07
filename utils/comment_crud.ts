import pool, {Comment} from "./interfaces";

/**
 * Creates a new comment in the database.
 *
 * @param user_email - The user creating the comment.
 * @param post_id - The post the comment is under.
 * @param body - comment text.
 * @returns A promise resolving to the new comment ID.
 */
export async function CreateComment(
    user_email: string,
    post_id: string,
    body: string,
): Promise<number> {
    try {
        const result = await pool.query(
            "SELECT create_comment($1, $2, $3) AS comment_id",
            [user_email, post_id, body]
        );
        return result.rows[0].post_id;
    } catch (err) {
        console.error("Error creating comment:", err);
        throw err;
    }
}

/**
 * Gets a comment by its ID.
 *
 * @param comment_id - The comment ID.
 * @returns A Comment object or null.
 */
export async function GetComment(comment_id: number): Promise<Comment | null> {
    try {
        const result = await pool.query(
            "SELECT * FROM get_comment($1)",
            [comment_id]
        );
        return result.rows[0] ?? null;
    } catch (err) {
        console.error("Error getting comment:", err);
        throw err;
    }
}

/**
 * Gets all comments under a post.
 */
export async function GetPostComments(post_id: number): Promise<Comment[]> {
    try {
        const result = await pool.query(
            "SELECT * FROM get_post_comments($1)",
            [post_id]
        );
        return result.rows;
    } catch (err) {
        console.error("Error getting post's comments:", err);
        throw err;
    }
}

/**
 * Deletes a comment from the database.
 *
 * @param comment_id - The comment ID.
 */
export async function DeleteComment(comment_id: number): Promise<void> {
    try {
        await pool.query("SELECT delete_comment($1)", [comment_id]);
    } catch (err) {
        console.error("Error deleting comment:", err);
        throw err;
    }
}

/**
 * Likes or dislikes a comment.
 * If they try to vote the same way twice, it removes their vote.
 * Otherwise, it replaces the vote.
 *
 * @param user_email - The user performing the vote.
 * @param comment_id - The comment to vote on.
 * @param flag - 1 for upvote, -1 for downvote.
 */
export async function VoteComment(
    user_email: string,
    comment_id: number,
    flag: 1 | -1
): Promise<void> {
    try {
        await pool.query(
            "SELECT vote_comment($1, $2, $3)",
            [user_email, comment_id, flag]
        );
    } catch (err) {
        console.error("Error voting on comment:", err);
        throw err;
    }
}
