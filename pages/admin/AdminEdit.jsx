import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import AdminSideBar from "../../components/admin/AdminSidebar";

const AdminEdit = () => {
    const [userData, setUserData] = useState(() => {
        const dataStored = localStorage.getItem("adminData");
        return dataStored ? JSON.parse(dataStored) : {
            username: "",
            email: "",
            password: "",
            gender: "",
        };
    });

    const isMale = userData.gender === "male";

    const [submit, setSubmit] = useState(false);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
        setSubmit(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:3000/user/update', userData, {
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'id': userData.userId
                }
            });

            if (res.data) {
                localStorage.setItem("adminData", JSON.stringify(res.data));
                toast.success("✅ Profile updated successfully!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            toast.error("❌ Failed to update profile!");
        }
    };

    return (
        <>
            <AdminSideBar />

            <div className="pt-28 px-4 md:px-8 min-h-screen bg-gray-50">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-6"
                >
                    {/* Profile Image */}
                    <div className="flex justify-center">
                        <img
                            src={userData?.profilePic || (isMale ? "/male default avatar.png" : "/female default avatar.png")}
                            alt="profile pic"
                            className="w-32 h-32 rounded-full object-cover mt-2"
                        />
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-1">
                        <label className="text-lg font-semibold">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-lg font-semibold">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-lg font-semibold">New Password</label>
                        <input
                            type="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            className="p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1">
                        <label className="text-lg font-semibold">Gender</label>
                        <select
                            name="gender"
                            value={userData.gender}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!submit}
                            className={`${submit
                                ? "bg-red-700 hover:bg-red-800"
                                : "bg-red-300 cursor-not-allowed"
                                } text-white rounded-md font-bold text-lg px-6 py-2 transition`}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
};

export default AdminEdit;
