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


*/




import { createPost, getAllPosts, getPostById, updatePost, deletePost } from "../utils/posts_CRUD";

async function testPosts() {
    try {
        console.log("=== Testing Posts CRUD ===");

        // 1️⃣ Create some posts
        console.log("\nCreating posts...");
        const post1 = await createPost("user1@example.com", "community1", "First Post", "This is the first post", "https://picsum.photos/200");
        const post2 = await createPost("user2@example.com", "community1", "Second Post", "Another post body", "");
        console.log("Created Post 1:", post1);
        console.log("Created Post 2:", post2);

        // 2️⃣ Get all posts
        console.log("\nGetting all posts...");
        const allPosts = await getAllPosts();
        console.log(allPosts);

        // 3️⃣ Get post by ID
        console.log("\nGetting post by ID...");
        const singlePost = await getPostById(post1.post_id);
        console.log(singlePost);

        // 4️⃣ Update post
        console.log("\nUpdating post...");
        const updatedPost = await updatePost(post1.post_id, "Updated Title", "Updated body", "https://picsum.photos/300");
        console.log(updatedPost);

        // 5️⃣ Delete post
        console.log("\nDeleting post...");
        const deletedPost = await deletePost(post2.post_id);
        console.log(deletedPost);

        // 6️⃣ Get all posts after deletion
        console.log("\nPosts after deletion:");
        const postsAfterDeletion = await getAllPosts();
        console.log(postsAfterDeletion);

        console.log("\n✅ Posts CRUD test finished!");
    } catch (err) {
        console.error("Error testing posts:", err);
    }
}

// Run the test
testPosts();
