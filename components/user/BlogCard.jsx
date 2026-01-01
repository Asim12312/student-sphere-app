import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoChatbubbleOutline, IoPersonCircleOutline } from 'react-icons/io5';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();

    // Strip HTML tags for preview snippet
    const snippet = blog.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...';

    return (
        <div
            onClick={() => navigate(`/blogs/${blog._id}`)}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
        >
            <div className="h-48 overflow-hidden relative">
                <img
                    src={blog.headerImage || "https://images.unsplash.com/photo-1499750310159-5b5f8740115c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
                    {blog.category || 'General'}
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis line-clamp-2">
                    {snippet}
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <div className="flex items-center gap-2">
                        {blog.author?.profilePicture ? (
                            <img src={blog.author.profilePicture} alt={blog.author.username} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <IoPersonCircleOutline className="w-8 h-8 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{blog.author?.username || 'Anonymous'}</span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                            <IoHeartOutline className="text-lg" />
                            <span>{blog.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <IoChatbubbleOutline className="text-lg" />
                            <span>{blog.comments?.length || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
