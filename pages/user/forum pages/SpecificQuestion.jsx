import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoArrowBack, IoCheckmarkCircle, IoCheckmarkCircleOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const SpecificQuestion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/forum/${id}`);
            if (response.data.success) {
                setQuestion(response.data.question);
            }
        } catch (error) {
            console.error("Error fetching question:", error);
            toast.error("Question not found");
            navigate('/forum');
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnswer = async (e) => {
        e.preventDefault();
        if (!answerText.trim()) return;

        setSubmitting(true);
        try {
            const response = await axios.post(`http://localhost:3000/forum/answer/${id}`, {
                userId,
                text: answerText
            });
            if (response.data.success) {
                toast.success("Answer posted!");
                setQuestion(prev => ({
                    ...prev,
                    answers: [...prev.answers, response.data.answer]
                }));
                setAnswerText('');
            }
        } catch (error) {
            toast.error("Failed to post answer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptAnswer = async (answerId) => {
        try {
            const response = await axios.post(`http://localhost:3000/forum/accept/${id}`, {
                userId,
                answerId
            });
            if (response.data.success) {
                toast.success("Answer marked as verified solution!");
                // Refresh local state to update UI
                const updatedAnswers = question.answers.map(a =>
                    a._id === answerId ? { ...a, isAccepted: true } : { ...a, isAccepted: false }
                );
                setQuestion(prev => ({ ...prev, answers: updatedAnswers, isSolved: true }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept answer (Are you the author?)");
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!question) return null;

    const isAuthor = question.author?._id === userId;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Question Details" message2="" />

            <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
                <button onClick={() => navigate('/forum')} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800">
                    <IoArrowBack /> Back to Forum
                </button>

                {/* Question Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{question.title}</h1>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                {question.description}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-t pt-6 gap-4">
                        <div className="flex gap-2">
                            {question.tags.map((tag, i) => (
                                <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl">
                            <span className="text-xs text-gray-500 font-bold uppercase">Asked by</span>
                            {question.author?.profilePicture ? (
                                <img src={question.author.profilePicture} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <IoPersonCircleOutline className="w-8 h-8 text-blue-300" />
                            )}
                            <span className="font-semibold text-blue-900">{question.author?.username}</span>
                        </div>
                    </div>
                </div>

                {/* Answers Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{question.answers.length} Answers</h3>

                    <div className="space-y-6">
                        {question.answers.map((answer) => (
                            <div
                                key={answer._id}
                                className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-all ${answer.isAccepted ? 'border-green-500 ring-4 ring-green-50' : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        {answer.author?.profilePicture ? (
                                            <img src={answer.author.profilePicture} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <IoPersonCircleOutline className="w-8 h-8 text-gray-400" />
                                        )}
                                        <div>
                                            <span className="font-bold text-gray-800">{answer.author?.username}</span>
                                            <p className="text-xs text-gray-400">
                                                {new Date(answer.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {answer.isAccepted && (
                                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                                            <IoCheckmarkCircle className="text-lg" />
                                            <span>Verified Solution</span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">
                                    {answer.text}
                                </div>

                                {/* Verification Action (Only for Author) */}
                                {isAuthor && !question.isSolved && (
                                    <button
                                        onClick={() => handleAcceptAnswer(answer._id)}
                                        className="flex items-center gap-2 text-gray-400 hover:text-green-600 font-semibold transition-colors"
                                    >
                                        <IoCheckmarkCircleOutline className="text-2xl" />
                                        <span>Mark as Correct Solution</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Post Answer */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Your Answer</h3>
                    <form onSubmit={handlePostAnswer}>
                        <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Type your solution here..."
                            className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y mb-4"
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Posting...' : 'Post Answer'}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default SpecificQuestion;
