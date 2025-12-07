import {HashPassword, VerifyPassword} from "./hash";
import pool, {User} from "./interfaces";

/**
 * Creates a new user in the database.
 *
 * @param email - The user's email address.
 * @param username - The user's chosen username which cannot be changed.
 * @param password - The user's password not hashed. The password is hashed within the function itself.
 * @returns A promise that resolves when the user is created.
 */
export async function CreateUser(email: string, username: string, password: string): Promise<void> {
    try {
        const hashedPassword : string = await HashPassword(password);
        await pool.query('SELECT create_user($1, $2, $3)', [email, username, hashedPassword]);
        console.log('User created successfully');
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}

/**
 * Gets a user from the database given the user's email address.
 * If no user found, return null
 *
 * @param email - The user's email address.
 * @returns A promise of either the User object or null if not found.
 */
export async function GetUser(email: string): Promise<User | null> {
    try {
        const res = await pool.query('SELECT * FROM get_user_data($1)', [email]);
        return res.rows[0] ?? null;
    } catch (err) {
        console.error('Error finding user:', err);
        throw err;
    }
}

/**
 * Sets the profile picture for a user given their email address.
 *
 * @param email - The user's email address.
 * @param profile_pic_link - The link to the user's new profile picture.
 * @returns A promise that resolves when the user's profile picture is changed.
 */
export async function SetPfp(email: string, profile_pic_link : string): Promise<void> {
    try {
        await pool.query('SELECT set_profile_picture($1, $2)', [email, profile_pic_link]);
    } catch (err) {
        console.error('Error setting profile picture:', err);
        throw err;
    }
}

/**
 * Sets the about me for a user given their email address.
 *
 * @param email - The user's email address.
 * @param about_me - The user's new about me.
 * @returns A promise that resolves when the user's about me is set.
 */
export async function SetAboutMe(email: string, about_me : string): Promise<void> {
    try {
        await pool.query('SELECT set_about_me($1, $2)', [email, about_me]);
    } catch (err) {
        console.error('Error setting about me:', err);
        throw err;
    }
}

/**
 * Gets the user's password given their email address.
 *
 * Accesses the first result of the query then checks if it is undefined.
 * If undefined, returns null, else returns the hashed password.
 *
 * @param email - The user's email address.
 * @returns A promise of either the user's hashed password or null if not found
 */
export async function GetPassword(email: string): Promise<string | null> {
    try {
        const result = await pool.query('SELECT get_user_password($1)', [email]);
        return result.rows[0]?.get_user_password || null;
    } catch (err) {
        console.error('Error changing password:', err);
        throw err;
    }
}

/**
 * Changes the user's password given their email address.
 * the password is given un-hashed and is hashed within the function itself.
 *
 * @param email - The user's email address.
 * @param password - The user's new password un-hashed.
 * @returns A promise that resolves when the user's password is changed.
 */
export async function SetPassword(email: string, password : string): Promise<void> {
    try {
        const hashed_password : string = await HashPassword(password);
        await pool.query('SELECT set_password($1, $2)', [email, hashed_password]);
    } catch (err) {
        console.error('Error changing password:', err);
        throw err;
    }
}

/**
 * Compares a plain-text password with the stored hashed password
 * in the database given a user's email address.
 * Returns true if they match, false if they don't or if user is not found.
 *
 * @param email - The user's email address.
 * @param password - The plain-text password to compare.
 * @returns A promise of a boolean of whether the passwords are equal or not.
 */
export async function ComparePasswords(email: string, password: string): Promise<boolean> {
    try {
        const stored_password = await GetPassword(email);
        if (stored_password === null) {
            return false;
        }
        return await VerifyPassword(password, stored_password);
    } catch (err) {
        console.error('Error comparing passwords:', err);
        throw err;
    }
}

/**
 * Deletes the user from the database.
 * All related data is also deleted via cascading.
 *
 * @param email - The user's email address.
 * @returns A promise that resolves when the user is deleted.
 */
export async function DeleteUser(email: string): Promise<void> {
    try {
        await pool.query('SELECT delete_user($1)', [email]);
    } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
    }
}

export default pool;