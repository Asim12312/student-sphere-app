import { NavLink } from "react-router-dom";
import { MdEventNote } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import { TbClubsFilled } from "react-icons/tb";
import { FaShoppingCart } from "react-icons/fa";
import Header from "../../components/Header";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboard = () => {
    const userData = JSON.parse(localStorage.getItem("adminData"));

    return (
        <>
            {/* Top Fixed Header */}
            <AdminSidebar />

            {/* Main Dashboard Content */}
            <div className="pt-28 px-4 md:px-8 overflow-y-auto min-h-screen bg-gray-50">
                <Header
                    message1={`Welcome ${userData?.username}`}
                    message2="You can admin the whole website here"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Manage Events */}
                    <div className="bg-blue-200 rounded-2xl p-4 flex flex-col justify-between shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <p className="font-semibold text-2xl font-serif">Manage Events</p>
                            <MdEventNote className="text-2xl" />
                        </div>
                        <div className="flex justify-end">
                            <NavLink
                                to="/events"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-2xl px-6 py-2 transition"
                            >
                                Manage
                            </NavLink>
                        </div>
                    </div>

                    {/* Manage Notes */}
                    <div className="bg-yellow-200 rounded-2xl p-4 flex flex-col justify-between shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <p className="font-semibold text-2xl font-serif">Manage Notes</p>
                            <FaNoteSticky className="text-2xl" />
                        </div>
                        <div className="flex justify-end">
                            <NavLink
                                to="/manageNotes"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-lg rounded-2xl px-6 py-2 transition"
                            >
                                Manage
                            </NavLink>
                        </div>
                    </div>

                    {/* Manage Clubs */}
                    <div className="bg-fuchsia-200 rounded-2xl p-4 flex flex-col justify-between shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <p className="font-semibold text-2xl font-serif">Manage Clubs</p>
                            <TbClubsFilled className="text-2xl" />
                        </div>
                        <div className="flex justify-end">
                            <NavLink
                                to="/clubs"
                                className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold text-lg rounded-2xl px-6 py-2 transition"
                            >
                                Manage
                            </NavLink>
                        </div>
                    </div>

                    {/* Manage Shopping */}
                    <div className="bg-pink-200 rounded-2xl p-4 flex flex-col justify-between shadow-md">
                        <div className="flex items-center gap-2 mb-4">
                            <p className="font-semibold text-2xl font-serif">Manage Shopping</p>
                            <FaShoppingCart className="text-2xl" />
                        </div>
                        <div className="flex justify-end">
                            <NavLink
                                to="/market"
                                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold text-lg rounded-2xl px-6 py-2 transition"
                            >
                                Manage
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
