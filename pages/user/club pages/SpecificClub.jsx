import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import SubHeader from './SubHeader';
import ClubMembersPreview from './ClubMembersPreview';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAllClubMembers } from '../../../src/features/clubSelectors';
import UserClubPosts from '../../../components/user/UserClubPosts';
import CreatePostForm from '../../../components/user/CreatePostForm';
import ClubChat from '../../../components/user/ClubChat';

const SpecificClub = () => {
  const allClubMembers = useSelector(selectAllClubMembers);
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editClub, setEditClub] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubImage, setClubImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  useEffect(() => {
    const fetchClubAndMembership = async () => {
      try {
        const clubResponse = await axios.get(`http://localhost:3000/club/specificClub/${id}`);
        const clubData = clubResponse.data;
        setClub(clubData);
        setClubName(clubData.name);
        setClubDescription(clubData.description);
        setIsAdmin(clubData.createdBy === userId);

        const membershipResponse = await axios.get(`http://localhost:3000/handleMember/checkMembership/${userId}/${id}`);
        setIsJoined(membershipResponse.data.isMember);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load club details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClubAndMembership();
  }, [id, userId]);

  const handleEdit = async () => {
    if (!clubName || !clubDescription) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', clubName);
      formData.append('description', clubDescription);
      if (clubImage) {
        formData.append('image', clubImage);
      }

      const response = await axios.post(`http://localhost:3000/club/editClub/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setClub(response.data);
      setEditClub(false);
      toast.success("Club details updated successfully!");
    } catch (error) {
      console.error("Error updating club:", error);
      toast.error("Failed to update club details.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;

    try {
      await axios.delete(`http://localhost:3000/club/deleteClub/${id}`);
      toast.success("Club deleted successfully.");
      navigate('/discoverClubs');
    } catch (error) {
      console.error("Error deleting club:", error);
      toast.error("Failed to delete the club.");
    }
  };

  const handleJoinLeaveClub = async () => {
    if (joinLoading) return;
    setJoinLoading(true);

    try {
      if (isJoined) {
        await axios.post('http://localhost:3000/handleMember/leaveClub', {
          userId,
          clubId: id,
        });
        setIsJoined(false);
        toast.success("Left the club successfully!");
      } else {
        const res = await axios.post('http://localhost:3000/handleMember/joinClub', {
          userId,
          clubId: id,
        });

        if (res.data.message === 'Join request sent successfully') {
          toast.success("Join request sent!");
          // Update club state to show request sent
          setClub(prev => ({
            ...prev,
            joinRequests: [...(prev.joinRequests || []), { user: userId, status: 'pending' }]
          }));
        } else {
          setIsJoined(true);
          toast.success("Joined the club successfully!");
        }
      }
    } catch (error) {
      console.error("Error joining/leaving club:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header message1="Club Details" message2="View and manage club details" />
      <div className="px-4">
        <SubHeader />
      </div>

      <div className="flex-1 px-4 py-10 md:px-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
          {loading ? (
            <p className="text-center text-gray-600 text-lg">Loading club details...</p>
          ) : club ? (
            <>
              {editClub && isAdmin ? (
                <>
                  <div className="mb-6 relative">
                    <label className="block text-gray-700 font-semibold mb-2">Club Name</label>
                    <input
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    />

                    <label className="block text-gray-700 font-semibold mb-2">Club Image</label>
                    <div className="relative group w-full max-h-96 overflow-hidden rounded-lg shadow">
                      <img
                        src={club.imageURL || "/placeholder-image.png"}
                        alt="Club"
                        className="w-full object-cover"
                      />
                      <label
                        htmlFor="image-upload"
                        className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                      >
                        <span className="text-white text-lg font-semibold">📷 Change Image</span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        onChange={(e) => setClubImage(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Club Description</label>
                    <textarea
                      value={clubDescription}
                      onChange={(e) => setClubDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows={5}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <button
                      onClick={handleEdit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      💾 Save
                    </button>

                    <button
                      onClick={() => setEditClub(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{club.name}</h1>
                    <img
                      src={club.imageURL || "/placeholder-image.png"}
                      alt={club.name}
                      className="w-full max-h-96 object-cover rounded-lg shadow"
                    />
                  </div>

                  <p className="text-gray-700 text-lg mb-4">
                    <span className="font-semibold">Description:</span> {club.description}
                  </p>



                  <div className="flex flex-wrap gap-4 mb-6">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setEditClub(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
                        >
                          ✏️ Edit Club
                        </button>
                        <button
                          onClick={() => navigate(`/createEvent/${id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
                        >
                          Create Event
                        </button>
                        <button
                          onClick={() => navigate(`/events/${id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
                        >
                          View Events
                        </button>
                        <button
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
                        >
                          🗑️ Delete Club
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => navigate(`/club/${id}/members`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      👥 View All Members
                    </button>

                    {!isAdmin && (
                      <div>
                        <button
                          onClick={handleJoinLeaveClub}
                          disabled={joinLoading || (!isJoined && club.joinRequests && club.joinRequests.some(r => r.user === userId && r.status === 'pending'))}
                          className={`${isJoined
                            ? "bg-red-500 hover:bg-red-600"
                            : club.joinRequests && club.joinRequests.some(r => r.user === userId && r.status === 'pending')
                              ? "bg-yellow-500 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                            } text-white px-4 py-2 rounded-md shadow disabled:opacity-50`}
                        >
                          {joinLoading
                            ? "..."
                            : isJoined
                              ? "Leave"
                              : club.joinRequests && club.joinRequests.some(r => r.user === userId && r.status === 'pending')
                                ? "Request Sent"
                                : club.privacy === 'private' ? "Request to Join" : "Join"}
                        </button>
                        <button
                          onClick={() => navigate(`/createEvent/${id}`)}
                          disabled={!isJoined}
                          className={`ml-5 mr-5 px-4 py-2 rounded-md shadow text-white ${!isJoined ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                          Create event
                        </button>
                        <button
                          onClick={() => navigate(`/events/${id}`)}
                          disabled={!isJoined}
                          className={`px-4 py-2 rounded-md shadow text-white ${!isJoined ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                          View events
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Members Display Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Club Members</h3>
                    <ClubMembersPreview clubId={id} />
                  </div>
                </>
              )}

              {/* Suggested Features */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Suggested Features</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>📢 Club Announcements</li>
                  <li>📅 Upcoming Events</li>
                  <li>📂 Club Resources & Files</li>
                  <li>📝 Member Applications or Requests</li>
                  <li>🔗 Share Club Invite Link</li>
                </ul>
              </div>
            </>
          ) : (
            <p className="text-center text-red-600 text-lg">Club not found.</p>
          )}
        </div>

        {/* Tabs for Joined Members */}
        {(isJoined || isAdmin) && (
          <div className="mt-8 mb-6 border-b border-gray-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-2 text-lg font-semibold transition-colors relative ${activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                📝 Club Feed
                {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-4 px-2 text-lg font-semibold transition-colors relative ${activeTab === 'chat' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                💬 Chat Room
                {activeTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
              </button>
            </div>
          </div>
        )}

        {/* Content based on Tab */}
        {activeTab === 'posts' ? (
          <>
            {/* Create Post Section - Only visible if member or admin */}
            {(isJoined || isAdmin) && (
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Create New Post</h3>
                <CreatePostForm clubId={id} />
              </div>
            )}
            <UserClubPosts clubId={id} />
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            {(isJoined || isAdmin) ? (
              <ClubChat
                clubId={id}
                userId={userId}
                username={userData?.username}
                userProfilePic={userData?.profilePic}
              />
            ) : (
              <div className="text-center py-10 bg-gray-100 rounded-xl">
                <p className="text-gray-500">Join the club to access the chat room.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>

  );
};

export default SpecificClub;
