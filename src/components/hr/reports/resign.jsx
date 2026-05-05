import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  LogOut, ArrowLeft, Building2, Calendar, 
  Clock, UserMinus, Printer, FileSpreadsheet, 
  Search, Filter, X, ArrowUpDown, ChevronUp, ChevronDown 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, subMonths } from 'date-fns'; // Added subMonths

const API_URL = "http://10.1.21.13:8200/reports/resign_report/";

const Resign = () => {
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Added 'period' to filters
  const [filters, setFilters] = useState({ unit: 'ALL', fromDate: '', toDate: '', period: 'ALL' });
  const [sortConfig, setSortConfig] = useState({ key: 'days_worked', direction: 'desc' });
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [reasons, setReasons] = useState({});

  /**
   * Helper to handle period changes
   */
  const handlePeriodChange = (period) => {
    let fromDate = '';
    const toDate = format(new Date(), 'yyyy-MM-dd');

    if (period !== 'ALL') {
      const months = parseInt(period);
      fromDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
    }

    setFilters({
      ...filters,
      period,
      fromDate,
      toDate: period === 'ALL' ? '' : toDate
    });
  };

  useEffect(() => {
    fetchData();
  }, [filters.unit, filters.fromDate, filters.toDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.unit !== 'ALL') params.append('unit', filters.unit);
      if (filters.fromDate) params.append('from_date', filters.fromDate);
      if (filters.toDate) params.append('to_date', filters.toDate);

      const response = await axios.get(`${API_URL}?${params.toString()}`);
      setData(Array.isArray(response.data.resign) ? response.data.resign : []);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Error fetching resignation data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ... (sortedData, stats, handleSort, exportToExcel stay the same)
  const sortedData = useMemo(() => {
    const baseData = Array.isArray(data) ? data : [];
    return [...baseData].sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const stats = {
    total: sortedData.length,
    avgTenure: sortedData.length > 0 
      ? Math.round(sortedData.reduce((acc, curr) => acc + (curr.days_worked || 0), 0) / sortedData.length) 
      : 0,
    thisMonth: sortedData.filter(item => {
      const d = new Date(item.resign_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToExcel = () => {
    const exportData = sortedData.map(item => ({
      'Emp ID': item.id,
      'Name': item.emp_name || 'N/A',
      'Department': item.dept,
      'Category': item.category,
      'Mobile': item.mobile,
      'Join Date': item.joindt ? format(new Date(item.joindt), 'dd/MM/yyyy') : '',
      'Resign Date': item.resign_date ? format(new Date(item.resign_date), 'dd/MM/yyyy') : '',
      'Days Worked': item.days_worked,
      'Incharge Reason': reasons[`${item.id}_incharge`] || '',
      'HR Reason': reasons[`${item.id}_hr`] || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resignations");
    XLSX.writeFile(wb, `Resignation_Report_${filters.unit}.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      <nav className="bg-white border-b border-slate-200 z-30 flex-none px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><LogOut size={20} /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Resignation Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">Exit Management & Analysis</p>
            </div>
          </div>
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMobileModalOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"><Filter size={24} /></button>
          </div>
        </div>
      </nav>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white border-b border-slate-200 shadow-sm z-20 flex-none">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-end gap-6 flex-wrap">
            {/* Unit Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Unit</label>
              <select 
                value={filters.unit}
                onChange={(e) => setFilters({...filters, unit: e.target.value})}
                className="w-44 text-sm border border-slate-300 rounded-md bg-slate-50 px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">All Units</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            {/* Quick Duration Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Quick Filter</label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                {['ALL', '1', '3', '6'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      filters.period === p 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {p === 'ALL' ? 'All Time' : `${p}M`}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Custom Date Range</label>
              <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-300">
                <input type="date" value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value, period: 'CUSTOM'})} className="bg-transparent text-xs font-medium text-slate-700 outline-none" />
                <span className="text-slate-400 text-xs">to</span>
                <input type="date" value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value, period: 'CUSTOM'})} className="bg-transparent text-xs font-medium text-slate-700 outline-none" />
              </div>
            </div>

            <button 
              onClick={() => setFilters({ unit: 'ALL', fromDate: '', toDate: '', period: 'ALL' })} 
              className="text-sm text-rose-500 hover:text-rose-700 font-medium pb-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col min-h-0 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Resigned" value={stats.total} icon={<UserMinus />} color="rose" />
          <StatCard label="Avg. Tenure" value={stats.avgTenure} unit="Days" icon={<Clock />} color="blue" />
          <StatCard label="This Month" value={stats.thisMonth} icon={<Calendar />} color="emerald" />
          <StatCard label="Selected Unit" value={filters.unit} icon={<Building2 />} color="indigo" />
        </div>

        <div className="flex-1 bg-white border border-slate-300 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Employee List</h2>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                <Printer size={14} /> Print
              </button>
              <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                <FileSpreadsheet size={14} /> Export
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <table className="w-full table-auto border-collapse text-xs text-slate-700">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <TableHead label="ID" />
                    <TableHead label="Dept" />
                    <TableHead label="Photo" />
                    <TableHead label="Name" />
                    <TableHead label="Category" />
                    <TableHead label="Mobile" />
                    <TableHead label="Join Date" />
                    <TableHead label="Resign Date" />
                    <TableHead label="Days" sortable onClick={() => handleSort('days_worked')} activeSort={sortConfig.key === 'days_worked' ? sortConfig.direction : null} />
                    <TableHead label="Incharge Reason" />
                    <TableHead label="HR Reason" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sortedData.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-semibold text-indigo-600">{emp.id}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{emp.dept || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        {emp.photo ? (
                          <img src={emp.photo} alt="" className="w-10 h-10 rounded-lg object-cover mx-auto border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 mx-auto">No Image</div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">{emp.emp_name || '-'}</td>
                      <td className="px-3 py-2">{emp.category || '-'}</td>
                      <td className="px-3 py-2 font-mono">{emp.mobile || '-'}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{emp.joindt ? format(new Date(emp.joindt), 'dd/MM/yyyy') : '-'}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          {emp.resign_date ? format(new Date(emp.resign_date), 'dd/MM/yyyy') : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-center text-slate-700">{emp.days_worked}</td>
                      <td className="px-3 py-2 min-w-37.5">
                        <input 
                          type="text" 
                          className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none p-1 transition-colors" 
                          placeholder="Add reason..." 
                          value={reasons[`${emp.id}_incharge`] || ''} 
                          onChange={(e) => setReasons({...reasons, [`${emp.id}_incharge`]: e.target.value})} 
                        />
                      </td>
                      <td className="px-3 py-2 min-w-37.5">
                        <input 
                          type="text" 
                          className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none p-1 transition-colors" 
                          placeholder="Add reason..." 
                          value={reasons[`${emp.id}_hr`] || ''} 
                          onChange={(e) => setReasons({...reasons, [`${emp.id}_hr`]: e.target.value})} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// ... (StatCard and TableHead remain the same)
const StatCard = ({ label, value, icon, color, unit }) => {
  const colors = { 
    rose: "bg-rose-50 text-rose-600", 
    blue: "bg-blue-50 text-blue-600", 
    emerald: "bg-emerald-50 text-emerald-600", 
    indigo: "bg-indigo-50 text-indigo-600" 
  };
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">
          {value} {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
        </h3>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[color]}`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
    </div>
  );
};

const TableHead = ({ label, sortable, onClick, activeSort }) => (
  <th 
    onClick={sortable ? onClick : undefined} 
    className={`px-3 py-3 border border-slate-200 font-bold uppercase tracking-wide text-[10px] text-slate-500 text-left ${sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
  >
    <div className="flex items-center gap-1">
      {label}
      {sortable && (
        <span className="text-slate-400">
          {activeSort === 'asc' ? <ChevronUp size={12}/> : activeSort === 'desc' ? <ChevronDown size={12}/> : <ArrowUpDown size={12}/>}
        </span>
      )}
    </div>
  </th>
);

export default Resign;