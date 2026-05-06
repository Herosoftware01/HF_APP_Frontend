import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const In_login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Updated to your specific login API
        const res = await fetch('http://10.1.21.13:8600/login/');
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data); // Storing the full object to keep screen_per and app_n
      } catch (err) {
        toast.error('Unable to load users');
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const validUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (validUser) {
      toast.success(`Welcome back, ${validUser.username}!`);
      
      setTimeout(() => {
        // Passing all required role data to the home page state
        const navOptions = { 
          state: { 
            role: validUser.screen_per, 
            name: validUser.username,
            app_n: validUser.app_n 
          } 
        };

        if (validUser.screen_per === 'Admin') {
          navigate('/admin', navOptions);
        } else {
          // Navigating to Home1 as per your existing logic
          navigate('/incdeb/home', navOptions);
        }
      }, 800);
    } else {
      toast.error('Invalid Credentials.');
    }
  };

  return (
    <div className="bg-[#e4e6e7] flex items-center justify-center h-screen w-full p-4">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="colored" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12">
          <form onSubmit={handleLogin} className="space-y-6">
            <h1 className="text-2xl font-bold text-center mb-4 text-slate-800">Sign In</h1>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl bg-slate-50 border focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border focus:border-indigo-500 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default In_login;