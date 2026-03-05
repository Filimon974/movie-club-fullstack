import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Send, LogOut, Loader2 } from 'lucide-react';

const socket = io.connect("http://localhost:5000");

export default function ChatRoom({ roomName, username, onLeave }) {
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [showTooltip, setShowTooltip] = useState(null); // Track which avatar is clicked
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!roomName) return;
        socket.emit("join_room", roomName);

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/chat/${roomName}`);
                setMessageList(res.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };
        fetchMessages();

        socket.on("receive_message", (data) => {
            setMessageList((list) => [...list, data]);
        });

        return () => socket.off("receive_message");
    }, [roomName]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageList]);

    const sendMessage = async () => {
        if (message.trim() !== "" && roomName && !isSending) {
            setIsSending(true);
            const messageData = {
                room: roomName,
                username: username,
                message: message,
                timestamp: new Date().toISOString(),
            };

            socket.emit("send_message", messageData);
            setMessage('');
            setTimeout(() => setIsSending(false), 300);
        }
    };

    // Helper to get a consistent color based on username
    const getAvatarColor = (name) => {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl flex flex-col h-[700px] shadow-2xl overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-zinc-800/80 p-5 border-b border-zinc-700/50 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white uppercase">{roomName.charAt(0)}</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{roomName}</h2>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active
                        </p>
                    </div>
                </div>
                <button onClick={onLeave} className="p-2 rounded-full hover:bg-zinc-700 text-zinc-400 transition-colors">
                    <LogOut size={22} />
                </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" onClick={() => setShowTooltip(null)}>
                {messageList.map((msg, index) => {
                    const isMe = msg.username === username;
                    return (
                        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                {/* 1. AVATAR WITH FIRST LETTER & TOOLTIP */}
                                <div className="relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowTooltip(showTooltip === index ? null : index);
                                        }}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md transition-transform active:scale-90 ${getAvatarColor(msg.username)}`}
                                    >
                                        {msg.username.charAt(0).toUpperCase()}
                                    </button>
                                    
                                    {/* Small Tooltip showing full username */}
                                    {showTooltip === index && (
                                        <div className={`absolute bottom-full mb-2 z-50 px-2 py-1 rounded bg-zinc-700 text-white text-[10px] whitespace-nowrap shadow-xl border border-zinc-600 ${isMe ? 'right-0' : 'left-0'}`}>
                                            {msg.username}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700"></div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Chat Bubble */}
                                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                    isMe 
                                    ? 'bg-red-600 text-white rounded-tr-none' 
                                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                            <span className="text-[9px] text-zinc-500 mt-1 px-12">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-800/30 border-t border-zinc-800">
                <div className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-2xl p-1.5 focus-within:border-red-600/50 shadow-inner">
                    <input 
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Say something..."
                        className="flex-1 bg-transparent text-white px-4 py-2.5 focus:outline-none text-sm"
                        disabled={isSending}
                    />
                    <button 
                        onClick={sendMessage} 
                        disabled={isSending || !message.trim()}
                        className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                            isSending || !message.trim() 
                            ? 'bg-zinc-800 text-zinc-600' 
                            : 'bg-red-600 text-white hover:bg-red-500 active:scale-95 shadow-lg'
                        }`}
                    >
                        {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}