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


 */