import React, { useState } from "react";
import Header from "../../components/Header";
import { NavLink } from "react-router-dom";
import { MdEventNote } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import { TbClubsFilled } from "react-icons/tb";
import { FaShoppingCart } from "react-icons/fa";
import { IoTrendingUpOutline, IoChatbubbles } from "react-icons/io5";

const UserDashboard = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header message1={`Welcome ${userData.username}`} message2="Get informed with each aspect of University" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Events */}
            <div className="bg-blue-200 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="flex items-end space-x-2">
                <p className="font-semibold text-2xl font-serif">Upcoming events</p>
                <MdEventNote className="text-2xl" />
              </div>
              <div className="flex justify-end">
                <NavLink to='/events' className="flex justify-center items-center h-10 w-24 bg-blue-500 text-white rounded-xl font-semibold shadow hover:bg-blue-600 transition">View all</NavLink>
              </div>
            </div>

            {/* Blogs */}
            <div className="bg-yellow-200 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="flex items-end space-x-2">
                <p className="font-semibold text-2xl font-serif">Student Voice</p>
                <FaNoteSticky className="text-2xl" />
              </div>
              <p className="text-sm opacity-70">Read stories and experiences</p>
              <div className="flex justify-end">
                <NavLink to='/blogs' className="flex justify-center items-center h-10 w-24 bg-yellow-500 text-white rounded-xl font-semibold shadow hover:bg-yellow-600 transition">Explore</NavLink>
              </div>
            </div>

            {/* Clubs */}
            <div className="bg-fuchsia-200 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="flex items-end space-x-2">
                <p className="font-semibold text-2xl font-serif">Joined clubs</p>
                <TbClubsFilled className="text-2xl" />
              </div>
              <div className="flex justify-end">
                <NavLink to='/clubs' className="flex justify-center items-center h-10 w-24 bg-fuchsia-500 text-white rounded-xl font-semibold shadow hover:bg-fuchsia-600 transition">View all</NavLink>
              </div>
            </div>

            {/* Trends */}
            <div className="bg-purple-200 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="flex items-end space-x-2">
                <p className="font-semibold text-2xl font-serif">Campus Trends</p>
                <IoTrendingUpOutline className="text-2xl" />
              </div>
              <p className="text-sm opacity-70">See what students are talking about</p>
              <div className="flex justify-end">
                <NavLink to='/trends' className="flex justify-center items-center h-10 w-24 bg-purple-500 text-white rounded-xl font-semibold shadow hover:bg-purple-600 transition">View</NavLink>
              </div>
            </div>

            {/* Forum */}
            <div className="bg-indigo-200 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="flex items-end space-x-2">
                <p className="font-semibold text-2xl font-serif">Academic Forum</p>
                <IoChatbubbles className="text-2xl" />
              </div>
              <p className="text-sm opacity-70">Ask questions, get answers</p>
              <div className="flex justify-end">
                <NavLink to='/forum' className="flex justify-center items-center h-10 w-24 bg-indigo-500 text-white rounded-xl font-semibold shadow hover:bg-indigo-600 transition">Discuss</NavLink>
              </div>
            </div>

            {/* Market */}
            <div className="bg-pink-200 rounded-2xl p-6 h-64 flex flex-col justify-between shadow-sm hover:shadow-md transition">
              <div className="flex items-end space-x-2">
                <p className="font-semibold text-2xl font-serif">Start shopping</p>
                <FaShoppingCart className="text-2xl" />
              </div>
              <div className="flex justify-end">
                <NavLink to='/market' className="flex justify-center items-center h-10 w-24 bg-pink-500 text-white rounded-xl font-semibold shadow hover:bg-pink-600 transition">Shop now</NavLink>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default UserDashboard;
