/*

-- ============================
-- User
-- ============================
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    profile_picture_link TEXT,
    about_me TEXT,
    created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================
-- Community
-- ============================
CREATE TABLE communities (
    name TEXT PRIMARY KEY,
    description TEXT,
    community_photo_link TEXT,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    community_owner TEXT NOT NULL,
    CONSTRAINT fk_community_owner
        FOREIGN KEY (community_owner)
        REFERENCES users(email)
        ON DELETE CASCADE
);

-- Index for faster search
CREATE INDEX idx_communities_owner ON communities(community_owner);

-- ============================
-- Joined community (membership)
-- ============================
CREATE TABLE joined_communities (
    user_email TEXT NOT NULL,
    community_name TEXT NOT NULL,
    joined_on TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_email, community_name),

    CONSTRAINT fk_join_user
        FOREIGN KEY (user_email)
        REFERENCES users(email)
        ON DELETE CASCADE,

    CONSTRAINT fk_join_community
        FOREIGN KEY (community_name)
        REFERENCES communities(name)
        ON DELETE CASCADE
);

-- ============================
-- Community admins
-- ============================
CREATE TABLE community_admins (
    user_email TEXT NOT NULL,
    community_name TEXT NOT NULL,

    PRIMARY KEY (user_email, community_name),

    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_email)
        REFERENCES users(email)
        ON DELETE CASCADE,

    CONSTRAINT fk_admin_community
        FOREIGN KEY (community_name)
        REFERENCES communities(name)
        ON DELETE CASCADE
);

-- ============================
-- Post
-- ============================
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    community_name TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_post_user
       FOREIGN KEY (user_email)
           REFERENCES users(email)
           ON DELETE CASCADE,

    CONSTRAINT fk_post_community
       FOREIGN KEY (community_name)
        REFERENCES communities(name)
        ON DELETE CASCADE
);

CREATE INDEX idx_posts_community ON posts(community_name);
CREATE INDEX idx_posts_user ON posts(user_email);

-- ============================
-- Comment
-- ============================
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_email TEXT NOT NULL,
    body TEXT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_post
        FOREIGN KEY (post_id)
        REFERENCES posts(post_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_email)
        REFERENCES users(email)
        ON DELETE CASCADE
);

CREATE INDEX idx_comments_post ON comments(post_id);

-- ============================
-- Post vote
-- flag → 1 for upvote, -1 for downvote
-- ============================
CREATE TABLE post_votes (
    user_email TEXT NOT NULL,
    post_id INT NOT NULL,
    flag SMALLINT NOT NULL CHECK (flag IN (-1, 1)),

    PRIMARY KEY (user_email, post_id),

    CONSTRAINT fk_postvote_user
        FOREIGN KEY (user_email)
            REFERENCES users(email)
            ON DELETE CASCADE,

    CONSTRAINT fk_postvote_post
        FOREIGN KEY (post_id)
        REFERENCES posts(post_id)
        ON DELETE CASCADE
);

-- ============================
-- Comment vote
-- ============================
CREATE TABLE comment_votes (
    user_email TEXT NOT NULL,
    comment_id INT NOT NULL,
    flag SMALLINT NOT NULL CHECK (flag IN (-1, 1)),

    PRIMARY KEY (user_email, comment_id),

    CONSTRAINT fk_commentvote_user
        FOREIGN KEY (user_email)
        REFERENCES users(email)
        ON DELETE CASCADE,

    CONSTRAINT fk_commentvote_comment
        FOREIGN KEY (comment_id)
        REFERENCES comments(comment_id)
        ON DELETE CASCADE
);

*/