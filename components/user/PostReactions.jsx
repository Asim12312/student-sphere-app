// components/PostReactions.jsx
import React, { useState, useEffect } from "react";
import { FaHeart, FaThumbsDown, FaRegComment, FaShare } from "react-icons/fa";
import axios from "axios";

const API_ROOT = "http://localhost:3000/post";

const defaultPost = {
  likes: 0,
  dislikes: 0,
  userLiked: false,
  userDisliked: false,
  comments: []
};

export default function PostReactions({
  post,
  userId,
  reactionLoading,
  onReaction,
  onToggleComments
}) {
  // Handle undefined post
  if (!post) {
    console.error("PostReactions: post prop is undefined");
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-400">
            <FaHeart />
            <span>0</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-400">
            <FaThumbsDown />
            <span>0</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-400">
            <FaRegComment />
            <span>0 Comments</span>
          </button>
        </div>
        <button className="flex items-center space-x-1 text-gray-400">
          <FaShare /> <span>Share</span>
        </button>
      </div>
    );
  }

  const [reactions, setReactions] = useState({
    likes: post?.likes || defaultPost.likes,
    dislikes: post?.dislikes || defaultPost.dislikes,
    userLiked: !!post?.userLiked || defaultPost.userLiked,
    userDisliked: !!post?.userDisliked || defaultPost.userDisliked
  });

  // Sync reactions with parent updates
  useEffect(() => {
    if (!post) return;
    
    setReactions(prev => ({
      ...prev,
      likes: post.likes ?? prev.likes,
      dislikes: post.dislikes ?? prev.dislikes,
      userLiked: post.userLiked ?? prev.userLiked,
      userDisliked: post.userDisliked ?? prev.userDisliked
    }));
  }, [post?.likes, post?.dislikes, post?.userLiked, post?.userDisliked]);

  // Optionally fetch fresh state from server
  useEffect(() => {
    let ignore = false;
    if (!userId || !post?._id) return;
    
    axios.post(`${API_ROOT}/getPostReactions`, { postIds: [post._id], userId })
      .then(res => {
        const r = res.data?.reactions?.[0];
        if (!ignore && r) {
          setReactions(prev => ({
            ...prev,
            likes: r.likes ?? prev.likes,
            dislikes: r.dislikes ?? prev.dislikes,
            userLiked: !!r.userLiked,
            userDisliked: !!r.userDisliked
          }));
        }
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, [post?._id, userId]);

  const handleReactionClick = (action) => {
    if (!post?._id || reactionLoading) return;
    onReaction(post._id, action, setReactions);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Like */}
        <button
          onClick={() => handleReactionClick("like")}
          disabled={reactionLoading}
          className={`flex items-center space-x-1 transition-colors ${
            reactions.userLiked ? "text-red-500" : "hover:text-red-500"
          } ${reactionLoading ? "opacity-60 cursor-wait" : ""}`}
        >
          <FaHeart />
          <span>{reactions.likes}</span>
        </button>

        {/* Dislike */}
        <button
          onClick={() => handleReactionClick("dislike")}
          disabled={reactionLoading}
          className={`flex items-center space-x-1 transition-colors ${
            reactions.userDisliked ? "text-blue-500" : "hover:text-blue-500"
          } ${reactionLoading ? "opacity-60 cursor-wait" : ""}`}
        >
          <FaThumbsDown />
          <span>{reactions.dislikes}</span>
        </button>

        {/* Comments Toggle */}
        <button
          onClick={onToggleComments}
          className="flex items-center space-x-1 hover:text-purple-500"
        >
          <FaRegComment />
          <span>{(post?.comments || []).length} Comments</span>
        </button>
      </div>

      {/* Share */}
      <button className="flex items-center space-x-1 hover:text-green-500">
        <FaShare /> <span>Share</span>
      </button>
    </div>
  );
}
