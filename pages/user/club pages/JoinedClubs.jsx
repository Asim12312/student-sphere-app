import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import SubHeader from './SubHeader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setJoinedMembers } from '../../../src/features/clubMembersSlice';

const JoinedClubs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?.userId;
  const [clubMembersCount, setClubMembersCount] = useState(0);// Members count of each club

  const [clubs, setClubs] = useState([]); // ✅ Always initialize as empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    axios
      .post('http://localhost:3000/handleMember/userJoinedClubs', { userId })
      .then(response => {
        const { success, joinedClubs } = response.data;

        if (success && Array.isArray(joinedClubs)) {
          axios
            .post('http://localhost:3000/club/getJoinedClubs', { clubIds: joinedClubs })
            .then(response => {
              setClubs(response.data.clubs || []);
              const clubs = response.data.clubs
              const res1 = axios.post("http://localhost:3000/handleMember/clubMembersCount", { clubs });
              // Convert array to object for quick lookup
              const membersMap = {};
              res1.data.membersCount.forEach(({ clubId, count }) => {
                membersMap[clubId] = count;
              });
              setClubMembersCount(membersMap);
              dispatch(setJoinedMembers(membersMap))
              setLoading(false);
            })



        } else {
          setClubs([]); // fallback if response is malformed
        }

        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching clubs:', error);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header message1="Joined Clubs" message2="Clubs you are a member of" />
      <div className="px-4">
        <SubHeader />
      </div>

      <div className="flex-1 px-4 md:px-10 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Clubs You've Joined</h1>

        {loading ? (
          <p className="text-gray-600 text-lg text-center">Loading your clubs...</p>
        ) : clubs.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-500 text-lg">You haven't joined any clubs yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, index) => (
              <div
                key={index}
                onClick={() => navigate(`/club/${club._id}`)}
                className="bg-white shadow-md rounded-xl overflow-hidden transition hover:shadow-lg"
              >
                <img
                  src={club.imageURL || '/placeholder-image.png'}
                  alt={club.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{club.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{club.description}</p>
                  <button

                    className={`mt-3 
                       
                       " bg-green-500 hover:bg-green-600"
                    } text-white px-4 py-2 rounded`}
                  >
                    View Club
                  </button>
                  <p>Total memebers: {club.members.length}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
};

export default JoinedClubs;
