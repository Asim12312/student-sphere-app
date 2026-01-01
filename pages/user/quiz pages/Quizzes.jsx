import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoAdd, IoSearch, IoTimeOutline, IoTrophyOutline } from 'react-icons/io5';

const Quizzes = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [course, setCourse] = useState('All');

    useEffect(() => {
        fetchQuizzes();
    }, [course, searchTerm]);

    const fetchQuizzes = async () => {
        try {
            const params = {};
            if (course !== 'All') params.course = course;
            if (searchTerm) params.search = searchTerm;

            const response = await axios.get('http://localhost:3000/quizzes', { params });
            if (response.data.success) {
                setQuizzes(response.data.quizzes);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Quiz Arena" message2="Test your knowledge and compete" />

            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search quizzes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                        </div>
                        <select
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                        >
                            <option value="All">All Courses</option>
                            <option value="Formal methods">Formal methods</option>
                            <option value="Machine learning">Machine learning</option>
                            <option value="Web development">Web development</option>
                        </select>
                    </div>

                    <button
                        onClick={() => navigate('/quizzes/create')}
                        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <IoAdd className="text-xl" />
                        <span>Create Quiz</span>
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">Loading quizzes...</div>
                ) : quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map(quiz => (
                            <div key={quiz._id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                                            {quiz.course || 'General'}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                                            <IoTimeOutline />
                                            <span>{quiz.timeLimit} mins</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                                            <IoTrophyOutline />
                                            <span>{quiz.questions.length} Qs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">By {quiz.creator?.username}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/quizzes/${quiz._id}`)}
                                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
                                    >
                                        Start Quiz
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">No quizzes found</h3>
                        <p className="text-gray-500 mt-2">Challenge others by creating the first quiz!</p>
                        <button
                            onClick={() => navigate('/quizzes/create')}
                            className="mt-6 text-purple-600 font-semibold hover:underline"
                        >
                            Create Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quizzes;
