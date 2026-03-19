import { NavLink, useNavigate } from 'react-router-dom';
import { CiEdit, CiLogout } from "react-icons/ci";
import { CgNotes } from "react-icons/cg";
import { FaShoppingCart } from "react-icons/fa";
import { ImClubs } from "react-icons/im";
import { MdEventNote } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import React from 'react';

const AdminSideBar = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem("adminData")) ?? { username: "Admin" };
    const isMale = userData.gender === 'male';
    const avatarSrc = userData?.profilePic ?? (isMale ? "/male default avatar.png" : "/female default avatar.png");

    const handleLogout = () => {
        localStorage.removeItem("adminData");
        navigate('/');
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full bg-black z-40">
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-3 px-4 md:px-6">
                    {/* Left: Avatar + Username */}
                    <div className="flex items-center gap-3">
                        <img
                            src={avatarSrc}
                            alt="admin profile"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <span className="text-white text-xl font-semibold">
                            {userData.username}
                        </span>
                    </div>

                    {/* Center: Navigation */}
                    <nav className="flex flex-wrap gap-4 md:gap-6 justify-center text-white">
                        <NavLink
                            to="/AdminDashboard"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Dashboard
                                <FaHome className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/manageUsers"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Users
                                <ImClubs className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/manageEvents"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Events
                                <ImClubs className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/manageClubs"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Clubs
                                <ImClubs className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/manageMarket"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Market
                                <FaShoppingCart className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/manageNotes"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Notes
                                <CgNotes className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/manageContent"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Content
                                <CgNotes className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/AdminEdit"
                            className={({ isActive }) =>
                                `${isActive ? 'italic text-base md:text-lg' : 'hover:text-base md:hover:text-lg text-sm md:text-base'}`
                            }
                        >
                            <span className="flex items-center gap-1">
                                Profile
                                <CiEdit className="text-xl hidden lg:block" />
                            </span>
                        </NavLink>
                    </nav>

                    {/* Right: Logout */}
                    <button
                        onClick={handleLogout}
                        className="text-white flex items-center gap-1"
                    >
                        Logout
                        <CiLogout className="text-2xl" />
                    </button>
                </div>
            </header>

            {/* Spacer below header */}
            <div className="h-20 md:h-24" />
        </>
    );
};

export default AdminSideBar;
