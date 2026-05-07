import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Building2,
  UserPlus,
  FileSpreadsheet,
  X,
  Filter,
  FolderOpen,
  Keyboard,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://hfapi.herofashion.com//reports/join_data/';

const Joining = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNavIndicator, setShowNavIndicator] = useState(false);
  const navigate = useNavigate();

  // Filters - Initialized with empty strings to match your API expected range if needed
  const [filters, setFilters] = useState({
    unit: 'ALL',
    start: '',
    end: '',
  });

  // Navigation State
  const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 });

  // 1. Fetch Data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching data with filters:', filters);
      const response = await axios.get(API_BASE_URL, {
        params: {
          unit: filters.unit,
          start: filters.start,
          end: filters.end,
        },
      });

      // Based on your JSON, data is inside response.data.rows
      if (response.data && response.data.rows) {
        setEmployees(response.data.rows);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('API Error:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 2. TRIGGER FETCH ON MOUNT AND FILTER CHANGE
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. Export to Excel
  const exportExcel = () => {
    if (employees.length === 0) return;
    const exportData = employees.map((emp, index) => ({
      No: index + 1,
      ID: emp.empcode || 'N/A',
      Name: emp.name,
      Designation: emp.designation || '-',
      Department: emp.dept,
      JoiningDate: emp.joindt ? new Date(emp.joindt).toLocaleDateString() : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Joining Report');
    XLSX.writeFile(wb, 'Joining_Report.xlsx');
  };

  // 4. Date Helpers
  const setQuickDate = (months) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - months);
    const start = startDate.toISOString().split('T')[0];
    setFilters((prev) => ({ ...prev, start, end }));
  };

  // 5. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.key.startsWith('Arrow') || employees.length === 0) return;
      e.preventDefault();

      setSelectedCell((prev) => {
        let { r, c } = prev;
        if (r === -1) return { r: 0, c: 0 };
        const maxR = employees.length - 1;
        const maxC = 6;

        if (e.key === 'ArrowDown' && r < maxR) r++;
        if (e.key === 'ArrowUp' && r > 0) r--;
        if (e.key === 'ArrowRight' && c < maxC) c++;
        if (e.key === 'ArrowLeft' && c > 0) c--;

        setShowNavIndicator(true);
        setTimeout(() => setShowNavIndicator(false), 2000);
        return { r, c };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [employees]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 flex-none px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Joining Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                New Employee Onboarding
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="lg:hidden p-2 text-slate-600"
          >
            <Filter className="w-6 h-6" />
          </button>
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Filter Bar */}
      <div className="hidden lg:block bg-white border-b border-slate-200 shadow-sm z-20 flex-none py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase">
              Unit
            </label>
            <select
              value={filters.unit}
              onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
              className="w-40 text-sm border-slate-300 rounded-md bg-slate-50 focus:ring-indigo-500 p-2"
            >
              <option value="ALL">All Units</option>
              <option value="UNIT-1">Unit-1</option>
              <option value="UNIT-2">Unit-2</option>
              <option value="UNIT-2">Unit-3</option>
              <option value="UNIT-2">Unit-4</option>
              <option value="UNIT-2">Unit-5</option>
              <option value="UNIT-2">Unit-6</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase">
              Date Range
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-300">
              <input
                type="date"
                value={filters.start}
                onChange={(e) =>
                  setFilters({ ...filters, start: e.target.value })
                }
                className="border-0 bg-transparent text-xs font-medium p-1 w-30 focus:ring-0"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={filters.end}
                onChange={(e) =>
                  setFilters({ ...filters, end: e.target.value })
                }
                className="border-0 bg-transparent text-xs font-medium p-1 w-30 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex gap-2 pb-1">
            {['1M', '3M'].map((m) => (
              <button
                key={m}
                onClick={() => setQuickDate(parseInt(m))}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-full hover:bg-indigo-50 hover:text-indigo-600"
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFilters({ unit: 'ALL', start: '', end: '' })}
            className="ml-auto text-sm text-rose-500 font-medium px-3 py-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-none">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Total Joining
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {loading ? '...' : employees.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Selected Unit
              </p>
              <h3 className="text-xl font-bold text-slate-800 truncate">
                {filters.unit}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-none">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Joining List
            </h2>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export
            </button>
          </div>

          <div className="flex-1 overflow-auto relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-slate-500 font-medium">
                  Loading records...
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse border-spacing-0">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr className="divide-x divide-slate-300">
                    {[
                      'No',
                      'ID',
                      'Photo',
                      'Name',
                      'Designation',
                      'Department',
                      'Joining Date',
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border-b border-slate-300 bg-slate-50"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {employees.map((emp, rIdx) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Column mapping based on JSON keys */}
                      {[
                        rIdx + 1,
                        emp.empcode || '-',
                        <div
                          className="flex justify-center"
                          key={`img-${emp.id}`}
                        >
                          {emp.photo ? (
                            <img
                              src={emp.photo}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {emp.name?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>,
                        emp.name || '-',
                        emp.designation || '-',
                        emp.dept || '-',
                        <span
                          className="font-bold text-slate-700"
                          key={`date-${emp.id}`}
                        >
                          {emp.joindt
                            ? new Date(emp.joindt).toLocaleDateString('en-GB')
                            : '-'}
                        </span>,
                      ].map((content, cIdx) => (
                        <td
                          key={cIdx}
                          onClick={() => setSelectedCell({ r: rIdx, c: cIdx })}
                          className={`px-4 py-2 text-sm border-x border-slate-300 transition-all ${
                            selectedCell.r === rIdx && selectedCell.c === cIdx
                              ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-600 text-indigo-900'
                              : 'text-slate-600'
                          }`}
                        >
                          {content}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && employees.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No records found</p>
                <p className="text-xs">Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Navigation Indicator Overlay */}
      <div
        className={`fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-2xl transition-all duration-300 z-50 ${showNavIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <Keyboard className="w-4 h-4" /> Keyboard Navigation Active
      </div>

      {/* Filter Modal (Mobile) */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowFilterModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Filter Records</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Unit
                </label>
                <select
                  className="w-full p-3 bg-slate-50 border rounded-xl"
                  value={filters.unit}
                  onChange={(e) =>
                    setFilters({ ...filters, unit: e.target.value })
                  }
                >
                  <option value="ALL">All Units</option>
                  <option value="UNIT-1">Unit-1</option>
                  <option value="UNIT-2">Unit-2</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.start}
                    onChange={(e) =>
                      setFilters({ ...filters, start: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.end}
                    onChange={(e) =>
                      setFilters({ ...filters, end: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Joining;
