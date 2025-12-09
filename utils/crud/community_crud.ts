import pool from "../interfaces";

// =============================
// CREATE Community
// =============================
export async function CreateCommunity(
  name: string,
  description: string,
  photo: string | null,
  ownerEmail: string
) {
  const query = `
    INSERT INTO communities (name, description, community_photo_link, community_owner)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, description, photo, ownerEmail];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// =============================
// READ Community by name
// =============================
export async function GetCommunity(name: string) {
  const query = `
    SELECT * FROM communities
    WHERE name = $1;
  `;

  const result = await pool.query(query, [name]);
  return result.rows[0];
}

// =============================
// READ all communities
// =============================
export async function GetAllCommunities() {
  const result = await pool.query(`
    SELECT * FROM communities
    ORDER BY created_on DESC;
  `);
  return result.rows;
}
// =============================
// UPDATE Community
// =============================
export async function UpdateCommunity(
  name: string,
  newDescription: string,
  newPhoto: string | null
) {
  const query = `
    UPDATE communities
    SET description = $1,
        community_photo_link = $2
    WHERE name = $3
    RETURNING *;
  `;

  const values = [newDescription, newPhoto, name];
  const result = await pool.query(query, values);
  return result.rows[0];
}
// =============================
// DELETE Community
// =============================
export async function DeleteCommunity(name: string) {
  const query = `
    DELETE FROM communities
    WHERE name = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [name]);
  return result.rows[0]; // returns deleted row
}