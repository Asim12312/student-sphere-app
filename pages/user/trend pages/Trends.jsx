import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../../../components/Header';
import { IoHeart, IoHeartOutline, IoChatbubbleOutline, IoRepeatOutline, IoImageOutline } from 'react-icons/io5';

const Trends = () => {
    const [trends, setTrends] = useState([]);
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [newTrendContent, setNewTrendContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        setUserData(storedUser || {});
        fetchFeed();
        fetchTrending();
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

    const handlePostTrend = async () => {
        if (!newTrendContent.trim()) return toast.error("Write something first!");

        try {
            const res = await axios.post('http://localhost:3000/trends/create', {
                content: newTrendContent,
                author: userData.userId
            });

            if (res.data.success) {
                setTrends([res.data.trend, ...trends]); // Optimistic update (partially, author population missing)
                setNewTrendContent('');
                toast.success("Trend posted! 🚀");
                fetchFeed(); // Refresh to get populated author
                fetchTrending(); // Update hashtags
            }
        } catch (error) {
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
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header message1="Student Voice" message2="See what's trending on campus" />

            <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">

                {/* Left Sidebar (Optional Navigation or Profile Summary) */}
                <div className="hidden lg:block col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                        <div className="flex flex-col items-center">
                            <img src={userData.profilePic || "/male default avatar.png"} className="w-20 h-20 rounded-full mb-4 border-4 border-gray-100" />
                            <h2 className="text-xl font-bold">{userData.username}</h2>
                            <p className="text-gray-500 text-sm">@{userData.username?.toLowerCase().replace(/\s/g, '')}</p>

                            <div className="flex w-full mt-6 justify-between text-center">
                                <div>
                                    <span className="block font-bold text-lg">{trends.filter(t => t.author._id === userData.userId).length}</span>
                                    <span className="text-xs text-gray-400 uppercase">Posts</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-lg">0</span>
                                    <span className="text-xs text-gray-400 uppercase">Followers</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-lg">0</span>
                                    <span className="text-xs text-gray-400 uppercase">Following</span>
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
                            <img src={userData.profilePic || "/male default avatar.png"} className="w-12 h-12 rounded-full" />
                            <div className="flex-1">
                                <textarea
                                    value={newTrendContent}
                                    onChange={(e) => setNewTrendContent(e.target.value)}
                                    placeholder="What's happening? Use #hashtags to trend!"
                                    className="w-full border-none focus:ring-0 text-lg resize-none h-24 placeholder-gray-400"
                                ></textarea>
                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                    <div className="flex gap-2 text-blue-500 text-xl">
                                        <button className="hover:bg-blue-50 p-2 rounded-full"><IoImageOutline /></button>
                                        {/* Future: Add Polls, Emojis */}
                                    </div>
                                    <button
                                        onClick={handlePostTrend}
                                        disabled={!newTrendContent.trim()}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts List */}
                    {trends.map(trend => (
                        <div key={trend._id} className="bg-white rounded-xl shadow-sm p-4 hover:bg-gray-50 transition cursor-pointer">
                            <div className="flex gap-4">
                                <img src={trend.author?.profilePicture || "/male default avatar.png"} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <div className="flex gap-2 items-center">
                                        <h3 className="font-bold text-gray-900">{trend.author?.username || "Unknown"}</h3>
                                        <span className="text-gray-500 text-sm">@{trend.author?.username?.toLowerCase().replace(/\s/g, '')}</span>
                                        <span className="text-gray-400 text-sm">· {new Date(trend.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">{trend.content}</p>

                                    {trend.hashtags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {trend.hashtags.map(tag => (
                                                <span key={tag} className="text-blue-500 hover:underline">#{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-between mt-4 max-w-md text-gray-500">
                                        <button className="flex items-center gap-2 group hover:text-blue-500">
                                            <div className="p-2 group-hover:bg-blue-50 rounded-full"><IoChatbubbleOutline /></div>
                                            <span className="text-sm">0</span>
                                        </button>
                                        <button className="flex items-center gap-2 group hover:text-green-500">
                                            <div className="p-2 group-hover:bg-green-50 rounded-full"><IoRepeatOutline /></div>
                                            <span className="text-sm">0</span>
                                        </button>
                                        <button
                                            onClick={() => handleLike(trend._id)}
                                            className={`flex items-center gap-2 group ${trend.likes.includes(userData.userId) ? 'text-pink-600' : 'hover:text-pink-600'}`}
                                        >
                                            <div className="p-2 group-hover:bg-pink-50 rounded-full">
                                                {trend.likes.includes(userData.userId) ? <IoHeart /> : <IoHeartOutline />}
                                            </div>
                                            <span className="text-sm">{trend.likes.length}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {trends.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <p className="text-gray-500 text-lg">No trends yet. Be the first to start one!</p>
                        </div>
                    )}

                </div>

                {/* Right Sidebar (Trending Topics) */}
                <div className="hidden lg:block col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                        <h2 className="font-extrabold text-xl mb-4 text-gray-800">Trending Now</h2>
                        <div className="space-y-4">
                            {trendingHashtags.map((item, index) => (
                                <div key={index} className="flex justify-between items-start hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                                    <div>
                                        <p className="text-xs text-gray-500">Trending in Campus</p>
                                        <p className="font-bold text-gray-900">#{item.tag}</p>
                                        <p className="text-xs text-gray-500">{item.count} Posts</p>
                                    </div>
                                    <span className="text-gray-300">...</span>
                                </div>
                            ))}
                            {trendingHashtags.length === 0 && (
                                <p className="text-gray-400 italic">No trending topics yet.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Trends;
