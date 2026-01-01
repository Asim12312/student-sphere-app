import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoImageOutline, IoArrowBack } from 'react-icons/io5';
import { toast } from 'react-toastify';

const CreateBlog = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [headerImage, setHeaderImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [tags, setTags] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeaderImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            return toast.error("Please fill in title and content");
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        formData.append('author', userId);
        formData.append('tags', tags);
        if (headerImage) {
            formData.append('headerImage', headerImage);
        }

        try {
            const response = await axios.post('http://localhost:3000/blogs/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                toast.success("Story published successfully!");
                navigate('/blogs');
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            toast.error("Failed to publish story");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Write Story" message2="Share your knowledge with the world" />

            <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800">
                    <IoArrowBack /> Back
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="w-full h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <IoImageOutline className="text-5xl mx-auto mb-2" />
                                    <p>Add a cover image</p>
                                </div>
                            )}
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {imagePreview && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-semibold">Change Cover</span>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <input
                            type="text"
                            placeholder="Title of your story..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-4xl font-bold placeholder-gray-300 border-none focus:ring-0 px-0"
                            autoFocus
                        />

                        <div className="flex gap-4">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="General">General</option>
                                <option value="Technology">Technology</option>
                                <option value="Campus Life">Campus Life</option>
                                <option value="Career">Career</option>
                                <option value="Research">Research</option>
                                <option value="Tutorials">Tutorials</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Tags (comma separated)..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Content */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tell your story..."
                            className="w-full min-h-[400px] text-lg text-gray-700 leading-relaxed border-none focus:ring-0 resize-y px-0"
                        ></textarea>

                        <div className="flex justify-end pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-green-700 transform hover:-translate-y-1 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {loading ? 'Publishing...' : 'Publish Story'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBlog;
