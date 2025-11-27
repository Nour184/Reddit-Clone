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
    {
      name: 'r/ReactJS',
      description: 'A community for learning and sharing everything React.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=react',
    },
    {
      name: 'r/WebDev',
      description: 'General web development discussion and news.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=web',
    },
    {
      name: 'r/Frontend',
      description: 'Focusing on HTML, CSS, and JavaScript for the browser.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=front',
    },
    {
      name: 'r/Backend',
      description: 'Server-side programming, databases, and architecture.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=back',
    },
    {
      name: 'r/FullStack',
      description: 'For developers who do it all.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=full',
    },
    {
      name: 'r/UIUX',
      description: 'User Interface and User Experience design discussions.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=uiux',
    },
    {
      name: 'r/CodingMemes',
      description: 'Relatable memes for programmers.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=memes',
    },
    {
      name: 'r/LearnProgramming',
      description: 'Resources and support for beginners.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=learn',
    },
    {
      name: 'r/TechNews',
      description: 'Latest updates from the tech world.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=news',
    },
    {
      name: 'r/OpenSource',
      description: 'Discussing and contributing to open source software.',
      communityPhotoLink: 'https://picsum.photos/200/100?comm=os',
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