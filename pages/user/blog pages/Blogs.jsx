import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import BlogCard from '../../../components/user/BlogCard';
import { IoAdd, IoSearch } from 'react-icons/io5';

const Blogs = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    useEffect(() => {
        fetchBlogs();
    }, [category, searchTerm]); // Debounce search in real app

    const fetchBlogs = async () => {
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (searchTerm) params.search = searchTerm;

            const response = await axios.get('http://localhost:3000/blogs', { params });
            if (response.data.success) {
                setBlogs(response.data.blogs);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Student Voice" message2="Read specific articles and experiences" />

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                {/* Controls Area */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="All">All Topics</option>
                            <option value="Technology">Technology</option>
                            <option value="Campus Life">Campus Life</option>
                            <option value="Career">Career</option>
                            <option value="Research">Research</option>
                            <option value="Tutorials">Tutorials</option>
                        </select>
                    </div>

                    <button
                        onClick={() => navigate('/blogs/create')}
                        className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <IoAdd className="text-xl" />
                        <span>Write Story</span>
                    </button>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-xl h-96 animate-pulse shadow-md">
                                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map(blog => (
                            <BlogCard key={blog._id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-found-8867280-7265556.png" alt="No blogs" className="w-64 opacity-80" />
                        <h3 className="text-xl font-bold text-gray-800 mt-4">No stories found</h3>
                        <p className="text-gray-500 mt-2">Be the first to write something amazing!</p>
                        <button
                            onClick={() => navigate('/blogs/create')}
                            className="mt-6 text-blue-600 font-semibold hover:underline"
                        >
                            Start Writing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blogs;
