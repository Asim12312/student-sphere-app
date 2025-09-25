import React, { useEffect, useState } from 'react';
import SideBar from '../../../components/user/SideBar';
import SubHeader from './SubHeader';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {setAllClubMembers, setCreatedClubMembersCount } from '../../../src/features/clubMembersSlice';

const Discover = () => {
  const dispatch = useDispatch();
  const [clubsCreated, setClubsCreated] = useState([]);
  const [searchClubs, setSearchClubs] = useState("");
  const [allClubs, setAllClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setTotalPages] = useState(1);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [createdClubMembers, setCreatedClubMembers] = useState({});
  const [allClubsCount, setAllClubsCount] = useState(0) // Members count of a  clubs


  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?.userId;

  const fetchCreatedClubs = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/club/getClubs/${userId}`);
      const clubs = res.data.clubs;
      setClubsCreated(clubs);

      const res1 = await axios.post("http://localhost:3000/handleMember/clubMembersCount", { clubs });
      // Convert array to object for quick lookup
      const membersMap = {};
      res1.data.membersCount.forEach(({ clubId, count }) => {
        membersMap[clubId] = count;
      });
      setCreatedClubMembers(membersMap);
      dispatch(setCreatedClubMembersCount(membersMap));
    } catch (err) {
      console.error("Error fetching your clubs:", err);
    }
  };

  const fetchAllClubs = async () => {
    try {
      const res = await axios.post('http://localhost:3000/club/getAllClubs', {
        userId,
        page,
        limit: 6,
      });
      setAllClubs(res.data.clubs);
      setFilteredClubs(res.data.clubs);
      setTotalPages(res.data.totalPages);
      const clubs = res.data.clubs;
       const res1 = await axios.post("http://localhost:3000/handleMember/clubMembersCount", { clubs });
      // Convert array to object for quick lookup
      const membersMap = {};
      res1.data.membersCount.forEach(({ clubId, count }) => {
        membersMap[clubId] = count;
      });
      setAllClubsCount(membersMap);
      dispatch(setAllClubMembers(membersMap));

      const joinedIds = res.data.clubs
        .filter(club => club.members?.includes(userId))
        .map(club => club._id);
      setJoinedClubs(joinedIds);
    } catch (err) {
      console.error("Error fetching all clubs:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchCreatedClubs();
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAllClubs();
  }, [page, userId]);

  useEffect(() => {
    if (!searchClubs) {
      setFilteredClubs(allClubs);
    } else {
      const filtered = allClubs.filter((club) =>
        club.name.toLowerCase().includes(searchClubs.toLowerCase())
      );
      setFilteredClubs(filtered);
    }
  }, [searchClubs, allClubs]);

  const handleJoinClub = async (e, clubId) => {
    e.stopPropagation(); // prevent parent div click
    const isAlreadyJoined = joinedClubs.includes(clubId);

    try {
      if (isAlreadyJoined) {
        await axios.post('http://localhost:3000/handleMember/leaveClub', {
          userId,
          clubId,
        });
        setJoinedClubs((prev) => prev.filter(id => id !== clubId));
        toast.success("Left the club successfully!");
      } else {
        await axios.post('http://localhost:3000/handleMember/joinClub', {
          userId,
          clubId,
        });
        setJoinedClubs((prev) => [...prev, clubId]);
        toast.success("Joined the club successfully!");
      }
    } catch (err) {
      console.error("Error joining/unjoining club:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <>
      <SideBar />
      <SubHeader />

      <div className="min-h-screen bg-gray-100 px-4 py-10 md:px-10">
        {/* Your Clubs */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Clubs</h1>
          <button
            onClick={() => navigate('/createClub')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
          >
            + Create Club
          </button>
        </div>

        {clubsCreated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {clubsCreated.map((club) => (
              <div
                key={club._id}
                onClick={() => navigate(`/club/${club._id}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg p-4 cursor-pointer"
              >
                <img
                  src={club.imageURL || '/placeholder-image.png'}
                  alt={club.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{club.name}</h3>
                <p className="text-gray-600 text-sm">{club.description}</p>
                <p>Total members: {createdClubMembers[club._id] || 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-10 mb-12">
            <p className="text-gray-600 text-lg">You haven't created any clubs yet.</p>
            <button
              onClick={() => navigate('/createClub')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Create your first club
            </button>
          </div>
        )}

        {/* Discover Clubs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Discover Clubs</h2>
          <input
            type="text"
            value={searchClubs}
            onChange={(e) => setSearchClubs(e.target.value)}
            placeholder="Search clubs here..."
            className="w-full sm:w-96 p-3 border border-gray-300 rounded-md shadow-sm mb-6"
          />
        </div>

        {filteredClubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div
                  key={club._id}
                  onClick={() => navigate(`/club/${club._id}`)}
                  className="bg-white rounded-xl shadow hover:shadow-lg p-4 cursor-pointer"
                >
                  <img
                    src={club.imageURL || '/placeholder-image.png'}
                    alt={club.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{club.name}</h3>
                  <p className="text-gray-600 text-sm">{club.description}</p>
                  <button
                    onClick={(e) => handleJoinClub(e, club._id)}
                    className={`mt-3 ${joinedClubs.includes(club._id) ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white px-4 py-2 rounded`}
                  >
                    {joinedClubs.includes(club._id) ? "Leave Club" : "Join Club"}
                  </button>
                  <p>Total members: {allClubsCount[club._id] || 0} </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-gray-700">Page {page} of {pages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                disabled={page === pages}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center mt-6">No clubs found.</p>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={1500} />
    </>
  );
};

export default Discover;
