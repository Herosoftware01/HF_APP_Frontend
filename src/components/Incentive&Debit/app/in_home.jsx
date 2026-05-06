import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const In_home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Destructuring values passed from Login.js
  const { role, name, app_n } = location.state || {};

  const cardBaseStyle = "bg-white border border-slate-200 p-8 rounded-2xl transition-all cursor-pointer hover:border-indigo-600 hover:shadow-md flex flex-col justify-between h-full";

  // Redirect if someone tries to access /home1 without logging in
  if (!role) {
    return <div className="p-10 text-center">Unauthorized. Please login.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b p-4 flex justify-between items-center px-10">
        <span className="font-bold text-indigo-600">HeroFashion</span>
        <span className="font-bold text-slate-700">{name}</span>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-10 text-slate-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LOGIC: Show Request + Statement if screen_per is Request & app_n is 2 */}
          {role === 'Request' && app_n === 2 && (
            <>
              <div onClick={() => navigate('/request')} className={cardBaseStyle}>
                <h3 className="text-xl font-bold text-green-600">Request</h3>
                <p className="text-slate-500 text-sm mt-2">Create new entries.</p>
              </div>
              <div onClick={() => navigate('/statement')} className={cardBaseStyle}>
                <h3 className="text-xl font-bold text-amber-600">Statement</h3>
                <p className="text-slate-500 text-sm mt-2">View history.</p>
              </div>
            </>
          )}

          {/* LOGIC: Show Approval + Statement if screen_per is Action & app_n is 2 */}
          {role === 'Action' && app_n === 2 && (
            <>
              <div onClick={() => navigate('/approve')} className={cardBaseStyle}>
                <h3 className="text-xl font-bold text-indigo-600">Approval</h3>
                <p className="text-slate-500 text-sm mt-2">Authorize requests.</p>
              </div>
              <div onClick={() => navigate('/statement')} className={cardBaseStyle}>
                <h3 className="text-xl font-bold text-amber-600">Statement</h3>
                <p className="text-slate-500 text-sm mt-2">View history.</p>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default In_home;