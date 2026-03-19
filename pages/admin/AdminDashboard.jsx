import { NavLink } from "react-router-dom";
import { MdEventNote } from "react-icons/md";
import { FaNoteSticky, FaUsers } from "react-icons/fa6";
import { TbClubsFilled } from "react-icons/tb";
import { FaShoppingCart } from "react-icons/fa";
import { MdContentPasteSearch } from "react-icons/md";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboard = () => {
    const userData = JSON.parse(localStorage.getItem("adminData")) || { username: "Admin" };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminSidebar />

            <div className="flex-grow p-4 md:p-8 pt-28">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-8">
                    <h1 className="text-4xl font-bold font-serif text-gray-800 mb-2 border-b pb-4">
                        Welcome, {userData?.username}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Select a moderation module below to manage the platform infrastructure.
                    </p>
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

                    {/* Manage Notes */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-6 border-b border-amber-200 pb-4">
                            <FaNoteSticky className="text-amber-600 text-3xl" />
                            <p className="font-semibold text-2xl font-serif text-amber-900">Manage Notes</p>
                        </div>
                        <p className="text-amber-700 text-sm mb-6 flex-grow">Provide official academic notes and materials to the student body.</p>
                        <NavLink
                            to="/manageNotes"
                            className="bg-amber-500 hover:bg-amber-600 text-center text-white font-semibold text-lg rounded-xl px-6 py-3 transition w-full"
                        >
                            Open Notes Panel
                        </NavLink>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
