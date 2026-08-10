import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import {v1 as uuidv1} from "uuid";
import blackLogo from "./assets/blacklogo.png";

function Sidebar() {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats} = useContext(MyContext);
    const { authFetch } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080";

    const getAllThreads = async () => {
        try {
            const response = await authFetch(`${API_BASE}/api/thread`);
            const res = await response.json();
            if (Array.isArray(res)) {
                const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
                setAllThreads(filteredData);
            } else {
                console.error("Failed to fetch threads:", res.error || res);
            }
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])


    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await authFetch(`${API_BASE}/api/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch(err) {
            console.log(err);
        }
    }   

    const deleteThread = async (threadId) => {
        try {
            const response = await authFetch(`${API_BASE}/api/thread/${threadId}`, {method: "DELETE"});
            const res = await response.json();
            console.log(res);

            //updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }

        } catch(err) {
            console.log(err);
        }
    }

    return (
        <section className="sidebar">
            {/* New Chat button */}
            <button onClick={createNewChat}>
                <img src={blackLogo} alt="gpt logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {/* Thread history */}
            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} 
                            onClick={(e) => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted": " "}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation(); //stop event bubbling
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>
 
            <div className="sidebar-bottom">
                <div className="theme-toggle-btn" onClick={toggleTheme}>
                    <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
                    <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </div>
                <div className="sign">
                    <p>By hs-techlab <i className="fa-brands fa-github-alt"></i> </p>
                </div>
            </div>
        </section>
    )
}

export default Sidebar;