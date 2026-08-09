import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("helix_token"));
    const [loading, setLoading] = useState(true);

    // On mount, validate existing token
    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setLoading(false);
        }
    }, []);

    const validateToken = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // Token is invalid/expired — clear it
                localStorage.removeItem("helix_token");
                setToken(null);
                setUser(null);
            }
        } catch (err) {
            console.error("Token validation failed:", err);
            localStorage.removeItem("helix_token");
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        localStorage.setItem("helix_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }

        localStorage.setItem("helix_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("helix_token");
        setToken(null);
        setUser(null);
    };

    // Wrapper around fetch that auto-attaches the Authorization header
    const authFetch = async (url, options = {}) => {
        const headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`
        };

        const response = await fetch(url, { ...options, headers });

        // If 401, auto-logout
        if (response.status === 401) {
            logout();
            throw new Error("Session expired. Please login again.");
        }

        return response;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
