import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { IoSend, IoPersonCircleOutline } from 'react-icons/io5';

const ClubChat = ({ clubId, userId, username, userProfilePic }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Setup
    useEffect(() => {
        // Fetch History
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/chat/${clubId}`);
                if (res.data.success) {
                    setMessages(res.data.messages);
                }
            } catch (error) {
                console.error("Failed to load chat history");
            }
        };
        fetchHistory();

        // Connect Socket
        const newSocket = io('http://localhost:3000', { query: { userId } });
        setSocket(newSocket);

        newSocket.emit('join_club_room', clubId);

        newSocket.on('receive_club_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            newSocket.emit('leave_club_room', clubId);
            newSocket.disconnect();
        };
    }, [clubId, userId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            clubId,
            senderId: userId,
            senderName: username,
            senderPic: userProfilePic,
            content: newMessage
        };

        socket.emit('send_club_message', messageData);
        setNewMessage('');
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px] border border-gray-200">
            <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
                <span>💬 Club Chat Room</span>
                <span className="text-xs font-normal bg-blue-700 px-2 py-1 rounded-full">Live</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => {
                    const isMe = msg.sender?._id === userId || msg.sender === userId;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                {/* Avatar */}
                                {msg.sender?.profilePicture ? (
                                    <img
                                        src={msg.sender.profilePicture}
                                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        alt="avatar"
                                    />
                                ) : (
                                    <IoPersonCircleOutline className="w-8 h-8 text-gray-400" />
                                )}

                                {/* Bubble */}
                                <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMe
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                    }`}>
                                    {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender?.username || 'User'}</p>}
                                    <p className="text-sm">{msg.content}</p>
                                    <span className={`text-[10px] opacity-70 block text-right mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition shadow-md flex items-center justify-center"
                    disabled={!newMessage.trim()}
                >
                    <IoSend />
                </button>
            </form>
        </div>
    );
};

export default ClubChat;
