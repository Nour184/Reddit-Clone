export interface UserSession {
    username: string;
    loggedIn: boolean;
    avatar?: string;
    karma?: number;
}

const SESSION_KEY = "session";

export function setSession(user: UserSession) {
    if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        // Dispatch a custom event so other components can react immediately if they listen
        window.dispatchEvent(new Event("session-updated"));
    }
}

export function getSession(): UserSession | null {
    if (typeof window !== "undefined") {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                console.error("Failed to parse session", e);
                return null;
            }
        }
    }
    return null;
}

export function removeSession() {
    if (typeof window !== "undefined") {
        localStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new Event("session-updated"));
    }
}