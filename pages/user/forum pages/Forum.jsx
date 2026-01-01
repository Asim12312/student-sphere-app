import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoAdd, IoSearch, IoChatbubblesOutline, IoCheckmarkCircle, IoPersonOutline } from 'react-icons/io5';

const Forum = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('latest'); // latest, unanswered, solved

    useEffect(() => {
        fetchQuestions();
    }, [filter, searchTerm]);

    const fetchQuestions = async () => {
        try {
            const params = {};
            if (filter !== 'latest') params.filter = filter;
            if (searchTerm) params.search = searchTerm;

            const response = await axios.get('http://localhost:3000/forum', { params });
            if (response.data.success) {
                setQuestions(response.data.questions);
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Academic Forum" message2="Ask questions, get answers" />

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar / Filters */}
                    <div className="w-full lg:w-64 flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/forum/ask')}
                            className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-1 transition-all"
                        >
                            <IoAdd className="text-xl" /> Ask Question
                        </button>

                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-3 px-2">Filters</h3>
                            <button
                                onClick={() => setFilter('latest')}
                                className={`w-full text-left px-4 py-2 rounded-lg font-medium mb-1 ${filter === 'latest' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Latest Questions
                            </button>
                            <button
                                onClick={() => setFilter('unanswered')}
                                className={`w-full text-left px-4 py-2 rounded-lg font-medium mb-1 ${filter === 'unanswered' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Unanswered
                            </button>
                            <button
                                onClick={() => setFilter('solved')}
                                className={`w-full text-left px-4 py-2 rounded-lg font-medium ${filter === 'solved' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Solved
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-6 relative">
                            <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                            <input
                                type="text"
                                placeholder="Search for solutions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            />
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white h-32 rounded-2xl animate-pulse shadow-sm"></div>
                                ))}
                            </div>
                        ) : questions.length > 0 ? (
                            <div className="space-y-4">
                                {questions.map(q => (
                                    <div
                                        key={q._id}
                                        onClick={() => navigate(`/forum/${q._id}`)}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Stats Column */}
                                            <div className="hidden sm:flex flex-col items-center gap-2 min-w-[60px] text-xs font-semibold text-gray-500">
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 w-full">
                                                    <span className="text-lg text-gray-800">{q.views}</span>
                                                    <span>Views</span>
                                                </div>
                                                <div className={`flex flex-col items-center p-2 rounded-lg w-full ${q.isSolved ? 'bg-green-100 text-green-700' : 'bg-gray-50'}`}>
                                                    <span className="text-lg">{q.answers.length}</span>
                                                    <span>Ans</span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {q.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                                    {q.description}
                                                </p>

                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex gap-2">
                                                        {q.tags.map((tag, i) => (
                                                            <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        {q.author?.profilePicture ? (
                                                            <img src={q.author.profilePicture} className="w-6 h-6 rounded-full object-cover" />
                                                        ) : (
                                                            <IoPersonOutline className="text-lg" />
                                                        )}
                                                        <span>{q.author?.username}</span>
                                                        <span>•</span>
                                                        <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mobile Stats (only if small screen) */}
                                            {q.isSolved && (
                                                <div className="sm:hidden absolute top-4 right-4 text-green-500">
                                                    <IoCheckmarkCircle className="text-2xl" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800">No questions found</h3>
                                <p className="text-gray-500 mt-2">Could not find any questions matching your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forum;
