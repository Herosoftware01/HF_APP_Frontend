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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://app.herofashion.com/incentive/api/incdeb_users/');
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        toast.error('Unable to load server data');
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const validUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (validUser) {
      toast.success(`Access Granted. Welcome, ${validUser.username}`);
      
      setTimeout(() => {
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
          navigate('/incdeb/home', navOptions);
        }
      }, 1000);
    } else {
      setLoading(false);
      toast.error('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] font-sans antialiased">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar theme="flat" />
      
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-sm">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <span className="text-xs font-medium uppercase">Hide</span>
                  ) : (
                    <span className="text-xs font-medium uppercase">Show</span>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
              System v2.4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default In_login;