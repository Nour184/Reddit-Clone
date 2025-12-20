
// ==========================================
// SEARCH API UTILITIES
// =========================================

/**
 * Search Communities
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
    try {
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}&limit=5`);
        if (!res.ok) throw new Error('Failed to fetch profiles');

        const data = await res.json();
        // Map API response to SearchBar expected format
        return data.map((p: any) => ({
            username: p.name,
            avatar: p.profile_photo_link,
            karma: 0 // Default karma
        }));
    } catch (error) {
        console.error("Search profiles error:", error);
        return [];
    }
}