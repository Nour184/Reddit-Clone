import { pool } from "./db_connection";

// =============================
// Add or Update Vote
// =============================
export async function votePost(
    user_email: string,
    post_id: number,
    flag: 1 | -1
) {
    const query = `
    INSERT INTO post_votes (user_email, post_id, flag)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_email, post_id)
    DO UPDATE SET flag = EXCLUDED.flag
    RETURNING *;
  `;
    const result = await pool.query(query, [user_email, post_id, flag]);
    return result.rows[0];
}

// =============================
// Remove Vote
// =============================
export async function deleteVote(user_email: string, post_id: number) {
    const query = `
    DELETE FROM post_votes
    WHERE user_email = $1 AND post_id = $2
    RETURNING *;
  `;
    const result = await pool.query(query, [user_email, post_id]);
    return result.rows[0];
}

// =============================
// Get total votes for a post
// =============================
export async function getVotesForPost(post_id: number) {
    const query = `
    SELECT 
      COALESCE(SUM(flag), 0) AS score,
      COUNT(*) AS total_votes
    FROM post_votes
    WHERE post_id = $1;
  `;
    const result = await pool.query(query, [post_id]);
    return result.rows[0];
}
