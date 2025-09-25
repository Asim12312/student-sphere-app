import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ClubMembersPreview = ({ clubId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clubId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/handleMember/clubMembers/${clubId}`);
        
        if (response.data.success) {
          setMembers(response.data.members || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch members');
        }
      } catch (err) {
        console.error("Error fetching club members:", err);
        setError(err.response?.data?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 text-sm">No members yet</p>
        <p className="text-gray-400 text-xs mt-1">Be the first to join!</p>
      </div>
    );
  }

  const previewMembers = members.slice(0, 3);
  const remainingCount = Math.max(0, members.length - previewMembers.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {previewMembers.map((member) => (
          <div 
            key={member.id || member._id} 
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <img
                src={member.profileImage || "/male default avatar.png"}
                alt={member.fullName || member.username || 'Member'}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                onError={(e) => {
                  e.target.src = "/male default avatar.png";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {member.fullName || member.username || member.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {member.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            +{remainingCount} more {remainingCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      )}

      <div className="text-center pt-2">
        <span className="text-sm font-medium text-gray-700">
          Total: {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>
    </div>
  );
};

export default ClubMembersPreview;
