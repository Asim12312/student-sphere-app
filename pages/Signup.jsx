import { NavLink } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    userEmail: "",
    password: "",
    gender: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/user/signup", formData);
      console.log(response);
      toast.success("✅ Signup successfully!");
    } catch (error) {
      console.log(error);
      toast.error("❌ Signup failed. Please try again");
    }
  };

  return (
    <>

      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob" />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />

      <div className="grid grid-cols-2 h-screen relative z-10">

        <div className="relative overflow-hidden rounded-br-full ring-pink-500 ring-8">
          <img
            src="/landing.png"
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-white text-6xl md:text-8xl md:mr-16 font-extrabold drop-shadow-lg">
              Join Us
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="grid grid-rows-[1fr_2fr] z-20">
          {/* Nav Tabs */}
          <div className="flex justify-center items-center">
            <div className="flex gap-6 border-2 border-pink-500 rounded-2xl bg-white shadow-2xl px-8 py-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-6 py-2 rounded-xl font-semibold text-lg transition-all duration-300 ${isActive
                    ? "bg-pink-500 text-white shadow-md"
                    : "text-pink-500 hover:bg-pink-100"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `px-6 py-2 rounded-xl font-semibold text-lg transition-all duration-300 ${isActive
                    ? "bg-pink-500 text-white shadow-md"
                    : "text-pink-500 hover:bg-pink-100"
                  }`
                }
              >
                Signup
              </NavLink>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 px-10 py-6">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg w-full h-12"
              required
            />
            <input
              type="userEmail"
              name="userEmail"
              placeholder="Your Email"
              value={formData.userEmail}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg w-full h-12"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg w-full h-12"
              required
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="p-2 border border-gray-300 rounded-lg w-full h-12"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <div className="col-span-2 flex justify-center">
              <button
                type="submit"
                className="bg-red-400 h-12 w-32 text-white rounded-lg text-lg font-bold"
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default Signup;