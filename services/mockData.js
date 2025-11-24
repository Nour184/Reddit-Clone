export const mockData = {
  // --- CORE ENTITIES ---
  Users: [
    {
      email: 'admin@dev.com',
      username: 'NextGenDev',
      password: 'hashed-password-1', // Should be hashed in real life
      profilePictureLink: 'https://picsum.photos/50/50?user=1',
      aboutMe: 'Lead dev focusing on Next.js backend logic.',
    },
    {
      email: 'alice@user.com',
      username: 'AliceTheCoder',
      password: 'hashed-password-2',
      profilePictureLink: 'https://picsum.photos/50/50?user=2',
      aboutMe: 'Enjoys building full-stack apps and learning MongoDB.',
    },
    {
      email: 'bob@user.com',
      username: 'Bob_Tester',
      password: 'hashed-password-3',
      profilePictureLink: 'https://picsum.photos/50/50?user=3',
      aboutMe: 'Just here to test the voting system.',
    },
  ],

  Communities: [
    {
      name: 'r/NextjsDevs',
      description: 'A community for serious Next.js v14 development discussions.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=dev',
    },
    {
      name: 'r/ProjectHelp',
      description: 'Get help with your school and personal projects.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=help',
    },
  ],

  // --- CONTENT ENTITIES ---
  Posts: [
    {
      postID: 'post-101',
      userEmail: 'admin@dev.com',
      communityName: 'r/NextjsDevs',
      title: 'How to structure API routes for voting in Next.js 14?',
      body: 'I am debating between using a PATCH and a POST request for handling upvotes on a post resource...',
      pictureLink: null,
      createdAt: new Date('2025-11-20T10:00:00Z'),
    },
    {
      postID: 'post-102',
      userEmail: 'alice@user.com',
      communityName: 'r/ProjectHelp',
      title: 'MongoDB Schema Review for a simple social feed',
      body: 'Could someone check my proposed Mongoose schema for Posts and Comments? I want to optimize for read performance.',
      pictureLink: 'https://picsum.photos/600/400?post=2',
      createdAt: new Date('2025-11-21T08:30:00Z'),
    },
  ],

  Comments: [
    {
      commentID: 'comm-501',
      postID: 'post-101', // Comment on the API structure question
      userEmail: 'alice@user.com',
      body: 'I recommend using PATCH for upvotes since it is a partial modification of the Post resource. Also, consider using Server Actions!',
      createdAt: new Date('2025-11-20T11:15:00Z'),
    },
    {
      commentID: 'comm-502',
      postID: 'post-101',
      userEmail: 'bob@user.com',
      body: 'Definitely PATCH. Also, ensure you use MongoDB $inc for atomic updates to avoid race conditions.',
      createdAt: new Date('2025-11-20T12:00:00Z'),
    },
    {
      commentID: 'comm-503',
      postID: 'post-102', // Comment on the Schema review post
      userEmail: 'admin@dev.com',
      body: 'The schema looks solid. For performance, make sure you index the communityId field!',
      createdAt: new Date('2025-11-21T09:45:00Z'),
    },
  ],

  // --- VOTING & RELATIONSHIP ENTITIES ---
  PostUpvotes: [
    { userEmail: 'alice@user.com', postID: 'post-101' },
    { userEmail: 'bob@user.com', postID: 'post-101' },
    { userEmail: 'admin@dev.com', postID: 'post-102' },
  ],

  PostDownvotes: [
    { userEmail: 'bob@user.com', postID: 'post-102' }, // Bob downvotes Alice's post
  ],

  CommentUpvotes: [
    { userEmail: 'admin@dev.com', commentID: 'comm-501' }, // Admin upvotes Alice's comment
    { userEmail: 'alice@user.com', commentID: 'comm-502' }, // Alice upvotes Bob's comment
  ],

  CommentDownvotes: [
    { userEmail: 'bob@user.com', commentID: 'comm-503' }, // Bob downvotes Admin's comment
  ],
  
  JoinedCommunities: [
    { userEmail: 'alice@user.com', communityName: 'r/NextjsDevs' },
    { userEmail: 'alice@user.com', communityName: 'r/ProjectHelp' },
    { userEmail: 'bob@user.com', communityName: 'r/NextjsDevs' },
  ]
};