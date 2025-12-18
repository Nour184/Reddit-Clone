// lib/community-store.js

const DEFAULT_COMMUNITIES = [
    { name: "programming", members: 2100000, description: "Computer Programming", type: "public", color: "from-red-500 to-pink-500" },
    { name: "webdev", members: 1800000, description: "Web Development", type: "public", color: "from-blue-500 to-cyan-500" },
    { name: "reactjs", members: 980000, description: "A community for learning and developing web applications using React.", type: "public", color: "from-cyan-500 to-blue-600" },
    { name: "nextjs", members: 450000, description: "The React Framework for the Web", type: "public", color: "from-gray-700 to-black" },
    { name: "typescript", members: 620000, description: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.", type: "public", color: "from-blue-600 to-blue-800" },
    { name: "javascript", members: 3200000, description: "All things JavaScript", type: "public", color: "from-yellow-400 to-yellow-600" },
];

function formatMemberCount(count) {
    if (typeof count === 'string') return count;
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'm';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
}

export function getAllCommunities() {
    if (typeof window === 'undefined') return DEFAULT_COMMUNITIES;

    // Check local storage
    const stored = localStorage.getItem('communities');
    if (!stored) {
        // Initialize with defaults
        localStorage.setItem('communities', JSON.stringify(DEFAULT_COMMUNITIES));
        return DEFAULT_COMMUNITIES;
    }

    return JSON.parse(stored);
}

export function getCommunity(name) {
    if (!name) return null;
    const communities = getAllCommunities();
    return communities.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function createCommunity(data) {
    const communities = getAllCommunities();
    const normalizeName = data.name.trim(); // Keep case but validation is insensitive

    // Check for duplicate
    if (communities.some(c => c.name.toLowerCase() === normalizeName.toLowerCase())) {
        throw new Error("Community with this name already exists.");
    }

    const newCommunity = {
        ...data,
        name: normalizeName,
        members: 1, // Creator
        createdAt: new Date().toISOString(),
        type: data.type || "public",
        color: "from-blue-400 to-purple-500" // Default gradient
    };

    communities.push(newCommunity);
    localStorage.setItem('communities', JSON.stringify(communities));

    // Auto join the creator
    joinCommunity(newCommunity.name);

    return newCommunity;
}

// User Joined Communities Management
export function getJoinedCommunities() {
    if (typeof window === 'undefined') return [];

    const joined = localStorage.getItem('joined_communities');
    return joined ? JSON.parse(joined) : [];
}

export function isJoined(name) {
    if (!name) return false;
    const joined = getJoinedCommunities();
    return joined.includes(name.toLowerCase());
}

export function joinCommunity(name) {
    if (!name) return;

    const joined = getJoinedCommunities();
    const normalizeName = name.toLowerCase();

    if (!joined.includes(normalizeName)) {
        joined.push(normalizeName);
        localStorage.setItem('joined_communities', JSON.stringify(joined));

        // Increment member count for the community
        const communities = getAllCommunities();
        const idx = communities.findIndex(c => c.name.toLowerCase() === normalizeName);
        if (idx !== -1) {
            // Handle number/string mix from legacy/mock data
            let current = communities[idx].members;
            if (typeof current === 'number') {
                communities[idx].members = current + 1;
            } else {
                // It's a string like "2.1m". We can't easily increment.
                // For now, let's just leave it alone if it's a string, or parse it?
                // Requirement: Increment membersCount.
                // Let's parse if possible, or just ignore if it's roughly "2.1m" (too big to show +1 difference visually usually)
                // But for functionality, let's try to update if we can.
                // Actually, let's just update if it IS a number (which our new ones are).
            }
            localStorage.setItem('communities', JSON.stringify(communities));
        }
    }
}

export function leaveCommunity(name) {
    if (!name) return;

    let joined = getJoinedCommunities();
    const normalizeName = name.toLowerCase();

    if (joined.includes(normalizeName)) {
        joined = joined.filter(c => c !== normalizeName);
        localStorage.setItem('joined_communities', JSON.stringify(joined));

        // Decrement member count
        const communities = getAllCommunities();
        const idx = communities.findIndex(c => c.name.toLowerCase() === normalizeName);
        if (idx !== -1) {
            let current = communities[idx].members;
            if (typeof current === 'number' && current > 0) {
                communities[idx].members = current - 1;
                localStorage.setItem('communities', JSON.stringify(communities));
            }
        }
    }
}