import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import SideBar from "./SideBar";
import SubHeader from "../../pages/user/club pages/SubHeader";
import axios from "axios";
import { useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const CreateEventForm = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [venue, setVenue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [capacity, setCapacity] = useState("");
    const [ticketPrice, setTicketPrice] = useState("");
    const [image, setImage] = useState("");

    const params = useParams();
    const clubId = params.id || "";
    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.userId || "";

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }
        setImage(file);
    };

    const isValidObjectId = (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
    };

    const handleEventForm = async (e) => {
        e.preventDefault();

        if (!title || !description || !venue || !startDate || !endDate || !capacity || !ticketPrice) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!clubId) {
            toast.error("Invalid club ID. Please navigate to this page from a valid club.");
            return;
        }

        if (!userId || !isValidObjectId(userId)) {
            toast.error("Invalid user ID. Please log in again.");
            return;
        }

        if (isNaN(capacity) || capacity <= 0) {
            toast.error("Capacity must be a positive number");
            return;
        }

        if (isNaN(ticketPrice) || ticketPrice < 0) {
            toast.error("Ticket price must be a non-negative number");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("venue", venue);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        formData.append("capacity", capacity);
        formData.append("ticketPrice", ticketPrice);
        formData.append("clubId", clubId);
        formData.append("userId", userId);
        if (image) formData.append("image", image);

        try {
            const res = await axios.post(
                "http://localhost:3000/eventFunctions/createEvent",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.status === 200) {
                toast.success("Event created successfully 🚀");
                // Reset form
                setTitle("");
                setDescription("");
                setVenue("");
                setStartDate("");
                setEndDate("");
                setCapacity("");
                setTicketPrice("");
                setImage("");
            }
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    return (
        <>
            <SideBar />
            <SubHeader />

            <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
                <form
                    onSubmit={handleEventForm}
                    className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8 space-y-5"
                >
                    <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">
                        Create Event
                    </h2>

                    {/* Title */}
                    <div>
                        <label className="block text-gray-600 mb-1">Title *</label>
                        <input
                            type="text"
                            placeholder="Enter event title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-600 mb-1">Description *</label>
                        <textarea
                            placeholder="Enter event description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            rows="3"
                        />
                    </div>

                    {/* Venue */}
                    <div>
                        <label className="block text-gray-600 mb-1">Venue *</label>
                        <input
                            type="text"
                            placeholder="Enter venue"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 mb-1">Start Date *</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">End Date *</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>

                    {/* Capacity & Ticket Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 mb-1">Capacity *</label>
                            <input
                                type="number"
                                placeholder="Enter capacity"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">Ticket Price *</label>
                            <input
                                type="number"
                                placeholder="Enter price"
                                value={ticketPrice}
                                onChange={(e) => setTicketPrice(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>

                    {/* Banner */}
                    <div>
                        <label className="block text-gray-600 mb-1">Banner</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                        />
                        {image && (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                className="mt-2 h-32 object-cover rounded-lg"
                            />
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition"
                    >
                        Create Event
                    </button>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={1500} />
        </>
    );
};

export default CreateEventForm;
