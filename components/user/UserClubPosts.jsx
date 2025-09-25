import React, { useState, useEffect } from "react";
import PostReactions from "./PostReactions";
import PostComments from "./PostComments";
import axios from "axios";

export default function UserClubPosts({ clubId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?.userId;

  useEffect(() => {
    const fetchClubPosts = async () => {
      if (!clubId || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.post(`http://localhost:3000/post/getPosts`, {
          clubId: clubId
        });
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error('Error fetching club posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubPosts();
  }, [clubId, userId]);

  const handleReaction = async (postId, action) => {
    try {
      await axios.post('http://localhost:3000/post/likeUnlikePost', {
        postId,
        userId,
        action
      });
      
      // Refresh posts to show updated reactions
      const response = await axios.post(`http://localhost:3000/post/getPosts`, {
        clubId: clubId
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleAddComment = async (postId, comment) => {
    try {
      await axios.post('http://localhost:3000/post/addComment', {
        postId,
        userId,
        text: comment
      });
      
      // Refresh posts to show new comment
      const response = await axios.post(`http://localhost:3000/post/getPosts`, {
        clubId: clubId
      });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg mb-2">No posts in this club yet</p>
        <p className="text-sm">Be the first to create a post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post._id} className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          {/* Author Info */}
          <div className="p-4 flex items-center gap-3">
            <img
              src={post?.profilePic || '/male default avatar.png'}
              alt={post?.username || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-800">{post?.username || 'Unknown User'}</p>
              <span className="text-sm text-gray-500">
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
              </span>
            </div>
          </div>

          {/* Post Description */}
          {post.description && (
            <div className="px-4 pb-2">
              <p className="text-gray-700">{post.description}</p>
            </div>
          )}

          {/* Post Image */}
          {post.imageURL && (
            <div className="px-4 pb-4">
              <img
                src={post.imageURL}
                alt="Post content"
                className="w-full rounded-xl object-cover max-h-[400px]"
              />
            </div>
          )}

          <div className="p-4 border-t border-gray-100">
            <PostReactions
              post={post}
              userId={userId}
              onReaction={handleReaction}
              onToggleComments={() => {}}
              reactionLoading={false}
            />
          </div>
          
          {/* Comments Section */}
          <div className="p-4 border-t border-gray-100">
            <PostComments 
              post={post} 
              onAddComment={handleAddComment} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
