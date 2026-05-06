import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Clock, 
  Layers, 
  ClipboardList 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-Components ---

const FilterInput = ({ label, value, onChange, placeholder }) => (
  <div className="flex-1 min-w-[150px]">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">{label}</label>
    <div className="relative group">
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-3 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
      />
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex-1 min-w-[150px]">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">{label}</label>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={14} />
      </div>
    </div>
  </div>
);

const PerformanceRow = ({ employee, isExpanded, onToggle, showSalary }) => {
  return (
    <>
      <tr 
        className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 cursor-pointer ${isExpanded ? 'bg-slate-50/50' : ''}`}
        onClick={onToggle}
      >
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span className="text-[13px] font-medium text-slate-600">{employee.date}</span>
          </div>
        </td>
        <td className="px-4 py-4 text-[13px] text-slate-600">{employee.dept}</td>
        <td className="px-4 py-4 text-[13px] text-slate-600">{employee.category}</td>
        <td className="px-4 py-4 text-[13px] text-slate-500 font-mono italic">{employee.empId}</td>
        <td className="px-4 py-4 text-[13px] font-semibold text-slate-900">{employee.name}</td>
        <td className="px-4 py-4 text-center">
          {employee.image ? (
            <img 
              src={employee.image} 
              alt={employee.name} 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 mx-auto"
              referrerPolicy="no-referrer"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold mx-auto">
              {employee.name ? employee.name.charAt(0) : 'E'}
            </div>
          )}
        </td>
        <td className="px-4 py-4 text-[13px] text-slate-600">{employee.shift}</td>
        {showSalary && <td className="px-4 py-4 text-[13px] text-slate-600">{employee.salary.toFixed(2)}</td>}
        <td className="px-4 py-4 text-[13px] text-slate-600/70">{employee.totalMins.toFixed(2)}</td>
        <td className="px-4 py-4 text-[13px] text-slate-600">{employee.workMins}</td>
        <td className="px-4 py-4 text-[13px] text-slate-600">{employee.totalQty}</td>
        <td className="px-4 py-4 text-right">
          <span className={`px-2 py-1 rounded text-xs font-bold ring-1 ring-inset ${
            employee.pers <= 30
              ? 'bg-red-50 text-red-600 ring-red-500/30'
              : employee.pers <= 70
                ? 'bg-blue-50 text-blue-600 ring-blue-500/30'
                : employee.pers <= 100
                  ? 'bg-green-50 text-green-600 ring-green-500/30'
                  : 'bg-orange-50 text-orange-600 ring-orange-500/30'
          }`}>
            {employee.pers.toFixed(2)}
          </span>
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={showSalary ? 12 : 11} className="px-8 py-0 border-b border-slate-100">
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="py-6 px-10 bg-white/50 my-2 rounded-xl border border-slate-100 shadow-inner">
                  {employee.jobs && employee.jobs.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Jobno</th>
                          <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Photo</th>
                          <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Process Des</th>
                          <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Prod Qty</th>
                          <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 text-right">Minutes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employee.jobs.map((job, idx) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 text-[13px] font-medium text-slate-700">{job.jobNo}</td>
                            <td className="py-2 px-2">
                              {job.mainImagePath ? (
                                <img 
                                  src={job.mainImagePath} 
                                  alt="Process" 
                                  className="w-10 h-10 rounded-md object-cover border border-slate-100"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center">
                                  <Layers size={14} className="text-slate-200" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-[13px] text-slate-600">{job.processDes}</td>
                            <td className="py-3 px-2 text-[13px] text-slate-600">{job.prodQty}</td>
                            <td className="py-3 px-2 text-[13px] font-semibold text-slate-900 text-right">{job.minutes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <ClipboardList size={40} className="mb-2 opacity-20" />
                      <p className="text-sm">No drill-down data available.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App Component ---


export default function Emp() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showSalary, setShowSalary] = useState(false);
  const [isEnteringPassword, setIsEnteringPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    dept: '',
    category: '',
    empId: '',
    name: ''
  });

  const handleShowSalaryClick = () => {
    if (showSalary) {
      setShowSalary(false);
    } else {
      setIsEnteringPassword(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === '12348') {
      setShowSalary(true);
      setIsEnteringPassword(false);
      setPasswordInput('');
    } else {
      alert('Incorrect password!');
      setPasswordInput('');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Trying local proxy first as configured in your vite.config.js
      let response = await fetch('https://app.herofashion.com/grid_api/'); 
      
      

      const result = await response.json();
      const rawItems = Array.isArray(result) ? result : (result.data || []);
      
      const mappedData = rawItems.map((item) => ({
        date: item.dt ? new Date(item.dt).toLocaleDateString('en-GB') : '', 
        rawDate: item.dt || '',
        dept: item.dept || '',
        category: item.category || '',
        empId: item.id?.toString() || '',
        name: item.name || '',
        image: item.photo || '',
        shift: item.sv || '',
        salary: parseFloat(item.salary) || 0,
        totalMins: parseFloat(item.mins) || 0,
        workMins: parseFloat(item.m) || 0,
        totalQty: parseFloat(item.total_prodqty) || 0,
        pers: parseFloat(item.pers) || 0,
        jobs: (item.details || []).map((job) => ({
           jobNo: job.jobno || '',
           mainImagePath: job.mainimagepath || '',
           processDes: job.process_des || '',
           prodQty: parseFloat(job.prodqty) || 0,
           minutes: parseFloat(job.m) || 0
        }))
      }));

      setData(mappedData);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueDepts = Array.from(new Set(data.map(emp => emp.dept))).filter(Boolean).sort();
  const uniqueCategories = Array.from(new Set(data.map(emp => emp.category))).filter(Boolean).sort();

  const filteredData = data.filter(emp => {
    const empDateStr = emp.rawDate ? emp.rawDate.split('T')[0] : null;
    const dateInRange = (!empDateStr) ? true : (empDateStr >= filters.startDate && empDateStr <= filters.endDate);

    return (
      dateInRange &&
      emp.dept.toLowerCase().includes(filters.dept.toLowerCase()) &&
      emp.category.toLowerCase().includes(filters.category.toLowerCase()) &&
      emp.empId.toLowerCase().includes(filters.empId.toLowerCase()) &&
      emp.name.toLowerCase().includes(filters.name.toLowerCase())
    );
  }).sort((a, b) => b.pers - a.pers);

  return (
    <div className="h-screen w-full bg-slate-50 overflow-hidden flex flex-col">
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Employee Efficiency Report</h1>
            <p className="text-xs text-slate-500 mt-0.5">Performance analytics across all production units</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-600 shadow-sm">
              <Clock size={14} className="text-indigo-600" />
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>

            {isEnteringPassword ? (
              <form onSubmit={handlePasswordSubmit} className="flex items-center gap-2 bg-white border border-emerald-200 p-1 rounded-lg shadow-sm">
                <input
                  autoFocus
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-24 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:border-emerald-500"
                />
                <button type="submit" className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded">Unlock</button>
                <button type="button" onClick={() => setIsEnteringPassword(false)} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">Cancel</button>
              </form>
            ) : (
              <button 
                onClick={handleShowSalaryClick}
                className={`h-9 px-4 flex items-center gap-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  showSalary ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {showSalary ? 'Hide Salary' : 'Show Salary'}
              </button>
            )}

            <button 
              onClick={fetchData}
              disabled={loading}
              className="h-9 px-4 flex items-center gap-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end shrink-0">
             <div className="flex-1 min-w-[300px] flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                  <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs shadow-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                  <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs shadow-sm" />
                </div>
             </div>
             <FilterSelect label="Dept" value={filters.dept} onChange={(v) => setFilters({...filters, dept: v})} options={uniqueDepts} placeholder="All Departments" />
             <FilterSelect label="Category" value={filters.category} onChange={(v) => setFilters({...filters, category: v})} options={uniqueCategories} placeholder="All Categories" />
             <FilterInput label="Emp ID" value={filters.empId} onChange={(v) => setFilters({...filters, empId: v})} placeholder="Search ID" />
             <FilterInput label="Name" value={filters.name} onChange={(v) => setFilters({...filters, name: v})} placeholder="Name" />
          </div>

          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Date</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Dept</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Category</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Emp Id</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Name</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 text-center">Image</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Shift</th>
                    {showSalary && <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Salary</th>}
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Total Mins</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Work Mins</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">Total Qty</th>
                    <th className="sticky top-0 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 text-right">Pers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={12} className="py-20 text-center text-slate-500">Syncing data...</td></tr>
                  ) : filteredData.map((emp, i) => (
                    <PerformanceRow 
                      key={i} 
                      employee={emp} 
                      isExpanded={expandedRowId === i} 
                      onToggle={() => setExpandedRowId(expandedRowId === i ? null : i)} 
                      showSalary={showSalary} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}