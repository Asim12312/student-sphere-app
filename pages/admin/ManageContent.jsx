import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { toast } from 'react-toastify';

const ManageContent = () => {
    const [tab, setTab] = useState('blogs'); // 'blogs', 'questions', 'posts'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/admin/content/${tab}`);
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            } else {
                toast.error(`Failed to fetch ${tab}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(`Server error while fetching ${tab}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;

        try {
            const response = await fetch(`http://localhost:3000/admin/content/${tab}/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Content deleted successfully');
                setItems(items.filter(item => item._id !== id));
            } else {
                toast.error('Failed to delete content');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Server error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminSidebar />
            
            <div className="flex-grow p-4 md:p-8 pt-28">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                        <h1 className="text-3xl font-bold font-serif text-gray-800">Manage Content</h1>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setTab('blogs')}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'blogs' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Blogs
                            </button>
                            <button 
                                onClick={() => setTab('questions')}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'questions' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Forums
                            </button>
                            <button 
                                onClick={() => setTab('posts')}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition ${tab === 'posts' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Profile Posts
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <p className="py-8 text-center text-gray-500 text-lg">No {tab} found.</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        
                                        <div className="flex-1">
                                            {tab === 'blogs' && (
                                                <>
                                                    <h3 className="text-xl font-bold font-serif text-gray-800 mb-1">{item.title}</h3>
                                                    <p className="text-sm text-gray-500 mb-2">Category: {item.category}</p>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded line-clamp-2 md:line-clamp-1">{item.content.replace(/<[^>]+>/g, '')}</p>
                                                </>
                                            )}
                                            
                                            {tab === 'questions' && (
                                                <>
                                                    <h3 className="text-xl font-bold font-serif text-gray-800 mb-1">{item.title}</h3>
                                                    <p className="text-sm text-gray-500 mb-2">Answers: {item.answers?.length || 0} | Views: {item.views}</p>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded line-clamp-2 md:line-clamp-1">{item.description}</p>
                                                </>
                                            )}

                                            {tab === 'posts' && (
                                                <>
                                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Status Update</h3>
                                                    <p className="text-sm text-gray-500 mb-2">Likes: {item.likes?.length || 0} | Comments: {item.comments?.length || 0}</p>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded line-clamp-2 md:line-clamp-1">{item.content}</p>
                                                </>
                                            )}

                                            <div className="mt-3 text-xs text-gray-400 flex gap-4">
                                                <span>Author: {item.author?.username || item.user?.username || 'Unknown'}</span>
                                                <span>Posted: {new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <button 
                                                onClick={() => handleDelete(item._id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap"
                                            >
                                                Delete Content
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageContent;
