/*

/*
Creates a user given an email address, username, and a password
 */
CREATE OR REPLACE FUNCTION create_user(
    p_email TEXT,
    p_username TEXT,
    p_password TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO users(email, username, password)
    VALUES (p_email, p_username, p_password);
END;
$$ LANGUAGE plpgsql;

/*
Gets a user given an email address
 */
CREATE OR REPLACE FUNCTION get_user_data(p_email TEXT)
RETURNS TABLE (
    email TEXT,
    username TEXT,
    profile_picture_link TEXT,
    about_me TEXT,
    created_on TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.email, u.username, u.profile_picture_link, u.about_me, u.created_on
    FROM users u
    WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;


/*
Gets the user whose email is equal to p_email
Changes that user's profile picture
 */
CREATE OR REPLACE FUNCTION set_profile_picture(
    p_email TEXT,
    p_link TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET profile_picture_link = p_link
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;


/*
Gets the user whose email is equal to p_email
Changes that user's about me
 */
CREATE OR REPLACE FUNCTION set_about_me(
    p_email TEXT,
    p_about TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET about_me = p_about
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

/*
Gets the user whose email is equal to p_email
Returns that user's password
 */
CREATE OR REPLACE FUNCTION get_user_password(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT password INTO result
    FROM users
    WHERE email = p_email;

    RETURN result;
END;
$$ LANGUAGE plpgsql;


/*
Gets the user whose email is equal to p_email
Changes that user's password
 */
CREATE OR REPLACE FUNCTION set_password(
    p_email TEXT,
    p_new_password TEXT
) RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET password = p_new_password
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

/*
Gets the user whose email is equal to p_email
Deletes that user
Foreign keys referencing users are set to cascade
All rows that reference deleted user will be deleted
 */
CREATE OR REPLACE FUNCTION delete_user(p_email TEXT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM users
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

 */