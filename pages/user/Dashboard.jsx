import React, { useState } from "react";
import SideBar from "../../components/user/SideBar";
import Header from "../../components/Header";
import { NavLink } from "react-router-dom";
import { MdEventNote } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import { TbClubsFilled } from "react-icons/tb";
import { FaShoppingCart } from "react-icons/fa";
import { GiHamburgerMenu } from 'react-icons/gi';

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));

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
        <div>
          <div className="grid grid-rows-[1fr_2fr_2fr] h-full w-full">
            <Header message1={`Welcome ${userData.username}`} message2="Get informed with each aspect of University" />
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-blue-200 rounded-2xl mr-4 ml-2 mb-2 grid grid-rows-[1fr_2fr_2fr_2fr_2fr]">
                <div className="flex items-end ml-3 space-x-2">
                  <p className="font-semibold text-2xl font-serif">Upcoming events</p>
                  <MdEventNote className="text-2xl" />
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div className="flex justify-end items-center">
                  <NavLink to='/events' className="flex justify-center items-center h-12 w-24 bg-blue-500 rounded-2xl mr-4 font-semibold text-lg cursor-pointer">View all</NavLink>
                </div>
              </div>
              <div className="bg-yellow-200 rounded-2xl ml-4 mr-2 mb-2 grid grid-rows-[1fr_2fr_2fr_2fr_2fr]">
                <div className="flex items-end ml-3 space-x-2">
                  <p className="font-semibold text-2xl font-serif">Recent notes</p>
                  <FaNoteSticky className="text-2xl" />
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div className="flex justify-end items-center">
                  <NavLink to='/notes' className="flex justify-center items-center h-12 w-24 bg-yellow-500 rounded-2xl mr-4 font-semibold text-lg cursor-pointer">View all</NavLink>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-fuchsia-200 rounded-2xl mb-6 ml-2 mr-2 grid grid-rows-[1fr_2fr_2fr_2fr_2fr]">
                <div className="flex items-end ml-3 space-x-2">
                  <p className="font-semibold text-2xl font-serif">Joined clubs</p>
                  <TbClubsFilled className="text-2xl" />
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div className="flex justify-end items-center">
                  <NavLink to='/clubs' className="flex justify-center items-center h-12 w-24 bg-fuchsia-500 rounded-2xl mr-4 font-semibold text-lg cursor-pointer">View all</NavLink>
                </div>
              </div>
              <div className="bg-pink-200 rounded-2xl mb-6 ml-2 mr-2 grid grid-rows-[1fr_2fr_2fr_2fr_2fr]">
                <div className="flex items-end ml-3 space-x-2">
                  <p className="font-semibold text-2xl font-serif">Start shopping</p>
                  <FaShoppingCart className="text-2xl" />
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div className="flex justify-end items-center">
                  <NavLink to='/market' className="flex justify-center items-center h-12 w-24 bg-pink-500 rounded-2xl mr-4 font-semibold text-lg cursor-pointer">Shop now</NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserDashboard;
