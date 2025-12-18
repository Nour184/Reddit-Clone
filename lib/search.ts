import { dummyPosts, dummyCommunities, dummyProfiles } from "./dummyPosts";

// ==========================================
// SEARCH API UTILITIES
// ==========================================

/**
 * Search Posts
 * Endpoint: GET /api/search/posts?q={query}
 */
export async function fetchSearchResults(query: string) {
    // TODO: Replace with real API call
    // const res = await fetch(`/api/search/posts?q=${encodeURIComponent(query)}`);
    // if (!res.ok) throw new Error('Failed to fetch posts');
    // return res.json();

    // MOCK IMPLEMENTATION
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate latency
    if (!query) return [];

    const lowerQuery = query.toLowerCase();
    return dummyPosts.filter(
        (post) =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.content.toLowerCase().includes(lowerQuery) ||
            post.subreddit.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Search Communities
 * Endpoint: GET /api/search/communities?q={query}
 */
export async function fetchCommunities(query: string) {
    // TODO: Replace with real API call
    // const res = await fetch(`/api/search/communities?q=${encodeURIComponent(query)}`);
    // return res.json();

    // MOCK IMPLEMENTATION
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!query) return dummyCommunities;

    return dummyCommunities.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );
}

/**
 * Search Profiles
 * Endpoint: GET /api/search/users?q={query}
 */
export async function fetchProfiles(query: string) {
    // TODO: Replace with real API call
    // const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
    // return res.json();

    // MOCK IMPLEMENTATION
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!query) return dummyProfiles;

    return dummyProfiles.filter(p =>
        p.username.toLowerCase().includes(query.toLowerCase())
    );
}