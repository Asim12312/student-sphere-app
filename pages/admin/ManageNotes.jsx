import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSideBar from '../../components/admin/AdminSidebar';
import { MdDelete, MdDownload } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

function getCurrentUser() {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData).userId : null;
}

const ManageNotes = () => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [course, setCourse] = useState('');
    const [notes, setNotes] = useState([]);
    
    // Filtering states
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchTitle, setSearchTitle] = useState('');
    
    // Editing states
    const [editingNoteId, setEditingNoteId] = useState(null); 
    const [editTitle, setEditTitle] = useState('');
    const [editCourse, setEditCourse] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('http://localhost:3000/file/notes');
            setNotes(res.data);
        } catch (err) {
            console.error('Error fetching notes', err);
            toast.error("Failed to load notes");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !file || !course) {
            return toast.error("❌ Please provide a title, course, and file!");
        }

        const userId = getCurrentUser();
        if (!userId) {
            return toast.error("❌ User not logged in! Make sure to log in properly.");
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
                // Reset file input in the DOM
                document.getElementById('noteFileInput').value = '';
                toast.success("✅ File uploaded successfully");
                setNotes(prev => [res.data.note, ...prev]);
            } else {
                toast.error("❌ Error in uploading file, try again later");
            }
        } catch (error) {
            console.error(error);
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
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            const res = await axios.delete(`http://localhost:3000/file/notes/${noteId}`);
            if (res.status === 200) {
                setNotes(prev => prev.filter(note => note._id !== noteId));
                toast.success("✅ Note deleted successfully");
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error("❌ Failed to delete note");
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const startEdit = (note) => {
        setEditingNoteId(note._id);
        setEditTitle(note.title);
        setEditCourse(note.course);
    };

    const handleEditSave = async (noteId) => {
        if (!editTitle.trim() || !editCourse.trim()) {
            toast.error("❌ Title and Course cannot be empty");
            return;
        }

        try {
            const res = await axios.put(`http://localhost:3000/file/notes/${noteId}`, {
                title: editTitle,
                course: editCourse
            });

            if (res.status === 200) {
                setNotes(prev => prev.map(note => 
                    note._id === noteId 
                        ? { ...note, title: editTitle, course: editCourse }
                        : note
                ));
                setEditingNoteId(null);
                toast.success("✅ Note updated successfully");
            }
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error("❌ Error updating note!");
        }
    };

    const cancelEdit = () => {
        setEditingNoteId(null);
    };

    // Derived filtered notes
    const filteredNotes = notes.filter(note => {
        const matchCourse = selectedCourse ? note.course === selectedCourse : true;
        const matchTitle = searchTitle ? note.title.toLowerCase().includes(searchTitle.toLowerCase()) : true;
        return matchCourse && matchTitle;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminSideBar />
            
            <div className="flex-grow p-4 md:p-8 pt-28">
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Header Banner */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-gray-800">Manage Notes</h1>
                            <p className="text-gray-500 mt-1">Upload, update, and delete academic resources.</p>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Upload New Note</h2>
                        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    placeholder="e.g. Chapter 4 Summary"
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition w-full"
                                />
                            </div>
                            
                            <div className="flex-1 w-full flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Course Category</label>
                                <select
                                    value={course}
                                    onChange={(e) => setCourse(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition w-full bg-white"
                                >
                                    <option value="">Select course...</option>
                                    <option value="Formal methods">Formal methods</option>
                                    <option value="Machine learning">Machine learning</option>
                                    <option value="Web development">Web development</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                </select>
                            </div>

                            <div className="flex-1 w-full flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">Document File</label>
                                <div className="relative">
                                    <input
                                        id="noteFileInput"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-600 font-bold text-white px-6 py-2 h-10 rounded-lg shadow-sm transition whitespace-nowrap"
                            >
                                Upload
                            </button>
                        </form>
                    </div>

                    {/* Filter and List Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Available Notes ({filteredNotes.length})</h2>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="border border-gray-300 h-10 rounded-lg px-3 bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500 outline-none w-full sm:w-48"
                                >
                                    <option value="">All Courses</option>
                                    <option value="Formal methods">Formal methods</option>
                                    <option value="Machine learning">Machine learning</option>
                                    <option value="Web development">Web development</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search specific title..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                    className="border border-gray-300 h-10 rounded-lg px-3 bg-gray-50 text-sm focus:ring-2 focus:ring-amber-500 outline-none w-full sm:w-64"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredNotes.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">No notes match your filters.</p>
                            ) : (
                                filteredNotes.map(note => (
                                    <div key={note._id} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex-1">
                                            {editingNoteId === note._id ? (
                                                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
                                                    <input
                                                        type='text'
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className='h-10 w-full sm:w-64 rounded-lg px-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm'
                                                        placeholder="Enter new title"
                                                    />
                                                    <select
                                                        value={editCourse}
                                                        onChange={(e) => setEditCourse(e.target.value)}
                                                        className="h-10 w-full sm:w-auto rounded-lg px-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white"
                                                    >
                                                        <option value="Formal methods">Formal methods</option>
                                                        <option value="Machine learning">Machine learning</option>
                                                        <option value="Web development">Web development</option>
                                                        <option value="Software Engineering">Software Engineering</option>
                                                    </select>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <button onClick={() => handleEditSave(note._id)} className="bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2 rounded-lg transition sm:flex-1">Save</button>
                                                        <button onClick={cancelEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg transition sm:flex-1 border border-gray-300">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{note.title}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{note.course}</span>
                                                        <span className="text-xs text-gray-400">ID: {note._id.substring(0,8)}...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {editingNoteId !== note._id && (
                                            <div className='flex items-center gap-2 self-end md:self-auto bg-gray-50 border border-gray-100 p-1.5 rounded-lg'>
                                                <button
                                                    onClick={() => startEdit(note)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                                                    title="Edit note"
                                                >
                                                    <CiEdit size={22} className="stroke-1" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(note)}
                                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition"
                                                    title="Download note"
                                                >
                                                    <MdDownload size={20} />
                                                </button>
                                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                                <button
                                                    onClick={() => handleDelete(note._id)}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                                                    title="Delete note"
                                                >
                                                    <MdDelete size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageNotes;