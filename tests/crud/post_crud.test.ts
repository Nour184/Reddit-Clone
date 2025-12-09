import {
    CreatePost,
    GetPost,
    GetCommunityPosts,
    VotePost,
    GetPostVotes,
    DeletePost
} from '../../utils/crud/post_crud';
import pool, {Post} from "../../utils/interfaces";
import {CreateCommunity, DeleteCommunity} from "../../utils/crud/community_crud";
import {CreateUser, DeleteUser} from "../../utils/crud/user_crud";

describe('Post Service', () => {
    const testEmail = 'JohnDoe@example.com';
    const testCommunity = 'TestCommunity';
    const testTitle = 'I love Reddit!';
    const testBody = 'It is very cool';
    const testPictureLink = 'https://example.com/pfp.png';
    let createdPostIdOne: number = -1;
    let createdPostIdTwo: number = -1;

    // Cleanup after all tests are done
    afterAll(async () => {
        await DeletePost(createdPostIdOne).catch(() => {});
        await DeleteCommunity(testCommunity).catch(() => {});
        await DeleteUser(testEmail).catch(() => {});
        await pool.end();
    });

    it('should create a post', async () => {
        await CreateUser(testEmail, "Owner", "Password");
        await CreateCommunity(
            testCommunity,
            testBody,
            testPictureLink,
            testEmail
        );

        createdPostIdOne = await CreatePost(testEmail, testCommunity, testTitle, testBody, testPictureLink);
        const post : Post | null = await GetPost(createdPostIdOne);
        expect(post).not.toBeNull();
        expect(post?.post_id).toBe(createdPostIdOne);
        expect(post?.body).toBe(testBody);
        expect(post?.title).toBe(testTitle);
        expect(post?.community_name).toBe(testCommunity);
        expect(post?.picture_link).toBe(testPictureLink);
        expect(post?.user_email).toBe(testEmail);
    });

    it('should have two posts in the community', async () => {
        createdPostIdTwo = await CreatePost(testEmail, testCommunity, testTitle, testBody, testPictureLink);
        const posts : Post[] = await GetCommunityPosts(testCommunity);
        expect(posts.length).toBe(2);

        // Posts are ordered by created_on DESC (newest first)
        const postNew : Post | undefined = posts[0];
        const postOld : Post | undefined = posts[1];

        // Check newest post
        expect(postNew).toBeDefined();
        expect(postNew?.post_id).toBe(createdPostIdTwo);
        expect(postNew?.user_email).toBe(testEmail);
        expect(postNew?.community_name).toBe(testCommunity);
        expect(postNew?.title).toBe(testTitle);
        expect(postNew?.body).toBe(testBody);
        expect(postNew?.picture_link).toBe(testPictureLink);

        // Check older post
        expect(postOld).toBeDefined();
        expect(postOld?.post_id).toBe(createdPostIdOne);
        expect(postOld?.user_email).toBe(testEmail);
        expect(postOld?.community_name).toBe(testCommunity);
        expect(postOld?.title).toBe(testTitle);
        expect(postOld?.body).toBe(testBody);
        expect(postOld?.picture_link).toBe(testPictureLink);
    });

    it('should upvote the post', async () => {
        await VotePost(testEmail, createdPostIdOne, 1);
        const votes : number = await GetPostVotes(createdPostIdOne);
        expect(votes).toBe(1);
    });

    it('should downvote the post', async () => {
        await VotePost(testEmail, createdPostIdOne, -1);
        const votes : number = await GetPostVotes(createdPostIdOne);
        expect(votes).toBe(-1);
    });

    it('should remove downvote from the post', async () => {
        await VotePost(testEmail, createdPostIdOne, -1);
        const votes : number = await GetPostVotes(createdPostIdOne);
        expect(votes).toBe(0);
    });

    it('should put then remove upvote from the post', async () => {
        await VotePost(testEmail, createdPostIdOne, 1);
        let votes : number = await GetPostVotes(createdPostIdOne);
        expect(votes).toBe(1);

        await VotePost(testEmail, createdPostIdOne, 1);
        votes = await GetPostVotes(createdPostIdOne);
        expect(votes).toBe(0);
    });

    it('should delete the posts', async () => {
        let post = await GetPost(createdPostIdOne);
        expect(post).not.toBeNull();

        await DeletePost(createdPostIdOne);
        post = await GetPost(createdPostIdOne);
        expect(post).toBeNull();

        post = await GetPost(createdPostIdTwo);
        expect(post).not.toBeNull();

        await DeletePost(createdPostIdTwo);
        post = await GetPost(createdPostIdTwo);
        expect(post).toBeNull();
    });
});
