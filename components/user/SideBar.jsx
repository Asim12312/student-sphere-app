import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { CiEdit, CiLogout } from "react-icons/ci";
import { CgNotes } from "react-icons/cg";
import { FaShoppingCart, FaHome } from "react-icons/fa";
import { ImClubs } from "react-icons/im";
import { MdEmojiEvents } from "react-icons/md";

const SideBar = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userData = JSON.parse(localStorage.getItem("userData")) ?? { username: "User" };
    const isMale = userData?.gender === 'male';
    const avatarSrc = userData?.profilePic ?? (isMale ? "/male default avatar.png" : "/female default avatar.png");

    const handleLogout = () => {
        localStorage.removeItem("userData");
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            {/* Header */}
            <header className="fixed top-0 left-0 w-full bg-gray-50 z-40 shadow-md">
                <div className="max-w-screen-xl grid grid-cols-6 h-16">

                    {/* Home */}
                    <div className='flex justify-center items-center h-full border-r-2 border-blue-500 '>
                        <NavLink to="/dashboard" className={({ isActive }) => `${isActive ? 'h-full w-full italic text-lg border-b-2 border-red-500' : 'h-full w-full'}`}>
                            <span className="flex justify-center items-center gap-1 h-full w-full">
                                Home <FaHome className="text-xl" />
                            </span>
                        </NavLink>
                    </div>

                    {/* Notes */}
                    <div className='flex justify-center items-center h-full border-r-2 border-blue-500'>
                        <NavLink to="/notes" className={({ isActive }) => `${isActive ? 'h-full w-full italic text-lg border-b-2 border-red-500' : 'h-full w-full'}`}>
                            <span className="flex justify-center items-center gap-1 h-full w-full">
                                Notes <CgNotes className="text-xl" />
                            </span>
                        </NavLink>

                    </div>

                    {/* Market */}
                    <div className='flex justify-center items-center h-full border-r-2 border-blue-500'>
                        <NavLink to="/market" className={({ isActive }) => `${isActive ? 'h-full w-full italic text-lg border-b-2 border-red-500' : 'h-full w-full'}`}>
                            <span className="flex justify-center items-center gap-1 h-full w-full">
                                Market <FaShoppingCart className="text-xl" />
                            </span>
                        </NavLink>

                    </div>

                    {/* Clubs */}
                    <div className='flex justify-center items-center h-full border-r-2 border-blue-500'>
                        <NavLink to="/clubs" className={({ isActive }) => `${isActive ? 'h-full w-full italic text-lg border-b-2 border-red-500' : 'h-full w-full'}`}>
                            <span className="flex justify-center items-center gap-1 h-full w-full">
                                Clubs <ImClubs className="text-xl" />
                            </span>
                        </NavLink>

                    </div>

                    {/* Events */}
                    <div className='flex justify-center items-center h-full border-r-2 border-blue-500'>
                        <NavLink to="/events" className={({ isActive }) => `${isActive ? 'h-full w-full italic text-lg border-b-2 border-red-500' : 'h-full w-full'}`}>
                            <span className="flex justify-center items-center gap-1 h-full w-full">
                                Events <MdEmojiEvents className="text-xl" />
                            </span>
                        </NavLink>

                    </div>

                    {/* Profile (no right border) */}
                    <div className="relative flex justify-center items-center h-full" ref={dropdownRef}>
                        <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition"
                        >
                            <img
                                src={avatarSrc}
                                alt="profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="text-gray-800 font-medium text-sm truncate">{userData.username}</span>
                        </div>

                        {dropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-white shadow-md border rounded w-44 z-50">
                                <NavLink
                                    to="/edit"
                                    className="flex items-center px-4 py-2 hover:bg-blue-100 text-sm gap-2"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <CiEdit className="text-xl" /> Edit Profile
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 hover:bg-red-100 text-sm text-red-600 gap-2"
                                >
                                    <CiLogout className="text-xl" /> Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            <div className="h-20 md:h-24" />

        </>
    );
};

export default SideBar;
