import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Emp from '../emp';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const Empleave = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API Data State
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Remarks Modal State
  const [remarks, setRemarks] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState({ code: '', name: '' });
  const [remarkInput, setRemarkInput] = useState({ date: '', text: '' });

  // Tooltip State
  const [tooltipInfo, setTooltipInfo] = useState({ visible: false, x: 0, y: 0, date: '', text: '' });

  // Fetch Data
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await fetch('https://hfapi.herofashion.com/reports/empleave/');
        const data = await response.json();
        
        if (data.status) {
          setLeaveRecords(data.leave_records);
          setDepartments(data.departments);
          setTotalRecords(data.total_records);
        } else {
          setError(data.message || "Failed to fetch data");
        }
      } catch (err) {
        setError("Network error or invalid API endpoint.");
        // Fallback mock data for testing UI if API is unreachable
        // setLeaveRecords([{leav_entno: 121, code: 22812, name: "GITA BHOI", dept: "UNIT-1", mobile: "9692748356", category: "Tailor", expecdt: "2026-05-16 00:00:00", leav_applydt: "2026-04-20 00:00:00", calculated_overdue: 0}]);
        // setDepartments(["UNIT-1"]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();

    // Load initial remarks from localStorage
    const loadedRemarks = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('remark_')) {
        const code = key.replace('remark_', '');
        loadedRemarks[code] = JSON.parse(localStorage.getItem(key));
      }
    }
    setRemarks(loadedRemarks);
  }, []);

  // Format Date Helper
  const formatDate = (dateStr, showYear = true) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: showYear ? 'numeric' : undefined
    });
  };

  // Derived Filtered Data
  const categories = useMemo(() => {
    return [...new Set(leaveRecords.map(r => r.category))].filter(Boolean);
  }, [leaveRecords]);

  const filteredRecords = useMemo(() => {
    return leaveRecords.filter(record => {
      const matchSearch = 
        record.code.toString().includes(searchTerm) || 
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.dept.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === '' || record.category === selectedCategory;
      const matchDept = selectedDept === '' || record.dept === selectedDept;
      
      return matchSearch && matchCat && matchDept;
    });
  }, [leaveRecords, searchTerm, selectedCategory, selectedDept]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    const deptCounts = {};
    filteredRecords.forEach(r => {
      deptCounts[r.dept] = (deptCounts[r.dept] || 0) + 1;
    });

    return {
      labels: Object.keys(deptCounts),
      datasets: [
        {
          label: 'Leaves',
          data: Object.values(deptCounts),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          barThickness: 30,
        }
      ]
    };
  }, [filteredRecords]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  // Handlers
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDept('');
  };

  const openModal = (code, name) => {
    setCurrentEmp({ code, name });
    const existing = remarks[code] || { date: '', text: '' };
    setRemarkInput(existing);
    setModalOpen(true);
  };

  const saveRemark = () => {
    const dataToSave = {
      ...remarkInput,
      updatedAt: new Date().toLocaleString()
    };
    localStorage.setItem(`remark_${currentEmp.code}`, JSON.stringify(dataToSave));
    setRemarks(prev => ({ ...prev, [currentEmp.code]: dataToSave }));
    setModalOpen(false);
  };

  const clearRemark = () => {
    if (window.confirm("Clear this remark?")) {
      localStorage.removeItem(`remark_${currentEmp.code}`);
      setRemarks(prev => {
        const newRemarks = { ...prev };
        delete newRemarks[currentEmp.code];
        return newRemarks;
      });
      setModalOpen(false);
    }
  };

  const handleMouseMove = (e, code) => {
    const savedData = remarks[code];
    if (savedData && (savedData.text?.trim() || savedData.date)) {
      let x = e.clientX + 15;
      let y = e.clientY + 15;
      if (x + 200 > window.innerWidth) x = e.clientX - 210;
      if (y + 100 > window.innerHeight) y = e.clientY - 110;
      
      setTooltipInfo({
        visible: true,
        x, y,
        date: savedData.date ? `Follow-up: ${savedData.date}` : 'Notes:',
        text: savedData.text || 'No description'
      });
    }
  };

  const hideTooltip = () => setTooltipInfo({ ...tooltipInfo, visible: false });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading leave data...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="bg-slate-50 p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <a href="/attendance" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Leave Management</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-600">Live Status: {filteredRecords.length} Active Leaves</span>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded mr-2"></span>
              Departmental Overview
            </h2>
            <div className="relative h-[250px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">On Leave Today</p>
            <h3 className="text-6xl font-extrabold mt-2">{filteredRecords.length}</h3>
            <p className="mt-4 text-sm text-blue-100/80 italic">"Management is doing things right; leadership is doing the right things."</p>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Global Search</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name or code..." 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button onClick={resetFilters} className="w-full md:w-auto px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg font-medium transition-colors">
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-white text-gray-400 text-left text-xs uppercase tracking-widest border-b">
                  <th className="px-6 py-4 font-semibold">Emp Code</th>
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-6 py-4 font-semibold">Unit & Dept</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold text-center">From/To</th>
                  <th className="px-6 py-4 font-semibold text-center">OverDue</th>
                  <th className="px-6 py-4 font-semibold text-center">Remarks</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No active records.</td></tr>
                ) : (
                  filteredRecords.map(record => {
                    const hasRemark = !!remarks[record.code];
                    return (
                      <tr 
                        key={record.code} 
                        className="hover:bg-blue-50/40 transition-colors duration-150"
                        onMouseMove={(e) => handleMouseMove(e, record.code)}
                        onMouseLeave={hideTooltip}
                      >
                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{record.code}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{record.name}</div>
                          <div className="text-xs text-gray-400">{record.mobile}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 font-medium">{record.dept}</div>
                          <div className="text-[11px] text-gray-400 uppercase">{record.unit || 'UNIT-1'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase ring-1 ring-inset ring-blue-700/10">
                            {record.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs">{formatDate(record.leav_applydt, false)} - {formatDate(record.expecdt)}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={record.calculated_overdue > 0 ? "text-red-600 font-bold animate-pulse" : "text-gray-400"}>
                            {record.calculated_overdue || "0"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => openModal(record.code, record.name)} 
                            className={`p-2 rounded-full transition-colors ${hasRemark ? 'bg-green-100 text-green-600' : 'text-blue-600 hover:bg-blue-100'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No active records.</div>
            ) : (
              filteredRecords.map(record => (
                <div key={record.code} className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block">{record.code}</span>
                      <h3 className="font-bold text-gray-900">{record.name}</h3>
                      <a href={`tel:${record.mobile}`} className="text-xs text-blue-600 font-medium flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {record.mobile}
                      </a>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase ring-1 ring-blue-700/10">
                        {record.category}
                      </span>
                      <button onClick={() => openModal(record.code, record.name)} className={`text-xs font-bold flex items-center ${remarks[record.code] ? 'text-green-600' : 'text-blue-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg> Remarks
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 py-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-semibold">Department</p>
                      <p className="text-xs font-medium text-gray-700">{record.dept}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-semibold">Duration</p>
                      <p className="text-xs font-medium text-gray-700">{formatDate(record.leav_applydt, false)} to {formatDate(record.expecdt, false)}</p>
                    </div>
                  </div>

                  {record.calculated_overdue > 0 && (
                    <div className="mt-2 bg-red-50 p-2 rounded-lg flex justify-between items-center">
                      <span className="text-xs font-bold text-red-700 uppercase">Overdue Status</span>
                      <span className="text-xs font-black text-red-600 animate-pulse">+{record.calculated_overdue} Days</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Remarks Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="text-blue-600 mr-2">{currentEmp.code}</span> {currentEmp.name}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Return Date</label>
                <input 
                  type="date" 
                  value={remarkInput.date}
                  onChange={(e) => setRemarkInput({...remarkInput, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Remark Notes</label>
                <textarea 
                  rows="4" 
                  placeholder="Type notes here..." 
                  value={remarkInput.text}
                  onChange={(e) => setRemarkInput({...remarkInput, text: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                ></textarea>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button onClick={clearRemark} className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-red-600">Clear</button>
              <button onClick={saveRemark} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Remark Tooltip */}
      {tooltipInfo.visible && (
        <div 
          className="fixed z-[60] bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl max-w-xs pointer-events-none border border-gray-700 transition-opacity duration-200"
          style={{ left: `${tooltipInfo.x}px`, top: `${tooltipInfo.y}px` }}
        >
          <div className="font-bold border-b border-gray-700 mb-1 pb-1 text-blue-400">{tooltipInfo.date}</div>
          <div className="leading-relaxed">{tooltipInfo.text}</div>
        </div>
      )}

    </div>
  );
};

export default Empleave;