
// ==========================================
// SEARCH API UTILITIES
// ==========================================

/**
 * Search Posts
 * Endpoint: GET /api/search/posts?q={query}
 */
export async function fetchSearchResults(query: string) {
    // MOCK IMPLEMENTATION - Backend support for post search pending
    await new Promise((resolve) => setTimeout(resolve, 300));
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
 * Endpoint: GET /api/subreddits?q={query}
 * Endpoint: GET /api/subreddits?q={query}
 */
export async function fetchCommunities(query: string) {
    if (!query) return [];

    try {
        const res = await fetch(`/api/subreddits?q=${encodeURIComponent(query)}&limit=5`);
        if (!res.ok) throw new Error('Failed to fetch communities');

        const data = await res.json();
        // Map API response to SearchBar expected format
        return data.map((c: any) => ({
            name: c.name,
            members: c.members_count || 0, // Fallback if API doesn't return count
            icon: c.community_photo_link,
            color: c.theme_color
        }));
    } catch (error) {
        console.error("Search communities error:", error);
        return [];
    }
}

/**
 * Search Profiles
 * Endpoint: GET /api/search/users?q={query}
 */
export async function fetchProfiles(query: string) {
    // MOCK IMPLEMENTATION - Backend support for user search pending
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!query) return dummyProfiles;

    return dummyProfiles.filter(p =>
        p.username.toLowerCase().includes(query.toLowerCase())
    );
}