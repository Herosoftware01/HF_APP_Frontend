import { useState } from "react";
import { loginUser } from "../auth/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page refresh if using form tags
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(username, password);
      const path = data.user?.default_path || "/dashboard";
      navigate(path);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white border border-gray-100 p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">HERO FASHION</h2>
          
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm animate-shake">
            <span className="font-bold">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Username</label>
            <input
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="text-sm font-semibold text-gray-700">Password</label>
             
            </div>
            <input
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black cursor-pointer text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        
      </div>
    </div>
  );
}

export default Login;