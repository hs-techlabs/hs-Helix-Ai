import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import {ScaleLoader} from "react-spinners";
import SettingsModal from "./SettingsModal.jsx";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, allThreads, setAllThreads, setSidebarOpen} = useContext(MyContext);
    const { user, logout, authFetch } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [upgradeToast, setUpgradeToast] = useState(false);
    const dropdownRef = useRef(null);
    const userIconRef = useRef(null);

    const getReply = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setNewChat(false);

        console.log("message ", prompt, " threadId ", currThreadId);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await authFetch(`${API_BASE}/api/chat`, options);
            const res = await response.json();
            console.log(res);
            setReply(res.reply);

            // Fetch updated thread list if this is a new thread
            const threadExists = allThreads.some(t => t.threadId === currThreadId);
            if (!threadExists) {
                const threadsResponse = await authFetch(`${API_BASE}/api/thread`);
                const threadsRes = await threadsResponse.json();
                if (Array.isArray(threadsRes)) {
                    const filteredData = threadsRes.map(thread => ({threadId: thread.threadId, title: thread.title}));
                    setAllThreads(filteredData);
                } else {
                    console.error("Failed to fetch threads:", threadsRes.error || threadsRes);
                }
            }
        } catch(err) {
            console.log(err);
        }
        setLoading(false);
    }

    //Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }]
            ));
        }

        setPrompt("");
    }, [reply]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                userIconRef.current &&
                !userIconRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    const handleSettingsClick = () => {
        setIsOpen(false);
        setShowSettings(true);
    }

    const handleUpgradeClick = () => {
        setIsOpen(false);
        setUpgradeToast(true);
        setTimeout(() => setUpgradeToast(false), 3000);
    }

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    }

    // Get user initial for avatar
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navbar-left">
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <span className="brand-title">Helix <i className="fa-solid fa-chevron-down"></i></span>
                </div>

                <div className="userIconDiv" onClick={handleProfileClick} ref={userIconRef}>
                    <span className="userIcon">{userInitial}</span>
                </div>
            </div>
            {
                isOpen && 
                    <div className="dropDown" ref={dropdownRef}>
                    <div className="dropDownItem user-info-item">
                        <i className="fa-solid fa-circle-user"></i>
                        <div>
                            <div className="user-name">{user?.name}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                    <div className="dropDown-divider"></div>
                    <div className="dropDownItem" onClick={handleSettingsClick}>
                        <i className="fa-solid fa-gear"></i> Settings
                    </div>
                    <div className="dropDownItem" onClick={handleUpgradeClick}>
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                    </div>
                    <div className="dropDownItem" onClick={toggleTheme}>
                        <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
                        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                    </div>
                    <div className="dropDown-divider"></div>
                    <div className="dropDownItem logout-item" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                    </div>
                </div>
            }

            {/* Settings Modal */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

            {/* Upgrade toast */}
            {upgradeToast && (
                <div className="upgrade-toast">
                    <i className="fa-solid fa-sparkles"></i>
                    Coming soon! Premium plans are on the way.
                </div>
            )}

            <Chat></Chat>

            <ScaleLoader color="var(--accent)" loading={loading}>
            </ScaleLoader>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input 
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
                    />
                    <div id="submit" onClick={getReply} role="button" aria-label="Send message">
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    Helix can make mistakes. Check important info.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;