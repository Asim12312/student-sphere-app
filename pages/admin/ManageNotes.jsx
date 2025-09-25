import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify' // Added missing import
import AdminSideBar from '../../components/admin/AdminSidebar'
import Header from '../../components/Header'
import { MdDelete } from "react-icons/md";
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
    const [selectedCourse, setSelectedCourse] = useState('');
    const [searchNote, setSearchNote] = useState('');
    const [selectedCheck, setSelectedCheck] = useState(false);
    const [searchCheck, setSearchCheck] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null); // Added missing state
    const [noteEdit, setNoteEdit] = useState(true); // This appears unused, consider removing

    useEffect(() => {
        axios.get('http://localhost:3000/file/notes')
            .then(res => setNotes(res.data))
            .catch(err => console.error('Error fetching notes', err));
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !file) {
            return toast.error("❌ Please write title and upload a file!");
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
                setNotes(prev => [res.data.note, ...prev]);
            } else {
                toast.error("❌ Error in uploading file, try again later");
            }
        } catch (error) {
            console.log(error);
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

    // Added delete function
    const handleDelete = async (noteId) => {
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
        if (selectedFile) {
            toast.success(`File selected: ${selectedFile.name}`);
        }
    };

    // Fixed handleEdit function
    const handleEdit = async (noteId) => {
        if (!title.trim()) {
            toast.error("❌ Title cannot be empty");
            return;
        }

        try {
            const res = await axios.put(`http://localhost:3000/file/notes/${noteId}`, {
                title: title,
                course: course
            });

            if (res.status === 200) {
                // Update the note in the local state
                setNotes(prev => prev.map(note => 
                    note._id === noteId 
                        ? { ...note, title: title, course: course }
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
        setTitle('');
        setCourse('');
    };

    return (
        <>
            <div className="h-screen w-screen grid grid-cols-[1fr_5fr]">
                <AdminSideBar />
                <div className="grid grid-rows-[1fr_2fr_3fr_3fr] p-4 overflow-y-auto">
                    <Header message1="Manage notes" message2="You can delete, update and upload notes here" />
                    <p className="font-bold text-2xl mb-4 ml-6 mt-5">Upload notes here</p>

                    <div className="bg-yellow-200 w-full h-25 rounded-3xl border-2 border-yellow-500 flex justify-center items-center">
                        <form onSubmit={handleUpload} className="flex gap-4 items-center">
                            <input
                                type="text"
                                value={title}
                                placeholder="Write file title here..."
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-60 h-10 border-2 border-yellow-700 placeholder:text-xl pl-2 rounded-2xl"
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
                                className="rounded-2xl border-2 font-semibold border-yellow-500 h-10 w-24 bg-yellow-400 hover:bg-yellow-500"
                            >
                                Upload
                            </button>
                        </form>
                    </div>

                    <div className="mt-6">
                        <p className="text-2xl pl-4 font-bold mb-4">Search Notes to manage here</p>

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
                        
                        <div className="flex justify-center items-center">
                            <ul className="w-full max-w-4xl">
                                {(selectedCheck || searchCheck) &&
                                    notes
                                        .filter(note => {
                                            if (selectedCheck) {
                                                return note.course === selectedCourse;
                                            }
                                            if (searchCheck) {
                                                return note.title.toLowerCase().includes(searchNote.toLowerCase());
                                            }
                                            return false;
                                        })
                                        .map(note => (
                                            <li
                                                key={note._id}
                                                className="p-3 bg-yellow-200 mb-2 border-2 border-yellow-500 rounded-2xl flex justify-between items-center"
                                            >
                                                <div className="flex-1">
                                                    {editingNoteId === note._id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type='text'
                                                                value={title}
                                                                onChange={(e) => setTitle(e.target.value)}
                                                                className='h-10 w-60 rounded-2xl pl-2 border-2 border-yellow-700'
                                                                placeholder="Enter new title"
                                                            />
                                                            <select
                                                                value={course}
                                                                onChange={(e) => setCourse(e.target.value)}
                                                                className="h-10 rounded-2xl border-2 border-yellow-700 px-2"
                                                            >
                                                                <option value="">Select course</option>
                                                                <option value="Formal methods">Formal methods</option>
                                                                <option value="Machine learning">Machine learning</option>
                                                                <option value="Web development">Web development</option>
                                                            </select>
                                                            <button
                                                                onClick={() => handleEdit(note._id)}
                                                                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
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

                                                {editingNoteId !== note._id && (
                                                    <div className='flex items-center gap-4'>
                                                        <button
                                                            onClick={() => {
                                                                setEditingNoteId(note._id);
                                                                setTitle(note.title);
                                                                setCourse(note.course);
                                                            }}
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

                                                        <button
                                                            onClick={() => handleDownload(note)}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-2xl cursor-pointer"
                                                        >
                                                            Download
                                                        </button>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ManageNotes