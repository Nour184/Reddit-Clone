import { Pool } from "pg";

const pool = new Pool({
    user: 'neondb_owner',
    host: 'ep-cool-pond-ag6dlbgu-pooler.c-2.eu-central-1.aws.neon.tech',
    database: 'neondb',
    password: 'npg_ohLxKP8CJR9U',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});


// =============================
// Add admin (Create)
// =============================
export async function addAdmin(userEmail: string, communityName: string) {
    const query = `
    INSERT INTO community_admins (user_email, community_name)
    VALUES ($1, $2)
    RETURNING *;
  `;

    const result = await pool.query(query, [userEmail, communityName]);
    return result.rows[0];
}

// =============================
// Get all admins in community (Read)
// =============================
export async function getCommunityAdmins(communityName: string) {
    const query = `
    SELECT * FROM community_admins
    WHERE community_name = $1;
  `;

    const result = await pool.query(query, [communityName]);
    return result.rows;
}

// =============================
// Check if user is admin (Read single)
// =============================
export async function isAdmin(userEmail: string, communityName: string) {
    const query = `
    SELECT * FROM community_admins
    WHERE user_email = $1 AND community_name = $2;
  `;

    const result = await pool.query(query, [userEmail, communityName]);
    return result.rows.length > 0;
}

// =============================
// Update admin record
// =============================
export async function updateAdmin(
    oldUserEmail: string,
    oldCommunity: string,
    newUserEmail: string,
    newCommunity: string
) {
    const query = `
    UPDATE community_admins
    SET user_email = $3, community_name = $4
    WHERE user_email = $1 AND community_name = $2
    RETURNING *;
  `;

    const values = [oldUserEmail, oldCommunity, newUserEmail, newCommunity];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// =============================
// Remove admin (Delete)
// =============================
export async function removeAdmin(userEmail: string, communityName: string) {
    const query = `
    DELETE FROM community_admins
    WHERE user_email = $1 AND community_name = $2
    RETURNING *;
  `;

    const result = await pool.query(query, [userEmail, communityName]);
    return result.rows[0];
}
