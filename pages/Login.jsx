import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
const Login = () => {
  const [form, setForm] = useState({
    userEmail: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/user/login", form);

      console.log(response);
      if (response.data.role == 'user') {
        localStorage.setItem("userData", JSON.stringify(response.data));
        localStorage.setItem("id", response.data.userId); // Store userId separately for notifications
        console.log('✅ [Login] User logged in, userId stored:', response.data.userId);
        toast.success("✅ Logged in");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
      if (response.data.role == 'admin') {
        localStorage.setItem("adminData", JSON.stringify(response.data));
        localStorage.setItem("id", response.data.userId); // Store userId separately for notifications
        console.log('✅ [Login] Admin logged in, userId stored:', response.data.userId);
        toast.success("✅ Logged in");
        setTimeout(() => {
          navigate("/AdminDashboard");
        }, 1000);
      }


    } catch (error) {
      console.log(error);
      toast.error("❌ Login failed. Check credentials!");
    }
  };

  return (
    <>

      <div className="absolute top-10 left-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="grid grid-cols-2 h-screen relative z-10">

        <div className="relative overflow-hidden rounded-br-full ring-pink-500 ring-8">
          <img src="/landing.png" alt="Login Image" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-white text-6xl md:text-8xl md:mr-16 font-extrabold drop-shadow-lg">
              WELCOME
            </p>
          </div>
        </div>

        <div className="grid grid-rows-2">

          <div className="flex justify-center items-center">
            <div className="flex justify-center items-center w-70 gap-6 border-2 border-pink-500 rounded-2xl bg-white shadow-2xl px-8 py-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-6 py-2 rounded-xl font-semibold transition-all duration-300 text-lg ${isActive
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'text-pink-500 hover:bg-pink-100'
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `px-6 py-2 rounded-xl font-semibold transition-all duration-300 text-lg ${isActive
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'text-pink-500 hover:bg-pink-100'
                  }`
                }
              >
                Signup
              </NavLink>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-rows-5 gap-4">
            <div className="flex justify-center items-center">
              <input
                type="email"
                name="userEmail"
                placeholder="Email"
                value={form.userEmail}
                onChange={handleChange}
                className="mt-4 p-2 border border-gray-300 rounded-lg w-full max-w-xs"
                required
              />
            </div>
            <div className="flex justify-center items-center">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="mt-4 p-2 border border-gray-300 rounded-lg w-full max-w-xs"
                required
              />
            </div>
            <div className="flex justify-center items-center">
              <button
                type="submit"
                className="bg-red-400 h-12 w-24 text-white rounded-lg font-bold text-lg"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default Login;
