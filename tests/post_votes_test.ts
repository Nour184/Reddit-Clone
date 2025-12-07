///////////////////////////////////////////
//the sql code used to test the functions
///////////////////////////////////////////

/*

INSERT INTO users (email, username, password, profile_picture_link, about_me)
VALUES
('user1@example.com', 'UserOne', 'password1', 'https://picsum.photos/50', 'Hello, I am User One'),
    ('user2@example.com', 'UserTwo', 'password2', 'https://picsum.photos/51', 'Hello, I am User Two'),
    ('user3@example.com', 'UserThree', 'password3', 'https://picsum.photos/52', 'Hello, I am User Three');


INSERT INTO communities (name, description, community_photo_link, community_owner)
VALUES
('community1', 'This is community 1', 'https://picsum.photos/200', 'user1@example.com'),
('community2', 'This is community 2', 'https://picsum.photos/201', 'user2@example.com');


INSERT INTO joined_communities (user_email, community_name)
VALUES
('user1@example.com', 'community1'),
('user2@example.com', 'community1'),
('user3@example.com', 'community2');


INSERT INTO posts (user_email, community_name, title, body, picture_link)
VALUES
('user1@example.com', 'community1', 'Welcome Post', 'Hello everyone, welcome to the community!', 'https://picsum.photos/300'),
('user2@example.com', 'community1', 'Second Post', 'This is another post in community1', ''),
('user3@example.com', 'community2', 'Community2 Intro', 'Hello from user3 in community2', 'https://picsum.photos/301');


INSERT INTO post_votes (user_email, post_id, flag)
VALUES
('user1@example.com', 1, 1),
('user2@example.com', 1, 1),
('user3@example.com', 1, -1),
('user1@example.com', 2, 1);


*/


import { votePost, deleteVote, getVotesForPost } from "../utils/post_votes_CRUD";

async function testPostVotes() {
    try {
        console.log("=== Testing Post Votes ===");

        // 1️⃣ Add votes
        console.log("\nAdding votes...");
        const vote1 = await votePost("user1@example.com", 1, 1); // upvote post 1
        const vote2 = await votePost("user2@example.com", 1, 1); // upvote post 1
        const vote3 = await votePost("user3@example.com", 1, -1); // downvote post 1
        console.log("Vote 1:", vote1);
        console.log("Vote 2:", vote2);
        console.log("Vote 3:", vote3);

        // 2️⃣ Update vote
        console.log("\nUpdating vote...");
        const updatedVote = await votePost("user3@example.com", 1, 1); // change downvote to upvote
        console.log("Updated Vote:", updatedVote);

        // 3️⃣ Get total votes for post
        console.log("\nGetting total votes for post 1...");
        const totalVotes = await getVotesForPost(1);
        console.log("Total Votes:", totalVotes);

        // 4️⃣ Delete a vote
        console.log("\nDeleting vote...");
        const deleted = await deleteVote("user2@example.com", 1);
        console.log("Deleted Vote:", deleted);

        // 5️⃣ Get total votes after deletion
        console.log("\nTotal votes after deletion:");
        const votesAfterDeletion = await getVotesForPost(1);
        console.log(votesAfterDeletion);

        console.log("\n✅ Post Votes test finished!");
    } catch (err) {
        console.error("Error testing post votes:", err);
    }
}

// Run the test
testPostVotes();
