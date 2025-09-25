import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideBar from '../../../components/user/SideBar';
import SubHeader from './SubHeader';
import { useNavigate } from 'react-router-dom';

const CreateClub = () => {
  const navigate = useNavigate();
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubImage, setClubImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [poorInternet, setPoorInternet] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?.userId;

  const handleImage = (e) => {
    const file = e.target.files[0];
    setClubImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    const formData = new FormData();
    formData.append('name', clubName);
    formData.append('description', clubDescription);
    formData.append('image', clubImage);
    formData.append('createdBy', userId);

    setUploading(true);
    setUploadProgress(0);
    setPoorInternet(false);

    const poorInternetTimer = setTimeout(() => {
      setPoorInternet(true);
      toast.warn("⚠️ Poor internet connection!");
    }, 6000);

    try {
      await axios.post('http://localhost:3000/club/createClub', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      toast.success("✅ Club created successfully!");
      setClubName('');
      setClubDescription('');
      setClubImage(null);
      navigate('/discoverClubs');
    } catch (error) {
      toast.error("❌ Club creation failed.");
      console.error(error);
    } finally {
      clearTimeout(poorInternetTimer);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setPoorInternet(false);
      }, 800);
    }
  };

  return (
    <>
      {/* Uploading Progress UI */}
      {uploading && (
        <div className="fixed top-0 left-0 w-full z-50">
          <div className="w-full h-2 bg-gray-200 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-blue-600 font-semibold bg-white px-4 py-1 rounded-xl shadow">
              Uploading... {uploadProgress}%
            </span>
          </div>
        </div>
      )}

      <SideBar />
      <SubHeader />

      {/* Club Form UI */}
      <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create a New Club</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Club Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Club Name</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter club name"
              />
            </div>

            {/* Club Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Club Description</label>
              <textarea
                value={clubDescription}
                onChange={(e) => setClubDescription(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your club..."
              ></textarea>
            </div>

            {/* Club Cover Image */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Club Cover Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={uploading}
                className={`${
                  uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200`}
              >
                {uploading ? 'Creating...' : 'Create Club'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={1500} />
    </>
  );
};

export default CreateClub;
