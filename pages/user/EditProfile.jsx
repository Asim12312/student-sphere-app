import { useState } from "react";
import Header from "../../components/Header";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header message1="Edit Profile" message2="Update your personal information" />
            <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">

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
        </div>
    );
};

export default EditProfile;
