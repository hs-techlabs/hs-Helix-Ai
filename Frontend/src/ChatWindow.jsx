import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useContext, useState, useEffect } from "react";
import {ScaleLoader} from "react-spinners";

function ChatWindow() {
    const {prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, allThreads, setAllThreads} = useContext(MyContext);
    const { user, logout, authFetch } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const getReply = async () => {
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
            const threadExists = allThreads?.some(t => t.threadId === currThreadId);
            if (!threadExists) {
                const threadsResponse = await authFetch(`${API_BASE}/api/thread`);
                const threadsRes = await threadsResponse.json();
                if (Array.isArray(threadsRes)) {
                    const filteredData = threadsRes.map(thread => ({threadId: thread.threadId, title: thread.title}));
                    setAllThreads(filteredData);
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


    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>Helix <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv" onClick={handleProfileClick}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {
                isOpen && 
                <div className="dropDown">
                    <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                    <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                    <div className="dropDownItem" onClick={logout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                </div>
            }
            <Chat></Chat>

            <ScaleLoader color="#fff" loading={loading}>
            </ScaleLoader>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
                    >
                           
                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    Helix can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;