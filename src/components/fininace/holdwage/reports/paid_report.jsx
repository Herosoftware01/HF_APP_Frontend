import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {  RotateCcw, Filter, User, Hash, Calendar } from "lucide-react";

const PaidReport = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [codes, setCodes] = useState([]);
  const [names, setNames] = useState([]);

  const [filters, setFilters] = useState({
    code: "",
    name: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filters, data]);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://hfapi.herofashion.com/reports/holdwagepaid/");
      const fetchedData = res.data;
      setData(fetchedData);
      setFilteredData(fetchedData);
      setCodes([...new Set(fetchedData.map((item) => item.code))].sort());
      setNames([...new Set(fetchedData.map((item) => item.emp_name))].sort());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilter = () => {
    let temp = [...data];
    if (filters.code) temp = temp.filter((item) => String(item.code) === String(filters.code));
    if (filters.name) temp = temp.filter((item) => item.emp_name === filters.name);
    if (filters.fromDate) temp = temp.filter((item) => item.dt >= filters.fromDate);
    if (filters.toDate) temp = temp.filter((item) => item.dt <= filters.toDate);
    setFilteredData(temp);
  };

  const resetFilter = () => {
    setFilters({ code: "", name: "", fromDate: "", toDate: "" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* 🔹 Fixed Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Hold Wage Paid</h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wide">
                {filteredData.length} Records found
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilter}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button onClick={() => navigate(-1)} className="bg-white text-slate-600 cursor-pointer hover:bg-slate-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 border border-slate-200">
                  ← Back
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        {/* 🔹 Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
            <Filter size={18} className="text-indigo-600" />
            <span>Filter Criteria</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Hash size={12} /> Emp Code
              </label>
              <select
                name="code"
                value={filters.code}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="">All Codes</option>
                {codes.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <User size={12} /> Employee Name
              </label>
              <select
                name="name"
                value={filters.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="">All Names</option>
                {names.map((n, i) => <option key={i} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> From
              </label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> To
              </label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* 🔹 Responsive Container */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            <>
              {/* 📱 Mobile Card View (Shown on small screens, hidden on md+) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredData.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400">#{item.entry_no}</span>
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded border border-indigo-100">
                        {item.code}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{item.emp_name}</h3>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Paid Date</span>
                        <span className="text-xs font-medium text-slate-600">{item.dt}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Period</span>
                        <span className="text-sm font-bold text-slate-800">{item.t_period}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 💻 Desktop Table View (Hidden on small screens, shown on md+) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">Entry No</th>
                        <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">Date</th>
                        <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">Code</th>
                        <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">Name</th>
                        <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">Paid Amount</th>
                        <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 ">Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((item, index) => (
                        <tr key={index} className="group hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4 text-sm text-slate-600 font-mono">{item.entry_no}</td>
                          <td className="p-4 text-sm text-slate-600">
                            <span className="bg-slate-100 px-2 py-1 rounded-md text-xs"> {new Date(item.dt).toLocaleDateString("en-IN")}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                              {item.code}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-800">{item.emp_name}</td>
                          <td className="p-4 text-sm font-medium text-slate-800">{item.paid_amt}</td>
                          <td className="p-4 text-sm text-slate-600  font-medium">{item.t_period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* 🔹 Empty State */
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Filter size={32} />
              </div>
              <h3 className="text-slate-900 font-bold">No results found</h3>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters to find what you're looking for.</p>
              <button 
                onClick={resetFilter}
                className="mt-4 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaidReport;