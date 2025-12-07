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
    joinCommunity,
    getJoinedCommunities,
    isUserJoined,
    updateJoinedCommunity,
    leaveCommunity,
} from "../utils/joined_communities_CRUD";
import pool from "../utils/interfaces";

async function testJoinedCommunities() {
    console.log("\n🔵 Testing joined_communities...");

    const user = "test@example.com";
    const community = "Gaming";

    try {
        console.log("➡ Joining community...");
        console.log(await joinCommunity(user, community));

        console.log("➡ Checking if user is joined...");
        console.log(await isUserJoined(user, community));

        console.log("➡ Getting all joined communities...");
        console.log(await getJoinedCommunities(user));

        console.log("➡ Updating membership...");
        console.log(
            await updateJoinedCommunity(user, community, user, "NewGaming")
        );

        console.log("➡ Leaving community...");
        console.log(await leaveCommunity(user, "NewGaming"));

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await pool.end();
        console.log("\n✅ Test completed. DB connection closed.");
    }
}

testJoinedCommunities();
