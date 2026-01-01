import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../../../components/Header';
import { IoHeart, IoHeartOutline, IoChatbubbleOutline, IoRepeatOutline, IoImageOutline, IoClose } from 'react-icons/io5';

const Trends = () => {
    const [trends, setTrends] = useState([]);
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]); // NEW
    const [newTrendContent, setNewTrendContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({});

    // Comment State
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [commentText, setCommentText] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        setUserData(storedUser || {});
        fetchFeed();
        fetchTrending();
        fetchTrendingPosts(); // NEW
    }, []);

    const fetchFeed = async () => {
        try {
            const res = await axios.get('http://localhost:3000/trends/feed');
            if (res.data.success) {
                setTrends(res.data.trends);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        try {
            const res = await axios.get('http://localhost:3000/trends/trending');
            if (res.data.success) {
                setTrendingHashtags(res.data.trends);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTrendingPosts = async () => {
        try {
            const res = await axios.get('http://localhost:3000/trends/trending-posts');
            if (res.data.success) {
                setTrendingPosts(res.data.trends);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePostTrend = async () => {
        if (!newTrendContent.trim() && !selectedImage) return toast.error("Write something or add an image!");

        try {
            const formData = new FormData();
            formData.append('content', newTrendContent);
            formData.append('author', userData.userId);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const res = await axios.post('http://localhost:3000/trends/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                setNewTrendContent('');
                removeImage();
                toast.success("Trend posted! 🚀");
                fetchFeed();
                fetchTrending();
                fetchTrendingPosts(); // Refresh trending
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to post trend");
        }
    };

    const handleLike = async (trendId) => {
        try {
            const res = await axios.post(`http://localhost:3000/trends/like/${trendId}`, {
                userId: userData.userId
            });
            if (res.data.success) {
                setTrends(trends.map(t =>
                    t._id === trendId ? { ...t, likes: res.data.likes } : t
                ));
                fetchTrendingPosts(); // Refresh trending after like
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRepost = async (trendId) => {
        if (!window.confirm("Repost this trend?")) return;
        try {
            const res = await axios.post(`http://localhost:3000/trends/repost/${trendId}`, {
                userId: userData.userId
            });
            if (res.data.success) {
                toast.success("Reposted! 🔄");
                fetchFeed();
                fetchTrendingPosts(); // Refresh trending after repost
            }
        } catch (error) {
            toast.error("Failed to repost");
        }
    };

    const handleComment = async (trendId) => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`http://localhost:3000/trends/comment/${trendId}`, {
                userId: userData.userId,
                text: commentText
            });
            if (res.data.success) {
                setTrends(trends.map(t => {
                    if (t._id === trendId) {
                        return { ...t, comments: [...t.comments, res.data.comment] };
                    }
                    return t;
                }));
                setCommentText('');
                fetchTrendingPosts(); // Refresh trending after comment
            }
        } catch (error) {
            toast.error("Failed to comment");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header message1="Student Voice" message2="See what's trending on campus" />

            <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">

                {/* Left Sidebar */}
                <div className="hidden lg:block col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                        <div className="flex flex-col items-center">
                            <img src={userData.profilePic || "/male default avatar.png"} className="w-20 h-20 rounded-full mb-4 border-4 border-gray-100 object-cover" />
                            <h2 className="text-xl font-bold">{userData.username}</h2>
                            <p className="text-gray-500 text-sm">@{userData.username?.toLowerCase().replace(/\s/g, '')}</p>

                            <div className="flex w-full mt-6 justify-between text-center">
                                <div>
                                    <span className="block font-bold text-lg">{trends.filter(t => t.author?._id === userData.userId).length}</span>
                                    <span className="text-xs text-gray-400 uppercase">Posts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="col-span-1 lg:col-span-2 space-y-4">

                    {/* Compose Box */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex gap-4">
                            <img src={userData.profilePic || "/male default avatar.png"} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1">
                                <textarea
                                    value={newTrendContent}
                                    onChange={(e) => setNewTrendContent(e.target.value)}
                                    placeholder="What's happening? Use #hashtags to trend!"
                                    className="w-full border-none focus:ring-0 text-lg resize-none h-20 placeholder-gray-400"
                                ></textarea>

                                {/* Image Preview */}
                                {imagePreview && (
                                    <div className="relative mb-3">
                                        <img src={imagePreview} alt="Preview" className="w-full max-h-60 object-cover rounded-xl" />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                    <div className="flex gap-2 text-blue-500 text-xl">
                                        <button onClick={() => fileInputRef.current.click()} className="hover:bg-blue-50 p-2 rounded-full relative">
                                            <IoImageOutline />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handlePostTrend}
                                        disabled={!newTrendContent.trim() && !selectedImage}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts List */}
                    {trends.map(trend => {
                        const isRepost = trend.isRepost && trend.originalTrend;
                        const displayTrend = isRepost ? trend.originalTrend : trend;

                        return (
                            <div key={trend._id} className="bg-white rounded-xl shadow-sm p-4 hover:bg-gray-50 transition">
                                {isRepost && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 ml-10">
                                        <IoRepeatOutline />
                                        <span>{trend.author?.username} reposted</span>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <img src={displayTrend.author?.profilePicture || "/male default avatar.png"} className="w-12 h-12 rounded-full object-cover" />
                                    <div className="flex-1 w-full">
                                        <div className="flex gap-2 items-center">
                                            <h3 className="font-bold text-gray-900">{displayTrend.author?.username || "Unknown"}</h3>
                                            <span className="text-gray-500 text-sm">@{displayTrend.author?.username?.toLowerCase().replace(/\s/g, '')}</span>
                                            <span className="text-gray-400 text-sm">· {new Date(displayTrend.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <p className="mt-2 text-gray-800 whitespace-pre-wrap break-words">{displayTrend.content}</p>

                                        {displayTrend.mediaURL && (
                                            <img src={displayTrend.mediaURL} alt="Trend Media" className="mt-3 rounded-xl w-full object-cover max-h-96 border border-gray-100" />
                                        )}

                                        {displayTrend.hashtags?.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {displayTrend.hashtags.map(tag => (
                                                    <span key={tag} className="text-blue-500 hover:underline">#{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex justify-between mt-4 max-w-md text-gray-500 items-center">
                                            <button
                                                onClick={() => setActiveCommentId(activeCommentId === trend._id ? null : trend._id)}
                                                className="flex items-center gap-2 group hover:text-blue-500"
                                            >
                                                <div className="p-2 group-hover:bg-blue-50 rounded-full"><IoChatbubbleOutline /></div>
                                                <span className="text-sm">{displayTrend.comments?.length || 0}</span>
                                            </button>

                                            <button
                                                onClick={() => handleRepost(trend._id)} // Repost the wrapper, or handle original
                                                className="flex items-center gap-2 group hover:text-green-500"
                                            >
                                                <div className="p-2 group-hover:bg-green-50 rounded-full"><IoRepeatOutline /></div>
                                                <span className="text-sm">0</span>
                                            </button>

                                            <button
                                                onClick={() => handleLike(displayTrend._id)}
                                                className={`flex items-center gap-2 group ${displayTrend.likes?.includes(userData.userId) ? 'text-pink-600' : 'hover:text-pink-600'}`}
                                            >
                                                <div className="p-2 group-hover:bg-pink-50 rounded-full">
                                                    {displayTrend.likes?.includes(userData.userId) ? <IoHeart /> : <IoHeartOutline />}
                                                </div>
                                                <span className="text-sm">{displayTrend.likes?.length || 0}</span>
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {activeCommentId === trend._id && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                {displayTrend.comments?.map((comment, idx) => (
                                                    <div key={idx} className="flex gap-3 mb-3">
                                                        <img src={comment.user?.profilePicture || "/male default avatar.png"} className="w-8 h-8 rounded-full object-cover" />
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
                                                        placeholder="Write a reply..."
                                                        className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleComment(displayTrend._id)}
                                                    />
                                                    <button
                                                        onClick={() => handleComment(displayTrend._id)}
                                                        disabled={!commentText.trim()}
                                                        className="text-blue-500 font-bold text-sm px-2 disabled:opacity-50"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {trends.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <p className="text-gray-500 text-lg">No trends yet. Be the first to start one!</p>
                        </div>
                    )}

                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:block col-span-1 space-y-4">
                    {/* Trending Posts */}
                    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                        <h2 className="font-extrabold text-xl mb-4 text-gray-800">🔥 Trending Now</h2>
                        <div className="space-y-3">
                            {trendingPosts.slice(0, 5).map((trend, index) => (
                                <div key={trend._id} className="hover:bg-gray-50 p-3 rounded-lg cursor-pointer transition border-l-4 border-blue-500">
                                    <div className="flex items-start gap-2">
                                        <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src={trend.author?.profilePicture || "/male default avatar.png"} className="w-6 h-6 rounded-full object-cover" />
                                                <p className="font-bold text-sm text-gray-900">{trend.author?.username}</p>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2">{trend.content}</p>
                                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                <span>❤️ {trend.likes?.length || 0}</span>
                                                <span>💬 {trend.comments?.length || 0}</span>
                                                <span>🔄 {trend.repostCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {trendingPosts.length === 0 && (
                                <p className="text-gray-400 italic text-sm">No trending posts yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Trending Topics */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h2 className="font-extrabold text-lg mb-3 text-gray-800">📊 Trending Topics</h2>
                        <div className="space-y-2">
                            {trendingHashtags.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">#{item.tag}</p>
                                        <p className="text-xs text-gray-500">{item.count} posts · {item.engagement} engagement</p>
                                    </div>
                                </div>
                            ))}
                            {trendingHashtags.length === 0 && (
                                <p className="text-gray-400 italic text-sm">No trending topics yet.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Trends;
