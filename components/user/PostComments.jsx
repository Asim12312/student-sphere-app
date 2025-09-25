// components/PostComments.jsx
import React, { useState } from "react";

export default function PostComments({ post, onAddComment }) {
  const [commentText, setCommentText] = useState("");

  const handleCommentSend = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(post._id, text);
    setCommentText("");
  };

  return (
    <div className="mt-4 border-t pt-3 space-y-3">
      {(post.comments || []).map((c, idx) => (
        <div key={idx} className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
            {(c.username || "U").charAt(0).toUpperCase()}
          </div>
          <div className="bg-gray-50 p-3 rounded-lg flex-1">
            <div className="text-sm text-gray-700">
              <strong>{c.username}</strong>{" "}
              <span className="text-xs text-gray-400">
                · {new Date(c.createdAt || Date.now()).toLocaleString()}
              </span>
            </div>
            <div className="text-gray-800">{c.text}</div>
          </div>
        </div>
      ))}

      <div className="flex items-start space-x-3">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCommentSend();
            }
          }}
          rows={2}
          placeholder="Write a comment... (Enter to send)"
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={handleCommentSend}
          className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
