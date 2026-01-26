import pool from "../interfaces";

// =============================
// Add admin (Create)
// =============================
export async function AddAdmin(userEmail: string, communityName: string) {
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
export async function GetCommunityAdmins(communityName: string) {
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
export async function IsAdmin(userEmail: string, communityName: string) {
  const query = `
    SELECT * FROM community_admins
    WHERE user_email = $1 AND community_name = $2;
  `;

  const result = await pool.query(query, [userEmail, communityName]);
  return result.rows.length > 0;
}

// =============================
// Remove admin (Delete)
// =============================
export async function RemoveAdmin(userEmail: string, communityName: string) {
  const query = `
    DELETE FROM community_admins
    WHERE user_email = $1 AND community_name = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [userEmail, communityName]);
  return result.rows[0];
}

// =============================
// Get communities where user is admin
// =============================
export async function GetAdminCommunities(userEmail: string) {
  const query = `
    SELECT c.* 
    FROM communities c
    JOIN community_admins ca ON c.name = ca.community_name
    WHERE ca.user_email = $1;
  `;

  const result = await pool.query(query, [userEmail]);
  return result.rows;
}
