import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoTimeOutline, IoCheckmarkCircle, IoCloseCircle, IoArrowForward } from 'react-icons/io5';

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/quizzes/${id}`);
                if (response.data.success) {
                    setQuiz(response.data.quiz);
                    setTimeLeft(response.data.quiz.timeLimit * 60);
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        let timer;
        if (started && !submitted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && started && !submitted) {
            handleSubmit();
        }
        return () => clearInterval(timer);
    }, [started, submitted, timeLeft]);

    const handleOptionSelect = (questionId, optionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        try {
            const response = await axios.post(`http://localhost:3000/quizzes/submit/${id}`, {
                userId,
                answers
            });
            if (response.data.success) {
                setResults(response.data);
            }
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Error submitting quiz. Please try again.");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <div className="text-center py-20">Loading Quiz...</div>;
    if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

    // Results View
    if (submitted && results) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header message1="Quiz Results" message2="" />
                <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-8">
                        <p className="text-gray-500 font-semibold uppercase tracking-wide">You Scored</p>
                        <h1 className="text-6xl font-extrabold text-purple-600 my-4">
                            {results.score} / {results.total}
                        </h1>
                        <p className="text-gray-600">
                            {(results.score / results.total) * 100 >= 70 ? 'Amazing Job! 🎉' : 'Keep Practicing! 💪'}
                        </p>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="mt-8 bg-black text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-800"
                        >
                            Back to Quizzes
                        </button>
                    </div>

                    <div className="space-y-6">
                        {results.results.map((res, index) => {
                            const question = quiz.questions.find(q => q._id === res.questionId);
                            return (
                                <div key={index} className={`bg-white rounded-2xl shadow-sm p-6 border-l-8 ${res.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                                    <h3 className="font-bold text-gray-800 text-lg mb-4">
                                        {index + 1}. {question.questionText}
                                    </h3>
                                    <div className="space-y-2">
                                        {question.options.map(opt => {
                                            const isSelected = res.userOptionId === opt._id;
                                            const isCorrect = res.correctOptionId === opt._id;

                                            let bgClass = "bg-gray-50 border-gray-200";
                                            if (isCorrect) bgClass = "bg-green-100 border-green-500 text-green-800 font-semibold";
                                            else if (isSelected && !isCorrect) bgClass = "bg-red-100 border-red-500 text-red-800";

                                            return (
                                                <div key={opt._id} className={`p-3 rounded-lg border ${bgClass} flex justify-between items-center`}>
                                                    <span>{opt.text}</span>
                                                    {isCorrect && <IoCheckmarkCircle className="text-green-600 text-xl" />}
                                                    {isSelected && !isCorrect && <IoCloseCircle className="text-red-600 text-xl" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Start Screen
    if (!started) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 text-4xl">
                        💡
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                    <p className="text-gray-500 mb-6">{quiz.description}</p>

                    <div className="flex justify-center gap-4 mb-8 text-sm font-semibold text-gray-600">
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                            <IoTimeOutline /> {quiz.timeLimit} mins
                        </span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                            {quiz.questions.length} Questions
                        </span>
                    </div>

                    <button
                        onClick={() => setStarted(true)}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-purple-700 transform hover:-translate-y-1 transition-all"
                    >
                        Start Quiz
                    </button>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="mt-4 text-gray-400 hover:text-gray-600 font-semibold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Question View
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header with Timer */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                        {currentQuestion + 1}/{quiz.questions.length}
                    </div>
                    <span className="hidden md:inline text-gray-500 font-medium">Question</span>
                </div>

                <div className={`px-4 py-2 rounded-full font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100">
                <div
                    className="h-full bg-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question Content */}
            <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">
                    {question.questionText}
                </h2>

                <div className="space-y-4">
                    {question.options.map((opt) => (
                        <button
                            key={opt._id}
                            onClick={() => handleOptionSelect(question._id, opt._id)}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center group ${answers[question._id] === opt._id
                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                    : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50'
                                }`}
                        >
                            <span className={`text-lg font-medium ${answers[question._id] === opt._id ? 'text-purple-800' : 'text-gray-700'}`}>
                                {opt.text}
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[question._id] === opt._id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                                }`}>
                                {answers[question._id] === opt._id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 border-t flex justify-end gap-4 max-w-3xl mx-auto w-full">
                {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 flex items-center gap-2"
                        disabled={!answers[question._id]} // Optional: force answer before next
                    >
                        Next <IoArrowForward />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transform hover:-translate-y-1 transition-all"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
};

export default TakeQuiz;
