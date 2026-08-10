import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom on new messages or typing
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [prevChats, latestReply]);

    useEffect(() => {
        if (!reply) {
            setLatestReply(null); // Reset typing state when switching threads or on clean state
            return;
        }

        if (!prevChats?.length) return;

        // Split tokens keeping spaces and newlines intact for real-time streaming
        const content = reply.split(/(?<=\s)|(?=\s)/);

        let idx = 0;
        setLatestReply(content[0] || "");

        const interval = setInterval(() => {
            idx++;
            if (idx >= content.length) {
                setLatestReply(null); // Typing finished, render full message from prevChats
                clearInterval(interval);
            } else {
                setLatestReply(content.slice(0, idx + 1).join(""));
            }
        }, 20);

        return () => clearInterval(interval);

    }, [reply]);

    return (
        <div className="chats-container">
            {newChat && (!prevChats || prevChats.length === 0) && (
                <div className="welcome-container">
                    <h1>What can I help with today?</h1>
                    <p className="welcome-subtitle">Ask Helix anything — from writing code to brainstorming ideas.</p>
                </div>
            )}

            <div className="chats">
                {
                    prevChats?.map((chat, idx) => {
                        const isLastMessage = idx === prevChats.length - 1;
                        const isAssistant = chat.role === "assistant";
                        const showTyping = isLastMessage && isAssistant && latestReply !== null;

                        return (
                            <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                                {chat.role === "user" ? (
                                    <p className="userMessage">{chat.content}</p>
                                ) : (
                                    <ReactMarkdown 
                                        rehypePlugins={[rehypeHighlight]}
                                        remarkPlugins={[remarkGfm, remarkBreaks]}
                                    >
                                        {showTyping ? latestReply : chat.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        );
                    })
                }

                <div ref={chatEndRef} />
            </div>
        </div>
    );
}

export default Chat;