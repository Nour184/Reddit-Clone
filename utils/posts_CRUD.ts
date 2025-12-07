import { pool } from "./db_connection";

// =============================
// Create Post
// =============================
export async function createPost(
    user_email: string,
    community_name: string,
    title: string,
    body?: string,
    picture_link?: string
) {
    const query = `
    INSERT INTO posts (user_email, community_name, title, body, picture_link)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    const values = [user_email, community_name, title, body, picture_link];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// =============================
// Get all posts
// =============================
export async function getAllPosts() {
    const query = `SELECT * FROM posts ORDER BY created_on DESC;`;
    const result = await pool.query(query);
    return result.rows;
}

// =============================
// Get post by ID
// =============================
export async function getPostById(postId: number) {
    const query = `SELECT * FROM posts WHERE post_id = $1;`;
    const result = await pool.query(query, [postId]);
    return result.rows[0];
}

// =============================
// Update Post
// =============================
export async function updatePost(
    postId: number,
    title?: string,
    body?: string,
    picture_link?: string
) {
    const query = `
    UPDATE posts
    SET title = $1, body = $2, picture_link = $3
    WHERE post_id = $4
    RETURNING *;
  `;
    const values = [title, body, picture_link, postId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// =============================
// Delete Post
// =============================
export async function deletePost(postId: number) {
    const query = `
    DELETE FROM posts
    WHERE post_id = $1
    RETURNING *;
  `;
    const result = await pool.query(query, [postId]);
    return result.rows[0];
}
