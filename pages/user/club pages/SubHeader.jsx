import React from 'react';
import { NavLink } from 'react-router-dom';

const SubHeader = () => {
  const baseClasses =
    'flex justify-center items-center h-full w-full text-base font-medium transition-all duration-300 ease-in-out rounded-xl';

  const hoverClasses = 'hover:bg-red-400 hover:text-white';
  const activeClasses = 'bg-white text-red-600 shadow font-semibold';

  return (
    <div className="w-full h-16 grid grid-cols-3 gap-2 bg-red-500 p-1 rounded-2xl">
      <NavLink
        to="/clubs"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : 'text-white'} ${!isActive && hoverClasses}`
        }
      >
        Club Posts
      </NavLink>

      <NavLink
        to="/discoverClubs"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : 'text-white'} ${!isActive && hoverClasses}`
        }
      >
        Discover
      </NavLink>

      <NavLink
        to="/joinedClubs"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : 'text-white'} ${!isActive && hoverClasses}`
        }
      >
        Joined
      </NavLink>
    </div>
  );
};

export default SubHeader;
