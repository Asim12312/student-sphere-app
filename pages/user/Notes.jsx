import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import { ToastContainer, toast } from 'react-toastify';
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

function getCurrentUser() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).userId : null;
}

const Notes = () => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [course, setCourse] = useState('');
    const [notes, setNotes] = useState([]);
    const [userNotes, setUserNotes] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchNote, setSearchNote] = useState('');
    const [selectedCheck, setSelectedCheck] = useState(false);
    const [searchCheck, setSearchCheck] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCourse, setEditCourse] = useState('');
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'manage'




    useEffect(() => {
        fetchAllNotes();
        fetchUserNotes();
    }, []);

    const fetchAllNotes = () => {
        axios.get('http://localhost:3000/file/notes')
            .then(res => setNotes(res.data))
            .catch(err => console.error('Error fetching notes', err));
    };

    const fetchUserNotes = () => {
        const userId = getCurrentUser();
        if (userId) {
            axios.get(`http://localhost:3000/file/user-notes/${userId}`)
                .then(res => setUserNotes(res.data))
                .catch(err => console.error('Error fetching user notes', err));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !file || !course) {
            return toast.error("❌ Please fill all fields and upload a file!");
        }

        const userId = getCurrentUser();
        if (!userId) {
            return toast.error("❌ User not logged in!");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("course", course);
        formData.append("userId", userId);


        try {
            const res = await axios.post('http://localhost:3000/file/upload', formData);

            if (res.status === 200 || res.status === 201) {
                setTitle("");
                setFile(null);
                setCourse('');
                toast.success("✅ File uploaded successfully");

                // Update both lists
                setNotes(prev => [res.data.note, ...prev]);
                setUserNotes(prev => [res.data.note, ...prev]);

                // Reset file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            } else {
                toast.error("❌ Error in uploading file, try again later");
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("❌ Error in uploading file!");
        }
    };

    const handleDownload = async (note) => {
        try {
            const response = await fetch(note.fileUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            // Add dot only if extension exists
            a.download = note.extension ? `${note.title}.${note.extension}` : note.title;
            a.href = downloadUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Download failed:', error);
            toast.error("❌ Download failed");
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const res = await axios.delete(`http://localhost:3000/file/notes/${noteId}`);
            if (res.status === 200) {
                // Remove from both lists
                setNotes(prev => prev.filter(note => note._id !== noteId));
                setUserNotes(prev => prev.filter(note => note._id !== noteId));
                toast.success("✅ Note deleted successfully");
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error("❌ Failed to delete note");
        }
    };

    const handleEdit = async (noteId) => {
        if (!editTitle.trim()) {
            toast.error("❌ Title cannot be empty");
            return;
        }

        try {
            const res = await axios.put(`http://localhost:3000/file/notes/${noteId}`, {
                title: editTitle,
                course: editCourse
            });

            if (res.status === 200) {
                // Update both lists
                const updateNote = (note) =>
                    note._id === noteId
                        ? { ...note, title: editTitle, course: editCourse }
                        : note;

                setNotes(prev => prev.map(updateNote));
                setUserNotes(prev => prev.map(updateNote));

                setEditingNoteId(null);
                setEditTitle('');
                setEditCourse('');
                toast.success("✅ Note updated successfully");
            }
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error("❌ Error updating note!");
        }
    };

    const startEdit = (note) => {
        setEditingNoteId(note._id);
        setEditTitle(note.title);
        setEditCourse(note.course);
    };

    const cancelEdit = () => {
        setEditingNoteId(null);
        setEditTitle('');
        setEditCourse('');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            toast.success(`File selected: ${selectedFile.name}`);
        }
    };

    const renderNotesList = (notesList, showActions = false) => {
        const filteredNotes = notesList.filter(note => {
            if (selectedCheck) {
                return note.course === selectedCourse;
            }
            if (searchCheck) {
                return note.title.toLowerCase().includes(searchNote.toLowerCase());
            }
            return false;
        });

        return (
            <ul className="w-full max-w-4xl">
                {(selectedCheck || searchCheck) && filteredNotes.map(note => (
                    <li
                        key={note._id}
                        className="p-3 bg-yellow-200 mb-2 border-2 border-yellow-500 rounded-2xl flex justify-between items-center"
                    >
                        <div className="flex-1">
                            {editingNoteId === note._id ? (
                                <div className="flex gap-2 items-center">
                                    <input
                                        type='text'
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className='h-10 w-60 rounded-2xl pl-2 border-2 border-yellow-700'
                                        placeholder="Enter new title"
                                    />
                                    <select
                                        value={editCourse}
                                        onChange={(e) => setEditCourse(e.target.value)}
                                        className="h-10 rounded-2xl border-2 border-yellow-700 px-2"
                                    >
                                        <option value="">Select course</option>
                                        <option value="Formal methods">Formal methods</option>
                                        <option value="Machine learning">Machine learning</option>
                                        <option value="Web development">Web development</option>
                                    </select>
                                    <button
                                        onClick={() => handleEdit(note._id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <span className="font-semibold text-lg">{note.title}</span>
                                    <p className="text-sm text-gray-600">{note.course}</p>

                                </div>
                            )}
                        </div>

                        <div className='flex items-center gap-4'>
                            {showActions && editingNoteId !== note._id && (
                                <>
                                    <button
                                        onClick={() => startEdit(note)}
                                        className="text-2xl text-blue-600 hover:text-blue-800 cursor-pointer"
                                        title="Edit note"
                                    >
                                        <CiEdit />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(note._id)}
                                        className="text-2xl text-red-600 hover:text-red-800 cursor-pointer"
                                        title="Delete note"
                                    >
                                        <MdDelete />
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => handleDownload(note)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-2xl cursor-pointer"
                            >
                                Download
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header message1="Notes" message2="Browse and manage your notes" />
                <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                    {/* Upload Section */}

                    {/* Upload Section */}
                    <div className="mb-6">
                        <p className="font-bold text-2xl mb-4 ml-6">Upload notes here</p>
                        <div className="bg-yellow-200 w-full rounded-3xl border-2 border-yellow-500 flex justify-center items-center p-4">
                            <form onSubmit={handleUpload} className="flex gap-4 items-center flex-wrap">
                                <input
                                    type="text"
                                    value={title}
                                    placeholder="Write file title here..."
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-60 h-10 border-2 border-yellow-700 placeholder:text-sm pl-2 rounded-2xl"
                                />
                                <select
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    required
                                    className="border-2 border-yellow-700 rounded-2xl h-10 px-2"
                                >
                                    <option value="">Select course</option>
                                    <option value="Formal methods">Formal methods</option>
                                    <option value="Machine learning">Machine learning</option>
                                    <option value="Web development">Web development</option>
                                </select>

                                <label className="h-10 cursor-pointer inline-block bg-yellow-400 font-semibold px-4 py-2 rounded hover:bg-yellow-500">
                                    Choose File
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-sm text-gray-600">{file ? "✅ File chosen" : "No file chosen"}</p>

                                <button
                                    type="submit"
                                    className="rounded-2xl border-2 font-semibold border-yellow-500 h-10 px-6 bg-yellow-400 hover:bg-yellow-500"
                                >
                                    Upload
                                </button>
                            </form>
                        </div>
                    </div>



                    {/* Content Section */}
                    <div className="mt-2">
                        <p className="text-2xl pl-4 font-bold mb-4">
                            {activeTab === 'browse' ? 'Browse & Download Notes' : 'Manage My Notes'}
                        </p>

                        {/* Search Controls */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex justify-center">
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => {
                                        setSelectedCourse(e.target.value);
                                        setSelectedCheck(true);
                                        setSearchCheck(false);
                                        setSearchNote('');
                                    }}
                                    className="border-2 border-yellow-700 h-12 rounded-2xl w-72 px-2"
                                >
                                    <option value="">Search notes by course</option>
                                    <option value="Formal methods">Formal methods</option>
                                    <option value="Machine learning">Machine learning</option>
                                    <option value="Web development">Web development</option>
                                </select>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    placeholder="Search notes by name here..."
                                    value={searchNote}
                                    onChange={(e) => {
                                        setSearchNote(e.target.value);
                                        setSearchCheck(true);
                                        setSelectedCheck(false);
                                        setSelectedCourse('');
                                    }}
                                    className="border-2 border-yellow-700 h-12 rounded-2xl w-72 placeholder:font-semibold pl-2"
                                />
                            </div>
                        </div>

                        {/* Notes List */}
                        <div className="flex justify-center items-center">
                            {activeTab === 'browse'
                                ? renderNotesList(notes, false)
                                : renderNotesList(userNotes, true)
                            }
                        </div>

                        {/* Empty State */}
                        {activeTab === 'manage' && userNotes.length === 0 && (
                            <div className="text-center mt-8">
                                <p className="text-gray-600 text-lg">You haven't uploaded any notes yet.</p>
                                <p className="text-gray-500">Upload your first note using the form above!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={2000} />
        </>
    );
};

export default Notes;