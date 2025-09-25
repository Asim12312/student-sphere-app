import { useEffect, useState } from 'react';
import SideBar from '../../components/user/SideBar';
import { useNavigate } from 'react-router-dom';
import SubHeader from './club pages/SubHeader';
import PostReactions from '../../components/user/PostReactions';
import PostComments from '../../components/user/PostComments';
import axios from 'axios';

const Clubs = () => {
  const [posts, setPosts] = useState([]);
  const [clubCache, setClubCache] = useState({});
  const [hoveredClubId, setHoveredClubId] = useState(null);
  const [club, setClub] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?.userId;

  // Detect network speed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowNetwork = connection && (connection.downlink < 1 || connection.effectiveType.includes('4g'));

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/post/feedPosts', {
          params: { userId, page: 1, limit: 10, fetchLimit: 50 }
        });
        console.log('Fetched posts:', data.posts);
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      }
    };

    if (userId) fetchPosts();
  }, [userId]);

  const handleViewClub = async (clubId) => {
    try {
      setHoveredClubId(clubId);
      if (!clubCache[clubId]) {
        const res = await axios.get(`http://localhost:3000/club/specificClub/${clubId}`);
        setClubCache(prev => ({ ...prev, [clubId]: res.data }));
        setClub(res.data);
      } else {
        setClub(clubCache[clubId]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      await axios.post('http://localhost:3000/post/addComment', {
        postId,
        userId,
        text: commentText
      });
      
      // Refresh posts to show new comment
      const { data } = await axios.get('http://localhost:3000/post/feedPosts', {
        params: { userId, page: 1, limit: 10, fetchLimit: 50 }
      });
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <>
      <SideBar />
      <SubHeader />
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Author Info */}
                  <div className="flex items-start gap-3 mb-4 relative">
                    <img
                      src={post?.profilePic || '/male default avatar.png'}
                      alt={post?.username || 'User'}
                      onMouseEnter={() => handleViewClub(post.clubId)}
                      onMouseLeave={() => {
                        setHoveredClubId(null);
                        setClub(null);
                      }}
                      className="w-12 h-12 rounded-full object-cover cursor-pointer border border-gray-200 hover:ring-2 hover:ring-blue-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{post?.username || 'Unknown User'}</p>
                      <span className="text-sm text-gray-500">
                        {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                      </span>
                    </div>

                    {/* Club Tooltip */}
                    {hoveredClubId === post.clubId && club && (
                      <div className="absolute top-0 left-16 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64 z-20 animate-fadeIn">
                        <p className="text-xs text-gray-500 mb-1">Posted in</p>
                        <img
                          src={club.imageURL}
                          alt={club.name}
                          className="w-full h-28 object-cover rounded-md mb-2"
                        />
                        <p className="font-semibold text-gray-800">{club.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{club.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Post Description */}
                  {post.description && (
                    <p className="text-gray-700 mb-3 leading-relaxed">{post.description}</p>
                  )}

                  {/* Post Image */}
                  {post.imageURL && (
                    <img
                      src={isSlowNetwork ? post.thumbnailURL : post.imageURL}
                      alt="Post content"
                      loading="lazy"
                      className="w-full rounded-xl object-cover max-h-[450px] border border-gray-100"
                    />
                  )}
                  
                  {/* Post Reactions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <PostReactions
                      post={post}
                      userId={userId}
                      onReaction={async (postId, action, setReactions) => {
                        try {
                          const response = await axios.post('http://localhost:3000/post/likeUnlikePost', {
                            postId,
                            userId,
                            action
                          });
                          setReactions(prev => ({
                            ...prev,
                            likes: response.data.post.likes,
                            dislikes: response.data.post.dislikes,
                            userLiked: response.data.post.userLiked,
                            userDisliked: response.data.post.userDisliked
                          }));
                          
                          // Update the posts state to reflect the new reaction counts
                          setPosts(prevPosts => 
                            prevPosts.map(p => 
                              p._id === postId 
                                ? { ...p, ...response.data.post }
                                : p
                            )
                          );
                        } catch (error) {
                          if (error.response?.status === 429) {
                            // Handle cooldown error
                            console.log('Please wait before reacting again');
                          } else {
                            console.error('Error reacting to post:', error);
                          }
                        }
                      }}
                      onToggleComments={() => toggleComments(post._id)}
                      reactionLoading={false}
                    />
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post._id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <PostComments 
                        post={post} 
                        onAddComment={handleAddComment} 
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center mt-10">No posts available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Clubs;
