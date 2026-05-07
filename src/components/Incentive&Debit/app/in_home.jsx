import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FilePlus, CheckCircle, FileText, Settings, LogOut, LayoutGrid } from 'lucide-react';

const In_home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loggedInUser = location.state?.name || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://app.herofashion.com/incentive/api/incdeb_users/');
        const currentUser = response.data.find(u => u.username === loggedInUser);
        setUserData(currentUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [loggedInUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const screen_per = userData?.screen_per;

  const ActionCard = ({ title, desc, icon: Icon, colorClass, onClick }) => (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200 p-8 rounded-[24px] transition-all duration-300 hover:shadow-xl hover:border-indigo-100 cursor-pointer flex flex-col h-full"
    >
      <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110`}>
        <Icon size={28} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 mt-3 text-sm leading-relaxed flex-grow">{desc}</p>
      <div className="mt-8 flex items-center text-sm font-bold text-indigo-600">
        <span>Launch Module</span>
        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Clean Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-lg tracking-tight text-slate-900">HeroFashion</span>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 pr-4 border-r border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider leading-none mb-1">{screen_per || 'User'}</p>
                <p className="text-sm font-semibold text-slate-700 leading-none">{loggedInUser}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <img 
                  src={`https://ui-avatars.com/api/?name=${loggedInUser}&background=6366f1&color=fff&size=32`} 
                  className="rounded-full" 
                  alt="avatar" 
                />
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <LayoutGrid size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screen_per === 'Request' && (
            <>
              <ActionCard 
                title="Request" 
                desc="Create and submit new incentive entries for processing." 
                icon={FilePlus} 
                colorClass="bg-emerald-500" 
                onClick={() => navigate('/incdeb/request')} 
              />
              <ActionCard 
                title="Statement" 
                desc="View history and track current status of your requests." 
                icon={FileText} 
                colorClass="bg-amber-500" 
                onClick={() => navigate('/incdeb/statement')} 
              />
            </>
          )}

          {screen_per === 'Action' && (
            <>
              <ActionCard 
                title="Approval" 
                desc="Authorize pending incentive requests from the team." 
                icon={CheckCircle} 
                colorClass="bg-indigo-500" 
                onClick={() => navigate('/incdeb/approve')} 
              />
              <ActionCard 
                title="Statement" 
                desc="View history of all processed and authorized records." 
                icon={FileText} 
                colorClass="bg-amber-500" 
                onClick={() => navigate('/incdeb/statement')} 
              />
            </>
          )}

          {screen_per === 'Admin' && (
            <ActionCard 
              title="Admin Panel" 
              desc="System configurations, user management, and global logs." 
              icon={Settings} 
              colorClass="bg-rose-500" 
              onClick={() => navigate('/incdeb/admin')} 
            />
          )}

          {!screen_per && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-[24px]">
              <p className="text-slate-400 font-medium">No permissions assigned to this account.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default In_home;