import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search,
  RefreshCw,
  Layers,
  ClipboardList,
  X,
  Database,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components (Internal to file) ---

const FilterInput = ({ label, value, onChange, placeholder }) => (
  <div className="flex-1 min-w-37.5]">
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
  <div className="flex-1 min-w-37.5">
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
              {employee.name?.charAt(0)}
            </div>
          )}
        </td>
        <td className="px-4 py-4 text-[13px] text-slate-600">{employee.shift}</td>
        {showSalary && <td className="px-4 py-4 text-[13px] text-slate-600">{employee.salary?.toFixed(2)}</td>}
        <td className="px-4 py-4 text-[13px] text-slate-600/70">{employee.totalMins?.toFixed(2)}</td>
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
            {employee.pers?.toFixed(2)}
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
                          <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Top/Bottom</th>
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
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center">
                                  <Layers size={14} className="text-slate-200" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-[13px] text-slate-600">{job.topBottom}</td>
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
                      <p className="text-sm">No drill-down data available for this employee record.</p>
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

// --- Main Component ---

const Emp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    dept: '',
    category: '',
    empId: '',
    name: ''
  });

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showSalary, setShowSalary] = useState(false);
  const [isEnteringPassword, setIsEnteringPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [isEntryCheckOpen, setIsEntryCheckOpen] = useState(false);
  const [entryCheckId, setEntryCheckId] = useState('');
  const [entryCheckType, setEntryCheckType] = useState('All');
  const [entryCheckResult, setEntryCheckResult] = useState(null);
  const [allEntriesForId, setAllEntriesForId] = useState([]);
  const [availableTypes, setAvailableTypes] = useState(['All']);
  const [entryCheckLoading, setEntryCheckLoading] = useState(false);
  const [entryCheckError, setEntryCheckError] = useState(null);

  const uniqueDepts = Array.from(new Set(data.map(emp => emp.dept))).filter(Boolean).sort();
  const uniqueCategories = Array.from(new Set(data.map(emp => emp.category))).filter(Boolean).sort();

  const handleEntryCheck = async (e) => {
    e.preventDefault();
    if (!entryCheckId.trim()) return;

    try {
      setEntryCheckLoading(true);
      setEntryCheckError(null);
      setEntryCheckResult(null);
      setAllEntriesForId([]);

      const response = await fetch(`https://hfapi.herofashion.com/advance/new_pros/?rec=${entryCheckId}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      let records = [];
      if (Array.isArray(result)) records = result;
      else if (result && Array.isArray(result.data)) records = result.data;
      else if (result && result.data) records = [result.data];
      else if (result) records = [result];

      if (records.length === 0) {
        setEntryCheckResult([]);
        return;
      }

      const types = Array.from(new Set(records.map(r => r.t || r.type).filter(Boolean))).sort();
      setAvailableTypes(['All', ...types]);
      setAllEntriesForId(records);
      setEntryCheckResult(records);
      setEntryCheckType('All');
    } catch (err) {
      setEntryCheckError(err.message || 'Failed to fetch data');
    } finally {
      setEntryCheckLoading(false);
    }
  };

  useEffect(() => {
    if (allEntriesForId.length > 0) {
      if (entryCheckType === 'All') {
        setEntryCheckResult(allEntriesForId);
      } else {
        const filtered = allEntriesForId.filter(r => (r.t || r.type) === entryCheckType);
        setEntryCheckResult(filtered);
      }
    }
  }, [entryCheckType, allEntriesForId]);

  const handleShowSalaryClick = () => {
    if (showSalary) setShowSalary(false);
    else setIsEnteringPassword(true);
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://app.herofashion.com/grid_api/');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
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
        jobs: item.details?.map((job) => ({
           jobNo: job.jobno || '',
           photo: job.photo || '',
           mainImagePath: job.mainimagepath || '',
           topBottom: job.topbottom_des || job.item_cat || job.item_category || job.category || '',
           processDes: job.process_des || '',
           prodQty: parseFloat(job.prodqty) || parseFloat(job.qty) || 0,
           minutes: parseFloat(job.m) || parseFloat(job.mins) || parseFloat(job.minutes) || 0
        })) || []
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

  const filteredData = data.filter(emp => {
    const empDateStr = emp.rawDate ? emp.rawDate.split('T')[0] : null;
    const startStr = filters.startDate;
    const endStr = filters.endDate;
    const dateInRange = (!empDateStr || !startStr || !endStr) ? true : (empDateStr >= startStr && empDateStr <= endStr);

    return (
      dateInRange &&
      emp.dept.toLowerCase().includes(filters.dept.toLowerCase()) &&
      emp.category.toLowerCase().includes(filters.category.toLowerCase()) &&
      emp.empId.toLowerCase().includes(filters.empId.toLowerCase()) &&
      emp.name.toLowerCase().includes(filters.name.toLowerCase())
    );
  }).sort((a, b) => b.pers - a.pers);

  return (
    <div className="h-screen w-full bg-slate-50 overflow-hidden flex flex-col font-sans">
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header Section */}
        <header className="h-16 shrink-0 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Employee Efficiency Report</h1>
            <p className="text-xs text-slate-500 mt-0.5">Performance analytics across all production units</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-600 shadow-sm">
              <Clock size={14} className="text-indigo-600" />
              Today: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>

            <button 
              onClick={() => setIsEntryCheckOpen(true)}
              className="h-9 px-4 flex items-center gap-2 cursor-pointer bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
            >
              <Database size={14} />
              Entry Check
            </button>
            
            {isEnteringPassword ? (
              <form onSubmit={handlePasswordSubmit} className="flex items-center cursor-pointer gap-2 bg-white border border-emerald-200 p-1 rounded-lg shadow-sm">
                <input
                  autoFocus
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-24 px-2 py-1 text-xs border border-slate-200 cursor-pointer rounded outline-none focus:border-emerald-500"
                />
                <button type="submit" className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded hover:bg-emerald-600">Unlock</button>
                <button type="button" onClick={() => setIsEnteringPassword(false)} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">Cancel</button>
              </form>
            ) : (
              <button 
                onClick={handleShowSalaryClick}
                className={`h-9 px-4 flex items-center gap-2 rounded-lg cursor-pointer text-xs font-bold transition-all shadow-sm active:scale-95 ${
                  showSalary ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border  border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {showSalary ? 'Hide Salary' : 'Show Salary'}
              </button>
            )}

            <button 
              onClick={fetchData}
              disabled={loading}
              className="h-9 px-4 flex items-center cursor-pointer gap-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end shrink-0">
            <div className="flex-1 min-w-75 flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Start Date</label>
                <input type="date" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">End Date</label>
                <input type="date" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
              </div>
            </div>
            <FilterSelect label="Dept" value={filters.dept} onChange={(v) => handleFilterChange('dept', v)} options={uniqueDepts} placeholder="All Departments" />
            <FilterSelect label="Category" value={filters.category} onChange={(v) => handleFilterChange('category', v)} options={uniqueCategories} placeholder="All Categories" />
            <FilterInput label="Emp ID" value={filters.empId} onChange={(v) => handleFilterChange('empId', v)} placeholder="Search ID" />
            <FilterInput label="Name" value={filters.name} onChange={(v) => handleFilterChange('name', v)} placeholder="Employee Name" />
            <button 
              onClick={() => setFilters({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], dept: '', category: '', empId: '', name: '' })}
              className="px-4 py-2 text-xs font-bold cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors mb-1"
            >
              Reset
            </button>
          </div>

          {/* Main Table Content */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-300">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Dept</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Emp Id</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Image</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Shift</th>
                    {showSalary && <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Salary</th>}
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Mins</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Work Mins</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Qty</th>
                    <th className="sticky top-0 z-20 bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Pers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-medium tracking-tight">Syncing production data...</p>
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((emp, i) => (
                      <PerformanceRow 
                        key={`${emp.empId}-${i}`} 
                        employee={emp} 
                        isExpanded={expandedRowId === `${emp.empId}-${i}`}
                        onToggle={() => setExpandedRowId(expandedRowId === `${emp.empId}-${i}` ? null : `${emp.empId}-${i}`)}
                        showSalary={showSalary}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="py-20 text-center text-slate-400 font-medium">No records found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination/Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs text-slate-500">
              <span className="font-medium">Showing <strong className="text-slate-900">{filteredData.length}</strong> of <strong className="text-slate-900">{data.length}</strong> Records</span>
              <div className="flex gap-4">
                <button className="hover:text-indigo-600 transition-colors opacity-50 cursor-not-allowed">Previous</button>
                <button className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Next Page</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Entry Check Modal (Exactly as pictured) */}
      <AnimatePresence>
        {isEntryCheckOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEntryCheckOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50">
                <h2 className="font-bold text-lg flex items-center gap-2"><Database size={18} className="text-indigo-600" /> Entry Check</h2>
                <button onClick={() => setIsEntryCheckOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 overflow-hidden flex flex-col gap-6">
                <form onSubmit={handleEntryCheck} className="flex gap-3 items-end">
                  <div className="flex-1 min-w-35">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                    <select value={entryCheckType} onChange={(e) => setEntryCheckType(e.target.value)} className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner appearance-none cursor-pointer">
                      {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex-2 min-w-50">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Entry Number</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="e.g. 41604" value={entryCheckId} onChange={(e) => setEntryCheckId(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner" />
                    </div>
                  </div>
                  <button type="submit" disabled={entryCheckLoading || !entryCheckId.trim()} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2 whitespace-nowrap">
                    {entryCheckLoading ? <RefreshCw size={16} className="animate-spin" /> : 'Check'}
                  </button>
                </form>

                <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl border border-slate-100 shadow-inner relative custom-scrollbar min-h-75">
                  {entryCheckLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80">
                      <RefreshCw className="animate-spin text-indigo-600 mb-4" size={32} />
                      <p className="text-slate-500 font-medium">Fetching record details...</p>
                    </div>
                  )}

                  {entryCheckResult?.length > 0 ? (
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-slate-50">
                          <tr>
                            {Object.keys(entryCheckResult[0]).map(k => (
                              <th key={k} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap border-b border-slate-200 shadow-sm">{k === 't' ? 'Type' : k.replace(/_/g, ' ')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {entryCheckResult.map((row, i) => (
                            <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                              {Object.keys(entryCheckResult[0]).map((k, j) => (
                                <td key={j} className="px-6 py-4 text-[13px] text-slate-600 font-medium whitespace-nowrap border-b border-slate-50">{row[k] ?? <span className="text-slate-300 italic">null</span>}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : !entryCheckLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <Database size={64} strokeWidth={1} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Enter a record ID above to view details</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-slate-50/30 flex justify-end">
                <button onClick={() => setIsEntryCheckOpen(false)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Emp;