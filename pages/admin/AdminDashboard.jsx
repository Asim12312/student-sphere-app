import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { MdEventNote, MdContentPasteSearch, MdOutlineReportProblem } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { TbClubsFilled } from "react-icons/tb";
import { FaShoppingCart } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboard = () => {
    const userData = JSON.parse(localStorage.getItem("adminData")) || { username: "Admin" };
    const [stats, setStats] = useState({
        users: 0,
        clubs: 0,
        products: 0,
        pendingReports: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get("http://localhost:3000/admin/stats", {
                    headers: { Authorization: `Bearer ${userData.token}` }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin statistics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [userData.token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminSidebar />

            <div className="flex-grow p-4 md:p-8 pt-28">
                
                {/* Header Section */}
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
                    <h1 className="text-4xl font-bold font-serif text-gray-800 mb-2 border-b pb-4">
                        Welcome, {userData?.username}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Select a moderation module below to manage the platform infrastructure.
                    </p>
                </div>

                {/* Analytics Snapshot */}
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border text-center border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center">
                        <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-widest">Total Users</p>
                        {loading ? <div className="h-10 w-10 border-t-2 border-indigo-600 animate-spin rounded-full"></div> : <p className="text-4xl font-black text-indigo-600">{stats.users}</p>}
                    </div>
                    <div className="bg-white border text-center border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center">
                        <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-widest">Active Clubs</p>
                        {loading ? <div className="h-10 w-10 border-t-2 border-fuchsia-600 animate-spin rounded-full"></div> : <p className="text-4xl font-black text-fuchsia-600">{stats.clubs}</p>}
                    </div>
                    <div className="bg-white border text-center border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center">
                        <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-widest">Market Items</p>
                        {loading ? <div className="h-10 w-10 border-t-2 border-pink-600 animate-spin rounded-full"></div> : <p className="text-4xl font-black text-pink-600">{stats.products}</p>}
                    </div>
                    <div className="bg-white border text-center border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                        {stats.pendingReports > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full z-0"></div>}
                        <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-widest z-10 relative">Pending Reports</p>
                        {loading ? <div className="h-10 w-10 border-t-2 border-red-600 animate-spin rounded-full"></div> : <p className="text-4xl font-black text-red-600 z-10 relative">{stats.pendingReports}</p>}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Manage Users */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-indigo-200 pb-4">
                            <FaUsers className="text-indigo-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-indigo-900">Manage Users</p>
                        </div>
                        <p className="text-indigo-700 text-sm mb-6 flex-grow">Ban rogue users or promote individuals to Admin status to help moderate.</p>
                        <NavLink
                            to="/manageUsers"
                            className="bg-indigo-500 hover:bg-indigo-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Users Panel
                        </NavLink>
                    </div>

                    {/* Manage Events */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-blue-200 pb-4">
                            <MdEventNote className="text-blue-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-blue-900">Manage Events</p>
                        </div>
                        <p className="text-blue-700 text-sm mb-6 flex-grow">Approve or reject pending event proposals submitted by groups.</p>
                        <NavLink
                            to="/manageEvents"
                            className="bg-blue-500 hover:bg-blue-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Events Panel
                        </NavLink>
                    </div>

                    {/* Manage Clubs */}
                    <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-fuchsia-200 pb-4">
                            <TbClubsFilled className="text-fuchsia-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-fuchsia-900">Manage Clubs</p>
                        </div>
                        <p className="text-fuchsia-700 text-sm mb-6 flex-grow">Force delete rogue clubs and review overarching group structures.</p>
                        <NavLink
                            to="/manageClubs"
                            className="bg-fuchsia-500 hover:bg-fuchsia-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Clubs Panel
                        </NavLink>
                    </div>

                    {/* Manage Content */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-emerald-200 pb-4">
                            <MdContentPasteSearch className="text-emerald-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-emerald-900">Manage Content</p>
                        </div>
                        <p className="text-emerald-700 text-sm mb-6 flex-grow">Moderate Blogs, Forum Questions, and Profile Posts across the board.</p>
                        <NavLink
                            to="/manageContent"
                            className="bg-emerald-500 hover:bg-emerald-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Content Panel
                        </NavLink>
                    </div>

                    {/* Manage Shopping */}
                    <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-pink-200 pb-4">
                            <FaShoppingCart className="text-pink-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-pink-900">Manage Market</p>
                        </div>
                        <p className="text-pink-700 text-sm mb-6 flex-grow">Remove prohibited items from the peer-to-peer marketplace.</p>
                        <NavLink
                            to="/manageMarket"
                            className="bg-pink-500 hover:bg-pink-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Market Panel
                        </NavLink>
                    </div>

                    {/* Manage Reports */}
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-red-200 pb-4">
                            <MdOutlineReportProblem className="text-red-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-red-900">Manage Reports</p>
                        </div>
                        <p className="text-red-700 text-sm mb-6 flex-grow">Review and resolve content flags submitted by users across all platforms.</p>
                        <NavLink
                            to="/manageReports"
                            className="bg-red-500 hover:bg-red-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Reports Panel
                        </NavLink>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
