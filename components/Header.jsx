import { IoIosNotifications } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { io as socketIOClient } from 'socket.io-client';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationDropdown from "./NotificationDropdown";
import axios from "axios";
import { CiEdit, CiLogout } from "react-icons/ci";
import { FaShoppingCart, FaHome } from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import { ImClubs } from "react-icons/im";
import { IoNotificationsOutline, IoSearchOutline, IoNewspaperOutline, IoTrendingUpOutline, IoChatbubblesOutline, IoChatbubbles } from 'react-icons/io5';
import { MdEmojiEvents } from "react-icons/md";

const Header = (props) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [incomingNotification, setIncomingNotification] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [reputationPoints, setReputationPoints] = useState(0);
  const profileDropdownRef = useRef(null);
  // Socket ref to keep socket instance across renders
  const headerSocketRef = useRef(null);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userData")) ?? { username: "User" };
  const isMale = userData?.gender === 'male';
  const avatarSrc = userData?.profilePic ?? (isMale ? "/male default avatar.png" : "/female default avatar.png");

  useEffect(() => {
    const id = localStorage.getItem('id');
    console.log('🔑 [Header] User ID from localStorage:', id);

    if (id) {
      setUserId(id);
      fetchUnreadCount(id);

      // Fetch User Stats
      axios.get(`http://localhost:3000/user/profile/${id}`).then(res => {
        if (res.data.success) {
          setReputationPoints(res.data.user.reputationPoints || 0);
        }
      }).catch(err => console.error(err));

      // Poll for new notifications every 30 seconds
      const pollInterval = setInterval(() => {
        console.log('🔄 [Header] Polling for new notifications...');
        fetchUnreadCount(id);
      }, 30000);

      // Setup Socket.IO client for real-time notifications
      try {
        const socket = socketIOClient('http://localhost:3000', { query: { userId: id } });
        socket.on('connect', () => console.log('🔌 [Socket] Connected', socket.id));
        socket.on('notification', (notif) => {
          console.log('🔔 [Socket] Notification received in Header:', notif);
          // Save incoming notification so dropdown can display it immediately
          setIncomingNotification(notif);
          // Refresh unread count
          fetchUnreadCount(id);
        });

        // attach socket instance so we can disconnect on cleanup
        // store it on ref to avoid re-creating
        headerSocketRef.current = socket;
      } catch (socketError) {
        console.error('❌ [Socket] Failed to connect', socketError);
      }

      const handleClickOutside = (event) => {
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
          setProfileDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        clearInterval(pollInterval);
        document.removeEventListener("mousedown", handleClickOutside);
        // disconnect socket if exists
        if (headerSocketRef.current) {
          try { headerSocketRef.current.disconnect(); } catch (e) { }
        }
      };
    }
  }, []);


  const fetchUnreadCount = async (id) => {
    try {
      console.log('📊 [Header] Fetching unread count for user:', id);
      const response = await axios.get(`http://localhost:3000/notifications/get/${id}`);
      if (response.data.success) {
        const unread = response.data.notifications.filter(n => !n.read).length;
        console.log('📬 [Header] Unread notifications:', unread);
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("❌ [Header] Error fetching notification count", error);
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && userId) {
      console.log('🔔 [Header] Opening notifications, refreshing count...');
      fetchUnreadCount(userId); // Refresh when opening
    }
    // Refresh count when closing to update badge
    if (showNotifications && userId) {
      console.log('🔔 [Header] Closing notifications, refreshing count...');
      setTimeout(() => fetchUnreadCount(userId), 500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("id");
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium ${isActive ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:text-red-500 hover:bg-gray-50'
    }`;

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo / Title Area */}
          <div className="flex-shrink-0 flex items-center">
            {/* You can add a logo here if available */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif font-bold text-gray-800">{props.message1 || "University Portal"}</h1>
              {props.message2 && <p className="text-sm text-gray-500 italic hidden md:block">{props.message2}</p>}
            </div>
          </div>

          {/* Navigation Links (Hidden on small screens, can implement mobile menu later) */}
          <nav className="hidden md:flex space-x-2">
            <NavLink to="/dashboard" className={navLinkClasses}>
              <FaHome className="text-xl" /> <span>Home</span>
            </NavLink>
            <NavLink to="/blogs" className={navLinkClasses}>
              <FaNoteSticky className="text-xl" /> <span>Blogs</span>
            </NavLink>
            <NavLink to="/trends" className={navLinkClasses}>
              <IoTrendingUpOutline className="text-xl" /> <span>Trends</span>
            </NavLink>
            <NavLink to="/forum" className={navLinkClasses}>
              <IoChatbubbles className="text-xl" /> <span>Forum</span>
            </NavLink>
            <NavLink to="/market" className={navLinkClasses}>
              <FaShoppingCart className="text-xl" /> <span>Market</span>
            </NavLink>
            <NavLink to="/clubs" className={navLinkClasses}>
              <ImClubs className="text-xl" /> <span>Clubs</span>
            </NavLink>
            <NavLink to="/events" className={navLinkClasses}>
              <MdEmojiEvents className="text-xl" /> <span>Events</span>
            </NavLink>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            <button className="text-2xl text-gray-600 hover:text-gray-900"><IoSearch /></button>

            {/* Notifications */}
            <div className="relative">
              <button className="text-3xl relative text-gray-600 hover:text-gray-900 pt-2" onClick={toggleNotifications}>
                <IoIosNotifications />
                {unreadCount > 0 && (
                  <span className="absolute top-0 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown userId={userId} isOpen={showNotifications} onClose={() => setShowNotifications(false)} incomingNotification={incomingNotification} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-full transition border border-transparent hover:border-gray-200"
              >
                <img
                  src={avatarSrc}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div className="flex flex-col items-start">
                  <span className="hidden lg:block text-gray-700 font-medium text-sm truncate max-w-[100px]">{userData.username}</span>
                  <span className="hidden lg:block text-xs text-yellow-600 font-bold">⭐ {reputationPoints} pts</span>
                </div>
              </div>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{userData.username}</p>
                    <p className="text-xs text-gray-500">{userData.userEmail}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">
                        ⭐ {reputationPoints} Points
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate(`/profile/${userData.username}`);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <CiEdit size={20} />
                    <span className="text-sm">My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/editprofile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  >
                    <CiEdit size={20} />
                    <span className="text-sm">Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600 border-t border-gray-100"
                  >
                    <CiLogout size={20} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Header
