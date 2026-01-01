import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoArrowBack, IoHelpCircleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const CreateQuestion = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            return toast.error("Please provide a title and detailed description");
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/forum/ask', {
                title,
                description,
                author: userId,
                tags
            });

            if (response.data.success) {
                toast.success("Question posted successfully!");
                navigate('/forum');
            }
        } catch (error) {
            console.error("Error posting question:", error);
            toast.error("Failed to post question");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Ask the Community" message2="Get help from your peers" />

            <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800">
                    <IoArrowBack /> Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Title</label>
                                <p className="text-sm text-gray-500 mb-2">Be specific and imagine you're asking a question to another person.</p>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. How do I center a div using CSS Flexbox?"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Description</label>
                                <p className="text-sm text-gray-500 mb-2">Include all the information someone would need to answer your question.</p>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Explain your problem details..."
                                    className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Tags</label>
                                <p className="text-sm text-gray-500 mb-2">Add up to 5 tags to describe what your question is about.</p>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="e.g. css, flexbox, layout (comma separated)"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {loading ? 'Posting...' : 'Post Question'}
                            </button>
                        </form>
                    </div>

                    {/* Tips Side */}
                    <div className="bg-blue-50 rounded-2xl p-6 h-fit border border-blue-100">
                        <div className="flex items-center gap-2 mb-4 text-blue-800">
                            <IoHelpCircleOutline className="text-2xl" />
                            <h3 className="font-bold text-lg">Posting Tips</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-blue-900">
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>Summarize your problem in a one-line title.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>Describe your problem in more detail.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>Describe what you tried and what you expected to happen.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>Add “tags” which help surface your question to members of the community.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuestion;
