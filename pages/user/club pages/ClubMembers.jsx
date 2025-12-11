import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import SubHeader from './SubHeader';
import axios from 'axios';
import { toast } from 'react-toastify';

const ClubMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchClubMembers();
  }, [id]);

  const fetchClubMembers = async () => {
    try {
      const [clubResponse, membersResponse] = await Promise.all([
        axios.get(`http://localhost:3000/club/specificClub/${id}`),
        axios.get(`http://localhost:3000/handleMember/clubMembers/${id}`)
      ]);

      setClub(clubResponse.data);
      setMembers(membersResponse.data.members);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load club members.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      (member.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;

    return matchesSearch && matchesRole;
  });


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header message1="Club Members" message2="View all members of this club" />
      <div className="px-4">
        <SubHeader />
      </div>

      <div className="flex-1 px-4 py-10 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <button
              onClick={() => navigate(`/club/${id}`)}
              className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md shadow"
            >
              ← Back to Club
            </button>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {club?.name || 'Club'} Members
            </h1>
            <p className="text-gray-600">
              Total Members: {filteredMembers.length}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Members
                </label>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Members Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchTerm || filterRole !== 'all'
                      ? 'No members found matching your criteria'
                      : 'No members in this club yet'}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      <img
                        src={member.profileImage}
                        alt={member.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/male default avatar.png';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {member.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">@{member.username}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {member.role === 'admin' ? '👑 Admin' : '👤 Member'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default ClubMembers;
