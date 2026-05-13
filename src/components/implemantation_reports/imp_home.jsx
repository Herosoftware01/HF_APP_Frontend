import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Layers, Box, AlertTriangle, ExternalLink, Globe, Search } from "lucide-react";

const Imp_home = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const monitorItems = [
    { 
      name: "Bundle Monitoring", 
      path: "/imp/bundel", 
      description: "Manage and track unit bundle distributions",
      icon: <Box size={20} />,
      theme: "blue"
    },
    { 
      name: "Lay SP Data", 
      path: "/imp/lay", 
      description: "Synchronize layer planning specifications",
      icon: <Layers size={20} />,
      theme: "emerald"
    },
    { 
      name: "Final Mistakes", 
      path: "/imp/dyed", 
      description: "Quality control and defect reporting",
      icon: <AlertTriangle size={20} />,
      theme: "amber"
    },
    { 
      name: "Cora Roll", 
      path: "/imp/gray", 
      description: "Monitor raw material roll processing",
      icon: <Activity size={20} />,
      theme: "purple"
    },
    // Add more items here easily...
  ];

  const themeStyles = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600",
    amber: "text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-600",
    purple: "text-purple-600 bg-purple-50 border-purple-100 group-hover:bg-purple-600",
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-400 mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Globe className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-md font-bold text-slate-800 leading-none">IMP Monitor</h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">v2.0 Production</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search modules..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8 max-w-400mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Modules</h2>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-full">
                    {monitorItems.length}
                </span>
            </div>
            <p className="text-slate-500 text-sm">Operational interfaces for real-time production tracking.</p>
          </div>
        </header>

        {/* Scalable Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monitorItems
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item, idx) => (
            <Link to={item.path} key={idx} className="group">
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-100 hover:border-indigo-200 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg border transition-colors duration-200 ${themeStyles[item.theme]}`}>
                    <span className="group-hover:text-white transition-colors duration-200">
                        {item.icon}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Module
                  </span>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Imp_home;