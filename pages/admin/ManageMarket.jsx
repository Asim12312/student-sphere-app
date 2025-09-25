import { useState, useEffect } from 'react';
import SideBar from '../../components/admin/AdminSidebar';
import { FiSearch } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const images = ["equipment.png", "gadgets.png", "technology.png"];
const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

const ManageMarket = () => {
  const [category, setCategory] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryAdd = async () => {
    const trimmedCategory = category.trim();
    if (trimmedCategory === "") {
      toast.error("❌ Please enter a category");
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/category/addCategory', { category: trimmedCategory },
        {
          headers: {
            Authorization: `Bearer ${adminData.token}`,
          },
        }
      );
      if (res.status === 201 || res.status === 200) {
        setCategory("");
        toast.success("✅ Category added successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Category not added");
    }
  };

  const handleCategoryRemove = async () => {
    const trimmedCategory = category.trim();
    if (trimmedCategory === "") {
      toast.error("❌ Please enter a category");
      return;
    }
    try {
      const res = await axios.delete('http://localhost:3000/category/deleteCategory', {
        headers: {
          Authorization: `Bearer ${adminData.token}`,
        },
        data: { category: trimmedCategory }
      });
      if (res.status === 200) {
        setCategory("");
        toast.success("✅ Category removed successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Category not found");
    }
  };

  return (
    <>
      <div className="h-screen w-screen grid grid-cols-[1fr_5fr]">
        <SideBar />
        <div className="p-6 overflow-y-auto bg-white">
          {/* Header Section */}
          <div className='flex flex-col gap-6 mb-6'>

            {/* Search Bar */}
            <div className='flex items-center'>
              <input
                type='text'
                placeholder='Search items here...'
                className='h-12 bg-gray-100 rounded-l-2xl w-2/3 pl-4'
              />
              <button className='flex justify-center items-center bg-red-500 hover:bg-red-600 border-l-2 border-black rounded-r-2xl h-12 px-4 text-white'>
                <FiSearch size={24} />
              </button>
            </div>

            {/* Category Bar */}
            <div className='flex items-center'>
              <button
                onClick={handleCategoryRemove}
                disabled={category.trim() === ""}
                className='bg-red-500 hover:bg-red-600 border-l-2 border-black rounded-l-2xl h-12 px-4 text-white'>
                Remove
              </button>
              <input
                type='text'
                placeholder='Enter category name to add or remove...'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='h-12 bg-gray-100 w-2/3 pl-4'
              />
              <button
                onClick={handleCategoryAdd}
                disabled={category.trim() === ""}
                className='bg-red-500 hover:bg-red-600 border-l-2 border-black rounded-r-2xl h-12 px-4 text-white'>
                Add
              </button>
            </div>

          </div>

          {/* Image Section */}
          <div className="w-full h-[300px]">
            <img
              src={`/${images[imageIndex]}`}
              alt='marketplace'
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};

export default ManageMarket;
