import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Users, ClipboardList, Settings } from "lucide-react";

const Re_home = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Employee Attendance Dashboard",
      description: "Track and manage daily employee presence and clock-ins.",
      icon: <CalendarCheck className="w-8 h-8 text-blue-600" />,
      path: "/hr/attendance",
      color: "bg-blue-50",
    },
    {
      title: "Staff Attendance Dashboard",
      description: "Manage staff profiles.",
      icon: <CalendarCheck className="w-8 h-8 text-purple-600" />,
      path: "/hr/staff",
      color: "bg-purple-50",
    },
    {
      title: "Employee Resignation Dashboard",
      description: "Review and approve pending employee resignation requests.",
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      path: "/hr/resignation",
      color: "bg-emerald-50",
    },
    {
      title: "Employee Joining Dashboard",
      description: "Manage employee onboarding and joining processes.",
      icon: <ClipboardList className="w-8 h-8 text-gray-600" />,
      path: "/hr/Joining",
      color: "bg-gray-100",
    },
    {
      title: "Employee Attendance Dashboard",
      description: "Track and manage daily employee presence and clock-ins.",
      icon: <CalendarCheck className="w-8 h-8 text-blue-600" />,
      path: "/hr/emp_trend",
      color: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-slate-900">HR Management</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening today.</p>
      </header>

      {/* Grid Layout */}
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 
                         hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 
                         transition-all duration-300 flex flex-col h-full"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-5 
                              group-hover:scale-110 transition-transform duration-300`}>
                {item.icon}
              </div>
              
              <h2 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h2>
              
              <p className="text-slate-500 text-sm leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-auto pt-6 flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Manage now 
                <span className="ml-2">→</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Re_home;