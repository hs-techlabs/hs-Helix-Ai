import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if(reply === null) {
            setLatestReply(null); //prevchat load
            return;
        }

        if(!prevChats?.length) return;

        // Split tokens keeping spaces and newlines intact for real-time streaming
        const content = reply.split(/(?<=\s)|(?=\s)/);

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx+1).join(""));

            idx++;
            if(idx >= content.length) clearInterval(interval);
        }, 25);

        return () => clearInterval(interval);

    }, [prevChats, reply])

    return (
        <>
            {newChat && <h1>Start a New Chat!</h1>}
            <div className="chats">
                {
                    prevChats?.slice(0, -1).map((chat, idx) => 
                        <div className={chat.role === "user"? "userDiv" : "gptDiv"} key={idx}>
                            {
                                chat.role === "user"? 
                                <p className="userMessage">{chat.content}</p> : 
                                <ReactMarkdown 
                                    rehypePlugins={[rehypeHighlight]}
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                >
                                    {chat.content}
                                </ReactMarkdown>
                            }
                        </div>
                    )
                }

                {
                    prevChats.length > 0  && (
                        <>
                            {
                                latestReply === null ? (
                                    <div className="gptDiv" key={"non-typing"} >
                                        <ReactMarkdown 
                                            rehypePlugins={[rehypeHighlight]}
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                        >
                                            {prevChats[prevChats.length-1].content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="gptDiv" key={"typing"} >
                                        <ReactMarkdown 
                                            rehypePlugins={[rehypeHighlight]}
                                            remarkPlugins={[remarkGfm, remarkBreaks]}
                                        >
                                            {latestReply}
                                        </ReactMarkdown>
                                    </div>
                                )
                            }
                        </>
                    )
                }

            </div>
        </>
    )
}

export default Chat;