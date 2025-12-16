/*

CREATE OR REPLACE FUNCTION create_post(
    p_user_email TEXT,
    p_community_name TEXT,
    p_title TEXT,
    p_body TEXT,
    p_picture_link TEXT
)
RETURNS INT AS $$
DECLARE
    new_post_id INT;
BEGIN
    INSERT INTO posts (user_email, community_name, title, body, picture_link)
    VALUES (p_user_email, p_community_name, p_title, p_body, p_picture_link)
    RETURNING post_id INTO new_post_id;

    RETURN new_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_post(p_post_id INT)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.post_id,
           p.user_email,
           p.community_name,
           p.title,
           p.body,
           p.picture_link,
           p.created_on
    FROM posts p
    WHERE p.post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_community_posts(p_community_name TEXT)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.post_id, p.user_email, p.community_name, p.title, p.body, p.picture_link, p.created_on
    FROM posts p
    WHERE p.community_name = p_community_name
    ORDER BY created_on DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_post(p_post_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM posts
    WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION vote_post(
    p_user_email TEXT,
    p_post_id INT,
    p_flag SMALLINT
)
RETURNS VOID AS $$
DECLARE
    existing_flag SMALLINT;
BEGIN
    -- Check if user already voted
    SELECT flag INTO existing_flag
    FROM post_votes
    WHERE user_email = p_user_email AND post_id = p_post_id;

    IF existing_flag IS NULL THEN
        -- No vote → insert new
        INSERT INTO post_votes (user_email, post_id, flag)
        VALUES (p_user_email, p_post_id, p_flag);

    ELSIF existing_flag = p_flag THEN
        -- Same vote → remove vote
        DELETE FROM post_votes
        WHERE user_email = p_user_email AND post_id = p_post_id;

    ELSE
        -- Different vote → update
        UPDATE post_votes
        SET flag = p_flag
        WHERE user_email = p_user_email AND post_id = p_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_post_votes(p_post_id INT)
RETURNS INT AS $$
DECLARE
    total_votes INT;
BEGIN
    SELECT COALESCE(SUM(flag), 0)
    INTO total_votes
    FROM post_votes
    WHERE post_id = p_post_id;

    RETURN total_votes;
END;
$$ LANGUAGE plpgsql;

***************************TESTing Queries***********************/
SELECT * FROM posts 
WHERE community_name = 'gamers';

-- 1)Get posts for a specific user's profile (e.g., "JohnDoe's" posts)

CREATE OR REPLACE FUNCTION get_user_posts(
    p_user_email TEXT,
    p_limit INT,
    p_cursor TIMESTAMP
)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.post_id, 
        p.user_email, 
        p.community_name, 
        p.title, 
        p.body, 
        p.picture_link, 
        p.created_on
    FROM posts p
    WHERE 
        -- 1) Lock search to this specific user
        p.user_email = p_user_email
        AND 
        (
            p_cursor IS NULL 
            OR 
            -- 2) Exact same timezone fix as get_community_posts
            p.created_on < (p_cursor AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Cairo')
        )
    ORDER BY p.created_on DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 2)Get Public Feed (For Guests / Not Logged In) using timestamp cursor (infinite scroll)

CREATE OR REPLACE FUNCTION get_public_feed(p_limit INT, p_cursor TIMESTAMP)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.post_id, 
        p.user_email, 
        p.community_name, 
        p.title, 
        p.body, 
        p.picture_link, 
        p.created_on
    FROM posts p
    WHERE 
        p_cursor IS NULL 
        OR 
        -- We take the UTC input (e.g. 10:00) and convert it to 'Africa/Cairo' (e.g. 12:00)
        -- to match the time stored in your table.
        p.created_on < (p_cursor AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Cairo')
    ORDER BY p.created_on DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

--  3)Get Personalized Feed (For Logged In Users) 

CREATE OR REPLACE FUNCTION get_personalized_feed(p_user_email TEXT)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.post_id, p.user_email, p.community_name, p.title, p.body, p.picture_link, p.created_on
    FROM posts p
    WHERE 
        -- Condition 1: Post is in a community I have joined
        p.community_name IN (
            SELECT jc.community_name 
            FROM joined_communities jc 
            WHERE jc.user_email = p_user_email
        )
        OR 
        -- Condition 2: Or user created the post themselves (so user can see his own posts)
        p.user_email = p_user_email
    ORDER BY p.created_on DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- 4)Get posts inside a community using timestamp cursor (NOO infinite scroll)
CREATE OR REPLACE FUNCTION get_community_posts(
    p_community_name TEXT, 
    p_limit INT, 
    p_cursor TIMESTAMP
)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.post_id, 
        p.user_email, 
        p.community_name, 
        p.title, 
        p.body, 
        p.picture_link, 
        p.created_on
    FROM posts p
    WHERE 
        -- 1) Lock search to this community
        p.community_name = p_community_name
        AND 
        (
            p_cursor IS NULL 
            OR 
            -- 2)Apply the timezone conversion math exactly like the working function
            p.created_on < (p_cursor AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Cairo')
        )
    ORDER BY p.created_on DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


--**********************************update post function***************************
CREATE OR REPLACE FUNCTION update_post( --pass all fields even if not updating them
    p_post_id INT,
    p_user_email TEXT,       -- Security: Pass email to ensure ownership
    p_new_title TEXT,        -- Pass NULL if not updating same for all fields except the email
    p_new_body TEXT,        
    p_new_picture_link TEXT  
)
RETURNS TABLE (
    post_id INT,
    user_email TEXT,
    community_name TEXT,
    title TEXT,
    body TEXT,
    picture_link TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    UPDATE posts p
    SET 
        title = COALESCE(p_new_title, p.title),
        body = COALESCE(p_new_body, p.body),
        picture_link = COALESCE(p_new_picture_link, p.picture_link)
    WHERE p.post_id = p_post_id AND p.user_email = p_user_email -- Ensures only owner can update
    RETURNING 
        p.post_id, p.user_email, p.community_name, p.title, p.body, p.picture_link, p.created_on;
END;
$$ LANGUAGE plpgsql;

--***************************************votes functions for a post******************************
CREATE OR REPLACE FUNCTION delete_vote(
    p_user_email TEXT,
    p_post_id INT
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM post_votes
    WHERE user_email = p_user_email AND post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

--**********************************delete all post's comments function*************************
CREATE OR REPLACE FUNCTION delete_post_comments(p_post_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM comments
    WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql


CREATE OR REPLACE FUNCTION get_post_comments(p_post_id INT)
RETURNS TABLE (
    comment_id INT,
    post_id INT,
    user_email TEXT,
    body TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.comment_id,
        c.post_id,
        c.user_email,
        c.body,
        c.created_on
    FROM comments c
    WHERE c.post_id = p_post_id
    ORDER BY c.created_on DESC; -- Change to ASC if we are gonna show oldest comments at the top
END;
$$ LANGUAGE plpgsql;

--create a comment bgdddd msh 3rfa ento 3mlto ehhhh!!!
CREATE OR REPLACE FUNCTION create_comment(
    p_user_email TEXT,
    p_post_id INT,       -- Matches the integer type in your table
    p_body TEXT
)
RETURNS INT AS $$
DECLARE
    new_comment_id INT;
BEGIN
    INSERT INTO comments (user_email, post_id, body, created_on)
    VALUES (p_user_email, p_post_id, p_body, NOW())
    RETURNING comment_id INTO new_comment_id;
    
    RETURN new_comment_id;
END;
$$ LANGUAGE plpgsql;

--get a specific comment
CREATE OR REPLACE FUNCTION get_comment(p_comment_id INT)
RETURNS TABLE (
    comment_id INT,
    post_id INT,
    user_email TEXT,
    body TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.comment_id,
        c.post_id,
        c.user_email,
        c.body,
        c.created_on
    FROM comments c
    WHERE c.comment_id = p_comment_id;
END;
$$ LANGUAGE plpgsql;


--modify a specific comment
CREATE OR REPLACE FUNCTION update_comment(
    p_comment_id INT,
    p_user_email TEXT,  -- security:must match the original author
    p_new_body TEXT
)
RETURNS TABLE (
    comment_id INT,
    post_id INT,
    user_email TEXT,
    body TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    UPDATE comments c
    SET body = p_new_body
    WHERE c.comment_id = p_comment_id
      AND c.user_email = p_user_email -- critical:to ensures only owner can edit
    RETURNING 
        c.comment_id, c.post_id, c.user_email, c.body, c.created_on;
END;
$$ LANGUAGE plpgsql;

--delete a specific comment
CREATE OR REPLACE FUNCTION delete_comment(p_comment_id INT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM comments
    WHERE comment_id = p_comment_id;
END;
$$ LANGUAGE plpgsql;

--get comment votes
CREATE OR REPLACE FUNCTION get_comment_votes(p_comment_id INT)
RETURNS TABLE (
    user_email TEXT,
    comment_id INT,
    flag SMALLINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.user_email, 
        v.comment_id, 
        v.flag
    FROM comment_votes v
    WHERE v.comment_id = p_comment_id;
END;
$$ LANGUAGE plpgsql;

--vote a comment
CREATE OR REPLACE FUNCTION vote_comment(
    p_user_email TEXT,
    p_comment_id INT,
    p_flag INT  -- Accepts 1 or -1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO comment_votes (user_email, comment_id, flag)
    VALUES (p_user_email, p_comment_id, p_flag)
    ON CONFLICT (user_email, comment_id) 
    DO UPDATE SET 
        flag = EXCLUDED.flag; -- Updates the flag if the row already exists
END;
$$ LANGUAGE plpgsql;


--delete a comment vote
CREATE OR REPLACE FUNCTION delete_comment_vote(
    p_user_email TEXT,
    p_comment_id INT
)
RETURNS VOID AS $$
BEGIN
    DELETE FROM comment_votes
    WHERE user_email = p_user_email AND comment_id = p_comment_id;
END;
$$ LANGUAGE plpgsql;
 */