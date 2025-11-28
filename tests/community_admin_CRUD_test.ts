///////////////////////////////////////////
//the sql code used to test the functions
///////////////////////////////////////////


// INSERT INTO users (email, username, password)
// VALUES ('test@example.com', 'testUser', '123'),
//     ('admin@example.com', 'adminUser', '123');
//
// INSERT INTO communities (name, description, community_owner)
// VALUES ('Gaming', 'Gaming community', 'test@example.com'),
//     ('NewGaming', 'New gaming community', 'test@example.com'),
//     ('Science', 'Science lovers', 'admin@example.com'),
//     ('Physics', 'Physics community', 'admin@example.com');





import {
    addAdmin,
    getCommunityAdmins,
    isAdmin,
    updateAdmin,
    removeAdmin,
} from "../utils/community_admin_CRUD";


async function testCommunityAdmins() {
    console.log("\n🟣 Testing community_admins...");

    const user = "admin@example.com";
    const community = "Science";

    try {
        console.log("➡ Adding admin...");
        console.log(await addAdmin(user, community));

        console.log("➡ Checking if user is admin...");
        console.log(await isAdmin(user, community));

        console.log("➡ Getting all admins...");
        console.log(await getCommunityAdmins(community));

        console.log("➡ Updating admin...");
        console.log(
            await updateAdmin(user, community, user, "Physics")
        );

        console.log("➡ Removing admin...");
        console.log(await removeAdmin(user, "Physics"));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {

        console.log("\n✅ Test completed. DB connection closed.");
    }
}

testCommunityAdmins();
