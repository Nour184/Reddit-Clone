import pool from "../interfaces";

// =============================
// Join community (Create)
// =============================
export async function JoinCommunity(userEmail: string, communityName: string) {
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
export async function GetJoinedCommunities(userEmail: string) {
  const query = `
    SELECT community_name FROM joined_communities
    WHERE user_email = $1;
  `;

  const result = await pool.query(query, [userEmail]);
  return result.rows;
}

// =============================
// Check if user joined specific community (Read single)
// =============================
export async function IsUserJoined(userEmail: string, communityName: string) {
  const query = `
    SELECT * FROM joined_communities
    WHERE user_email = $1 AND community_name = $2;
  `;

  const result = await pool.query(query, [userEmail, communityName]);
  return result.rows.length > 0;
}

// =============================
// Leave community (Delete)
// =============================
export async function LeaveCommunity(userEmail: string, communityName: string) {
  const query = `
    DELETE FROM joined_communities
    WHERE user_email = $1 AND community_name = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [userEmail, communityName]);
  return result.rows[0];
}

// =============================
// Get Number of Members
// =============================
export async function GetNumberOfMembers(name: string) {
  const query = `
    SELECT COUNT(*) FROM joined_communities
    WHERE community_name = $1;
  `;

  const result = await pool.query(query, [name]);
  return result.rows[0].count;
}