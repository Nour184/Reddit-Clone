import {
    createCommunity,
    getCommunity,
    getAllCommunities,
    updateCommunity,
    deleteCommunity
} from "../utils/community_CRUD";

async function runTests() {
    console.log("🔵 Testing DB connection + CRUD functions...\n");

    try {
        const name = "Test_" ;
        const description = "Hello from test file!";
        const photo = "https://example.com/photo.jpg";
        const ownerEmail = "test@example.com";

        // CREATE
        console.log("➡️ Creating community...");
        const created = await createCommunity(name, description, photo, ownerEmail);
        console.log("✔️ Created:", created);

        // READ
        console.log("\n➡️ Fetching community by name...");
        const fetched = await getCommunity(name);
        console.log("✔️ Fetched:", fetched);

        // READ ALL
        console.log("\n➡️ Fetching all communities...");
        const all = await getAllCommunities();
        console.log("✔️ Total communities:", all.length);

        // UPDATE
        console.log("\n➡️ Updating community...");
        const updated = await updateCommunity(
            name,
            "Updated description",
            "https://example.com/updated.jpg"
        );
        console.log("✔️ Updated:", updated);

        // DELETE
        console.log("\n➡️ Deleting community...");
        const deleted = await deleteCommunity(name);
        console.log("✔️ Deleted:", deleted);

        console.log("\n🎉 All tests finished successfully!");
    } catch (err) {
        console.error("❌ Error during tests:", err);
    }
}

runTests();
