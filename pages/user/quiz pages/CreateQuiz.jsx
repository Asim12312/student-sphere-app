import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import { IoAdd, IoTrash, IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId;

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [course, setCourse] = useState('General');
    const [timeLimit, setTimeLimit] = useState(10);
    const [questions, setQuestions] = useState([
        { questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }] }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, {
            questionText: '',
            options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex][field] = value;

        // Ensure only one correct answer per question if setting to true
        if (field === 'isCorrect' && value === true) {
            newQuestions[qIndex].options.forEach((opt, idx) => {
                if (idx !== oIndex) opt.isCorrect = false;
            });
        }
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!title) return toast.error("Please enter a quiz title");
        if (questions.length === 0) return toast.error("Add at least one question");

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText) return toast.error(`Question ${i + 1} is missing text`);
            const hasCorrect = questions[i].options.some(o => o.isCorrect);
            const hasEmptyOption = questions[i].options.some(o => !o.text);
            if (!hasCorrect) return toast.error(`Question ${i + 1} needs a correct answer`);
            if (hasEmptyOption) return toast.error(`Question ${i + 1} has empty options`);
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/quizzes/create', {
                title,
                description,
                course,
                creator: userId,
                timeLimit,
                questions
            });

            if (response.data.success) {
                toast.success("Quiz created successfully!");
                navigate('/quizzes');
            }
        } catch (error) {
            console.error("Error creating quiz:", error);
            toast.error("Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Create Quiz" message2="Challenge the community" />

            <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800">
                    <IoArrowBack /> Back
                </button>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Quiz Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-gray-700 font-semibold mb-1">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Advanced React Patterns"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-700 font-semibold mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe what this quiz covers..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none h-20"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Course</label>
                                <select
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Formal methods">Formal methods</option>
                                    <option value="Machine learning">Machine learning</option>
                                    <option value="Web development">Web development</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">Time Limit (mins)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-2xl shadow-sm p-6 relative border-l-4 border-purple-500">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-gray-800">Question {qIndex + 1}</h3>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <IoTrash />
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                    placeholder="Enter your question here..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateOption(qIndex, oIndex, 'isCorrect', !opt.isCorrect)}
                                                className={`text-2xl ${opt.isCorrect ? 'text-green-500' : 'text-gray-300 hover:text-green-300'}`}
                                            >
                                                <IoCheckmarkCircle />
                                            </button>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`}
                                                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${opt.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addQuestion}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <IoAdd /> Add Question
                        </button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'Creating...' : 'Publish Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuiz;
