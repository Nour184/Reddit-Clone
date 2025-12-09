import pool from "../../utils/interfaces";
import {
    CreateCommunity,
    GetCommunity,
    GetAllCommunities,
    UpdateCommunity,
    DeleteCommunity,
} from "../../utils/crud/community_crud";
import {CreateUser, DeleteUser} from "../../utils/crud/user_crud";

describe("Community Service", () => {
    const testName = "TestCommunity";
    const testDescription = "A cool test community";
    const testPhoto = "https://example.com/community.png";
    const testOwner = "JohnDoe@example.com";

    const updatedDescription = "Updated community description";
    const updatedPhoto = "https://example.com/newphoto.png";

    // Cleanup after all tests
    afterAll(async () => {
        await DeleteCommunity(testName).catch(() => {});
        await DeleteUser(testOwner).catch(() => {});
        await pool.end();
    });

    // ============================
    // CREATE
    // ============================
    it("should create a community", async () => {
        await CreateUser(testOwner, "Owner", "Password");
        const community = await CreateCommunity(
            testName,
            testDescription,
            testPhoto,
            testOwner
        );

        expect(community).not.toBeNull();
        expect(community.name).toBe(testName);
        expect(community.description).toBe(testDescription);
        expect(community.community_photo_link).toBe(testPhoto);
        expect(community.community_owner).toBe(testOwner);
    });

    // ============================
    // READ by name
    // ============================
    it("should get a community by name", async () => {
        const community = await GetCommunity(testName);

        expect(community).not.toBeNull();
        expect(community.name).toBe(testName);
        expect(community.description).toBe(testDescription);
        expect(community.community_photo_link).toBe(testPhoto);
        expect(community.community_owner).toBe(testOwner);
    });

    // ============================
    // READ all communities
    // ============================
    it("should return all communities", async () => {
        const communities = await GetAllCommunities();

        expect(Array.isArray(communities)).toBe(true);
        expect(communities.length).toBeGreaterThan(0);

        // The one we created should be inside the list
        const found = communities.find((c) => c.name === testName);
        expect(found).toBeDefined();
    });

    // ============================
    // UPDATE
    // ============================
    it("should update a community", async () => {
        const updated = await UpdateCommunity(
            testName,
            updatedDescription,
            updatedPhoto
        );

        expect(updated).not.toBeNull();
        expect(updated.name).toBe(testName);
        expect(updated.description).toBe(updatedDescription);
        expect(updated.community_photo_link).toBe(updatedPhoto);

        // Confirm by reading back
        const check = await GetCommunity(testName);
        expect(check.description).toBe(updatedDescription);
        expect(check.community_photo_link).toBe(updatedPhoto);
    });

    // ============================
    // DELETE
    // ============================
    it("should delete a community", async () => {
        const deleted = await DeleteCommunity(testName);

        expect(deleted).not.toBeNull();
        expect(deleted.name).toBe(testName);

        const after = await GetCommunity(testName);
        expect(after).toBeUndefined();
    });
});
