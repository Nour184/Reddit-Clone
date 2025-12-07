import pool from "./interfaces";

// =============================
// Join community (Create)
// =============================
export async function joinCommunity(userEmail: string, communityName: string) {
    const query = `
    INSERT INTO joined_communities (user_email, community_name)
    VALUES ($1, $2)
    RETURNING *;
  `;

    const values = [userEmail, communityName];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// =============================
// Get all joined communities for a user (Read)
// =============================
export async function getJoinedCommunities(userEmail: string) {
    const query = `
    SELECT * FROM joined_communities
    WHERE user_email = $1;
  `;

    const result = await pool.query(query, [userEmail]);
    return result.rows;
}

// =============================
// Check if user joined specific community (Read single)
// =============================
export async function isUserJoined(userEmail: string, communityName: string) {
    const query = `
    SELECT * FROM joined_communities
    WHERE user_email = $1 AND community_name = $2;
  `;

    const result = await pool.query(query, [userEmail, communityName]);
    return result.rows.length > 0;
}

// =============================
// Update joined record (Not common but included anyway)
// =============================
export async function updateJoinedCommunity(
    oldUserEmail: string,
    oldCommunity: string,
    newUserEmail: string,
    newCommunity: string
) {
    const query = `
    UPDATE joined_communities
    SET user_email = $3, community_name = $4
    WHERE user_email = $1 AND community_name = $2
    RETURNING *;
  `;

    const values = [oldUserEmail, oldCommunity, newUserEmail, newCommunity];
    const result = await pool.query(query, values);
    return result.rows[0];
}

// =============================
// Leave community (Delete)
// =============================
export async function leaveCommunity(userEmail: string, communityName: string) {
    const query = `
    DELETE FROM joined_communities
    WHERE user_email = $1 AND community_name = $2
    RETURNING *;
  `;

    const result = await pool.query(query, [userEmail, communityName]);
    return result.rows[0];
}
