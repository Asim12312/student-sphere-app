import { useState } from "react";
import SideBar from "../../components/user/SideBar";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { GiHamburgerMenu } from 'react-icons/gi';

const EditProfile = () => {
    const [userData, setUserData] = useState(() => {
        const dataStored = localStorage.getItem("userData");
        return dataStored ? JSON.parse(dataStored) : {
            username: "",
            email: "",
            password: "",
            gender: "",
        };
    });

    var checkGender;
    if (userData.gender == 'male') {
        checkGender = true
    }
    else {
        checkGender = false
    }

    const [submit, setSubmit] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
                localStorage.setItem("userData", JSON.stringify(res.data));
                toast.success("\u2705 Profile updated successfully!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            toast.error("\u274c Failed to update profile!");
        }
    };

    return (
        <>
            {/* Hamburger icon always visible when sidebar is closed */}
            {!sidebarOpen && (
                <button
                    className="fixed top-4 left-4 z-50 text-3xl bg-white rounded-full p-2 shadow"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    <GiHamburgerMenu />
                </button>
            )}
            <div className={`h-screen w-screen ${sidebarOpen ? "md:grid md:grid-cols-[1fr_5fr]" : ""}`}>
                {sidebarOpen && (
                    <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                )}
                <form onSubmit={handleSubmit} className="grid grid-rows-[1fr_2fr_3fr_3fr] p-4 overflow-y-auto">
                    
                    <div className="flex justify-end items-center mr-12 mt-5">
                        <button
                            type="submit"
                            disabled={!submit}
                            className={`${submit
                                    ? "bg-red-700 cursor-pointer"
                                    : "bg-red-300 cursor-not-allowed"
                                } text-white rounded-lg font-bold text-lg h-12 w-24`}
                        >
                            Save
                        </button>
                    </div>
                    <div className="flex justify-center items-center">
                        <img
                            src={userData?.profilePic || checkGender ? "/male default avatar.png" : "/female default avatar.png"}
                            alt='profile pic'
                            className="w-38 h-38 rounded-full mt-10"
                        />
                    </div>
                    <div className=" flex justify-center items-center flex-col gap-6 mt-10 mb-12">
                        <div className="flex items-center gap-4">
                            <label className="text-xl w-40 font-semibold">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={userData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                className="p-2 border border-gray-300 rounded-lg w-full max-w-xs"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-xl w-40 font-semibold">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="p-2 border border-gray-300 rounded-lg w-full max-w-xs"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-xl w-40 font-semibold">New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={userData.password}
                                onChange={handleChange}
                                placeholder="Enter new Password"
                                className="p-2 border border-gray-300 rounded-lg w-full max-w-xs"
                            />
                        </div>

                        <div className="flex items-center gap-4 mr-15">
                            <label className="text-xl w-40 font-semibold">Gender</label>
                            <select
                                name="gender"
                                value={userData.gender}
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded-lg w-full max-w-xs"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                      
                    </div>
                    
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
};

export default EditProfile;
