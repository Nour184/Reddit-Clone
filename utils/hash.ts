import bcrypt from 'bcrypt';

/**
 * Hashes a password securely using bcrypt
 *
 * @param password - The raw password to hash
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns The hashed password as a string
 */
export async function HashPassword(password: string, saltRounds: number = 10): Promise<string> {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (err) {
        console.error('Error hashing password:', err);
        throw err;
    }
}

/**
 * Hashes a plain-text password with a hashed password using bcrypt
 *
 * @param password - The raw password
 * @param hashedPassword - The hashed password to compare to
 * @returns True if the password matches the hashed password, false otherwise
 */
export async function VerifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
        console.error('Error verifying password:', err);
        throw err;
    }
}