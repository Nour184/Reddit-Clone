import pool from '../../utils/crud/user_crud';
import {
    CreateUser,
    GetUser,
    SetPfp,
    SetAboutMe,
    GetPassword,
    SetPassword,
    ComparePasswords,
    DeleteUser
} from '../../utils/crud/user_crud';

describe('User Service', () => {
    const testEmail = 'JohnDoe@example.com';
    const testUsername = 'JohnDoe';
    const testPassword = 'JohnDoe123';
    const newPassword = 'NewJohnDoe123';
    const testPfp = 'https://example.com/pfp.png';
    const testAboutMe = 'Hello, I am a test user!';

    // Cleanup after all tests are done
    afterAll(async () => {
        await DeleteUser(testEmail).catch(() => {});
        await pool.end();
    });

    it('should create a user', async () => {
        await CreateUser(testEmail, testUsername, testPassword);
        const user = await GetUser(testEmail);
        expect(user).not.toBeNull();
        expect(user?.email).toBe(testEmail);
        expect(user?.username).toBe(testUsername);
    });

    it('should update profile picture', async () => {
        await SetPfp(testEmail, testPfp);
        const user = await GetUser(testEmail);
        expect(user?.profile_picture_link).toBe(testPfp);
    });

    it('should update about me', async () => {
        await SetAboutMe(testEmail, testAboutMe);
        const user = await GetUser(testEmail);
        expect(user?.about_me).toBe(testAboutMe);
    });

    it('should get and compare passwords correctly', async () => {
        const hashedPassword = await GetPassword(testEmail);
        expect(hashedPassword).not.toBeNull();

        const matchOld = await ComparePasswords(testEmail, testPassword);
        expect(matchOld).toBe(true);
    });

    it('should change password', async () => {
        await SetPassword(testEmail, newPassword);

        const matchOld = await ComparePasswords(testEmail, testPassword);
        const matchNew = await ComparePasswords(testEmail, newPassword);

        expect(matchOld).toBe(false);
        expect(matchNew).toBe(true);
    });

    it('should delete the user', async () => {
        await DeleteUser(testEmail);
        const user = await GetUser(testEmail);
        expect(user).toBeNull();
    });
});
