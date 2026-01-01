import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../../../components/Header';
import { IoHeart, IoHeartOutline, IoChatbubbleOutline, IoPersonAddOutline } from 'react-icons/io5';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState('');

    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const currentUserId = userData?.userId;

    useEffect(() => {
        fetchFeed();
        fetchSuggestions();
    }, []);

    const fetchFeed = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/profile-posts/feed/${currentUserId}`);
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/social/suggestions/${currentUserId}`);
            if (res.data.success) {
                setSuggestions(res.data.suggestions);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFollow = async (userId) => {
        try {
            const res = await axios.post(`http://localhost:3000/social/follow/${userId}`, {
                userId: currentUserId
            });
            if (res.data.success) {
                setSuggestions(suggestions.filter(s => s._id !== userId));
                toast.success('Following!');
            }
        } catch (error) {
            toast.error('Failed to follow');
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`http://localhost:3000/profile-posts/like/${postId}`, {
                userId: currentUserId
            });
            if (res.data.success) {
                setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleComment = async (postId) => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`http://localhost:3000/profile-posts/comment/${postId}`, {
                userId: currentUserId,
                text: commentText
            });
            if (res.data.success) {
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        return { ...p, comments: [...p.comments, res.data.comment] };
                    }
                    return p;
                }));
                setCommentText('');
            }
        } catch (error) {
            toast.error('Failed to comment');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header message1="Home" message2="Your personalized feed" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Loading feed...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                            <p className="text-gray-500 text-lg mb-4">Your feed is empty!</p>
                            <p className="text-gray-400 mb-6">Follow people to see their posts here</p>
                            <button
                                onClick={() => navigate('/trends')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Explore Trends
                            </button>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post._id} className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex gap-3">
                                    <img
                                        src={post.author?.profilePicture || '/male default avatar.png'}
                                        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80"
                                        onClick={() => navigate(`/profile/${post.author?.username}`)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="font-bold text-gray-900 hover:underline cursor-pointer"
                                                onClick={() => navigate(`/profile/${post.author?.username}`)}
                                            >
                                                {post.author?.username}
                                            </h3>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-800 whitespace-pre-wrap">{post.content}</p>

                                        {post.media?.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-3">
                                                {post.media.map((url, idx) => (
                                                    <img key={idx} src={url} alt="Post" className="w-full rounded-lg object-cover max-h-64" />
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-6 mt-4 text-gray-600">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`flex items-center gap-2 ${post.likes?.includes(currentUserId) ? 'text-red-500' : 'hover:text-red-500'}`}
                                            >
                                                {post.likes?.includes(currentUserId) ? <IoHeart /> : <IoHeartOutline />}
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                            <button
                                                onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}
                                                className="flex items-center gap-2 hover:text-blue-500"
                                            >
                                                <IoChatbubbleOutline />
                                                <span>{post.comments?.length || 0}</span>
                                            </button>
                                        </div>

                                        {activeCommentId === post._id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                {post.comments?.map((comment, idx) => (
                                                    <div key={idx} className="flex gap-3 mb-3">
                                                        <img src={comment.user?.profilePicture || '/male default avatar.png'} className="w-8 h-8 rounded-full object-cover" />
                                                        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none">
                                                            <p className="text-xs font-bold">{comment.user?.username}</p>
                                                            <p className="text-sm">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                                    />
                                                    <button
                                                        onClick={() => handleComment(post._id)}
                                                        disabled={!commentText.trim()}
                                                        className="text-blue-500 font-bold text-sm px-2 disabled:opacity-50"
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Suggestions Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                        <h2 className="font-bold text-lg mb-4">Suggested for you</h2>
                        <div className="space-y-4">
                            {suggestions.map(user => (
                                <div key={user._id} className="flex items-center gap-3">
                                    <img
                                        src={user.profilePicture || '/male default avatar.png'}
                                        className="w-12 h-12 rounded-full object-cover cursor-pointer"
                                        onClick={() => navigate(`/profile/${user.username}`)}
                                    />
                                    <div className="flex-1">
                                        <p
                                            className="font-bold text-sm hover:underline cursor-pointer"
                                            onClick={() => navigate(`/profile/${user.username}`)}
                                        >
                                            {user.username}
                                        </p>
                                        <p className="text-xs text-gray-500">{user.bio?.substring(0, 30) || 'New user'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleFollow(user._id)}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                                    >
                                        <IoPersonAddOutline size={20} />
                                    </button>
                                </div>
                            ))}
                            {suggestions.length === 0 && (
                                <p className="text-gray-400 text-sm italic">No suggestions available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feed;
