import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import "./SettingsModal.css";

function SettingsModal({ onClose }) {
    const { user, logout, authFetch } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDeleteAllChats = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setDeleting(true);
        try {
            // Fetch all threads, then delete each
            const response = await authFetch(`${API_BASE}/api/thread`);
            const threads = await response.json();

            if (Array.isArray(threads)) {
                for (const thread of threads) {
                    await authFetch(`${API_BASE}/api/thread/${thread.threadId}`, { method: "DELETE" });
                }
                showToast("All chats deleted successfully");
                setDeleteConfirm(false);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to delete chats", "error");
        } finally {
            setDeleting(false);
        }
    };

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("settings-overlay")) {
            onClose();
        }
    };

    // Close on Escape
    const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
    };

    return (
        <div className="settings-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown} tabIndex={-1} ref={(el) => el?.focus()}>
            <div className="settings-modal">
                {/* Header */}
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="settings-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Profile Section */}
                <div className="settings-section">
                    <h3 className="settings-section-title">Profile</h3>
                    <div className="settings-profile">
                        <div className="settings-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="settings-profile-info">
                            <div className="settings-profile-name">{user?.name}</div>
                            <div className="settings-profile-email">{user?.email}</div>
                            <div className="settings-profile-role">
                                <span className="role-badge">{user?.role || "user"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-divider"></div>

                {/* Appearance Section */}
                <div className="settings-section">
                    <h3 className="settings-section-title">Appearance</h3>
                    <div className="settings-row" onClick={toggleTheme}>
                        <div className="settings-row-left">
                            <i className={`fa-solid ${theme === "dark" ? "fa-moon" : "fa-sun"}`}></i>
                            <div>
                                <div className="settings-row-label">Theme</div>
                                <div className="settings-row-desc">
                                    {theme === "dark" ? "Dark mode is active" : "Light mode is active"}
                                </div>
                            </div>
                        </div>
                        <div className={`theme-switch ${theme === "light" ? "theme-switch-on" : ""}`}>
                            <div className="theme-switch-thumb"></div>
                        </div>
                    </div>
                </div>

                <div className="settings-divider"></div>

                {/* Data Section */}
                <div className="settings-section">
                    <h3 className="settings-section-title">Data</h3>
                    <div
                        className={`settings-row settings-row-danger ${deleteConfirm ? "settings-row-confirm" : ""}`}
                        onClick={handleDeleteAllChats}
                    >
                        <div className="settings-row-left">
                            <i className={`fa-solid ${deleting ? "fa-spinner fa-spin" : "fa-trash-can"}`}></i>
                            <div>
                                <div className="settings-row-label">
                                    {deleteConfirm ? "Click again to confirm" : "Delete all chats"}
                                </div>
                                <div className="settings-row-desc">
                                    {deleteConfirm
                                        ? "This action cannot be undone"
                                        : "Permanently remove all your conversations"
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-divider"></div>

                {/* Account Section */}
                <div className="settings-section">
                    <div className="settings-row" onClick={() => { onClose(); logout(); }}>
                        <div className="settings-row-left">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                            <div>
                                <div className="settings-row-label">Log out</div>
                                <div className="settings-row-desc">Sign out of your account</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast notification */}
                {toast && (
                    <div className={`settings-toast ${toast.type === "error" ? "settings-toast-error" : ""}`}>
                        <i className={`fa-solid ${toast.type === "error" ? "fa-circle-xmark" : "fa-circle-check"}`}></i>
                        {toast.message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsModal;
