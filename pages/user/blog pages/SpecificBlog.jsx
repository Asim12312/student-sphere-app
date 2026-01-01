import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoArrowBack, IoHeart, IoHeartOutline, IoPaperPlaneOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const SpecificBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/blogs/${id}`);
            if (response.data.success) {
                setBlog(response.data.blog);
            } else {
                toast.error("Blog not found");
                navigate('/blogs');
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Error loading story");
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/blogs/like/${id}`, { userId });
            if (response.data.success) {
                setBlog(prev => ({ ...prev, likes: response.data.likes }));
            }
        } catch (error) {
            console.error("Error liking blog:", error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await axios.post(`http://localhost:3000/blogs/comment/${id}`, {
                userId,
                text: commentText
            });
            if (response.data.success) {
                setBlog(prev => ({
                    ...prev,
                    comments: [...prev.comments, response.data.comment]
                }));
                setCommentText('');
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            toast.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!blog) return null;

    const isLiked = blog.likes.includes(userId);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header message1="Reading Story" message2="" />

            {/* Hero Image */}
            <div className="w-full h-80 relative">
                <div className="absolute inset-0 bg-black/30 w-full h-full z-10"></div>
                <img
                    src={blog.headerImage || "https://images.unsplash.com/photo-1499750310159-5b5f8740115c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={() => navigate('/blogs')}
                    className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-all"
                >
                    <IoArrowBack size={24} />
                </button>
            </div>

            <div className="max-w-3xl mx-auto w-full px-4 -mt-20 relative z-20 pb-20">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
                    {/* Meta */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            {blog.category}
                        </span>
                        <span className="text-gray-400 text-sm">
                            {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {blog.title}
                    </h1>

                    {/* Author */}
                    <div className="flex items-center gap-4 mb-8 border-b pb-8">
                        {blog.author?.profilePicture ? (
                            <img src={blog.author.profilePicture} alt={blog.author.username} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <IoPersonCircleOutline className="w-12 h-12 text-gray-400" />
                        )}
                        <div>
                            <p className="font-bold text-gray-800">{blog.author?.username}</p>
                            <p className="text-xs text-gray-500">Author</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 whitespace-pre-wrap">
                        {blog.content}
                    </div>

                    {/* Like Action */}
                    <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 text-xl font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                        >
                            {isLiked ? <IoHeart className="text-3xl" /> : <IoHeartOutline className="text-3xl" />}
                            <span>{blog.likes.length}</span>
                        </button>
                        <span className="text-xl text-gray-400">|</span>
                        <span className="text-gray-600 font-semibold">{blog.comments.length} Comments</span>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold mb-6">Discussion</h3>

                        {/* Add Comment */}
                        <form onSubmit={handleComment} className="flex gap-4 mb-10 items-start">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xl font-bold text-gray-500 overflow-hidden">
                                {userData?.profilePicture ? (
                                    <img src={userData.profilePicture} className="w-full h-full object-cover" />
                                ) : (
                                    userId?.slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add to the discussion..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                                ></textarea>
                                <div className="text-right mt-2">
                                    <button
                                        type="submit"
                                        disabled={submittingComment}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <IoPaperPlaneOutline /> Post
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* List Comments */}
                        <div className="space-y-6">
                            {blog.comments.map((comment, index) => (
                                <div key={index} className="flex gap-4">
                                    {comment.user?.profilePicture ? (
                                        <img src={comment.user.profilePicture} alt={comment.user.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <IoPersonCircleOutline className="w-10 h-10 text-gray-400 shrink-0" />
                                    )}
                                    <div>
                                        <div className="bg-gray-50 px-5 py-3 rounded-2xl rounded-tl-none">
                                            <p className="font-bold text-gray-900 text-sm">{comment.user?.username}</p>
                                            <p className="text-gray-700 mt-1">{comment.text}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 ml-2">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SpecificBlog;
