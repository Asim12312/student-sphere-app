import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function CreatePostForm({ clubId }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.userId;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!userId) {
      toast.error('Please login to create a post');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('clubId', clubId);
      formData.append('userId', userId);

      if (image) {
        formData.append('image', image);
      }

      const authToken = userData?.token;

      if (!authToken) {
        toast.error('Session expired. Please login again.');
        return;
      }

      await axios.post('http://localhost:3000/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      toast.success('Post created successfully!');

      // Reset form
      setDescription('');
      setImage(null);

      // Refresh the page to show new posts
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setImage(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Image (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        {image && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
