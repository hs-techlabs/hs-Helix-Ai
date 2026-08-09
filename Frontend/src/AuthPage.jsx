import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import "./AuthPage.css";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, register } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name.trim()) {
                    setError("Name is required");
                    setLoading(false);
                    return;
                }
                await register(name.trim(), email, password);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setName("");
        setEmail("");
        setPassword("");
    };

    return (
        <div className="auth-page">
            {/* Theme toggle on auth page */}
            <button className="auth-theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
            </button>

            <div className="auth-container">
                {/* Left panel — branding */}
                <div className="auth-brand">
                    <div className="brand-content">
                        <div className="brand-icon">
                            <i className="fa-solid fa-atom"></i>
                        </div>
                        <h1>Helix AI</h1>
                        <p>Your intelligent conversation partner powered by advanced AI.</p>
                        <div className="brand-features">
                            <div className="brand-feature">
                                <i className="fa-solid fa-bolt"></i>
                                <span>Lightning-fast responses</span>
                            </div>
                            <div className="brand-feature">
                                <i className="fa-solid fa-lock"></i>
                                <span>Secure & private</span>
                            </div>
                            <div className="brand-feature">
                                <i className="fa-solid fa-comments"></i>
                                <span>Multi-thread conversations</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel — form */}
                <div className="auth-form-panel">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
                        <p className="auth-subtitle">
                            {isLogin
                                ? "Sign in to continue to Helix AI"
                                : "Get started with Helix AI for free"
                            }
                        </p>

                        {error && (
                            <div className="auth-error">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="input-group">
                                <label htmlFor="auth-name">Name</label>
                                <div className="input-wrapper">
                                    <i className="fa-solid fa-user input-icon"></i>
                                    <input
                                        id="auth-name"
                                        type="text"
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="auth-email">Email</label>
                            <div className="input-wrapper">
                                <i className="fa-solid fa-envelope input-icon"></i>
                                <input
                                    id="auth-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="auth-password">Password</label>
                            <div className="input-wrapper">
                                <i className="fa-solid fa-key input-icon"></i>
                                <input
                                    id="auth-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="auth-spinner"></span>
                            ) : (
                                isLogin ? "Sign In" : "Create Account"
                            )}
                        </button>

                        <p className="auth-toggle">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button type="button" onClick={toggleMode} className="toggle-btn">
                                {isLogin ? "Sign Up" : "Sign In"}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
