import React, { useState } from 'react'
import SideBar from '../../../components/user/SideBar'
import { GiHamburgerMenu } from 'react-icons/gi'
import axios from 'axios'

const Events = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const userData = JSON.parse(localStorage.getItem("userData"));
  const clubsJoined = userData?.joinedClubs;
  useEffect(() => {

  }, [])
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
        <div className="overflow-y-auto p-4">
          events
        </div>
      </div>
    </>
  )
}

export default Events
