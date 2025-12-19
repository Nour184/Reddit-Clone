
// ==========================================
// SEARCH API UTILITIES
// ==========================================

/**
 * Search Posts
 * Endpoint: GET /api/search/posts?q={query}
 */
export async function fetchSearchResults(query: string) {
    // Current API does not support post search by text query.
    // Returning empty array until backend implementation.
    // TODO: Implement GET /api/posts?q={query} or similar

    return [];
}

/**
 * Search Communities
 * Endpoint: GET /api/subreddits?q={query}
 */
export async function fetchCommunities(query: string) {
    try {
        if (!query) return [];

        // Use the real API
        const res = await fetch(`/api/subreddits?q=${encodeURIComponent(query)}&limit=5`);
        if (!res.ok) return [];

        const data = await res.json();

        // Transform to match generic search component interface if needed
        // The API returns array of community objects.
        return data.map((c: any) => ({
            name: c.community_name || c.name, // Adjust based on API structure
            members: 0, // API might not return members count in search list, set default
            icon: c.icon || null,
            color: 'from-blue-500 to-cyan-500' // Default or fetch from DB if available
        }));
    } catch (error) {
        console.error("Error searching communities:", error);
        return [];
    }
}

/**
 * Search Profiles
 * Endpoint: GET /api/search/users?q={query}
 */
export async function fetchProfiles(query: string) {
    // Current API does not support user search.
    // Returning empty array until backend implementation. 
    return [];
}