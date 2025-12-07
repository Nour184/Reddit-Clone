import pkg from "pg";
const { Pool } = pkg;

// Configure your database connection
const pool = new Pool({
    user: 'neondb_owner',
    host: 'ep-cool-pond-ag6dlbgu-pooler.c-2.eu-central-1.aws.neon.tech',
    database: 'neondb',
    password: 'npg_ohLxKP8CJR9U',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

// User data
export interface User {
    email: string;
    username: string;
    profile_picture_link?: string | null;
    about_me?: string | null;
    created_on: Date;
}

// Post data
export interface Post {
    post_id: number,
    user_email: string,
    community_name: string,
    title: string;
    body?: string | null;
    picture_link?: string | null;
    created_on: Date;
}

// Comment data
export interface Comment {
    comment_id: number,
    user_email: string,
    body: string;
    created_on: Date;
}

export default pool