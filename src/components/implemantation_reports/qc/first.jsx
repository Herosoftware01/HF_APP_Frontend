import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const First = () => {
  // State for raw data and filtered data
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const navigate = useNavigate();

  // Fetch data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://hfapi.herofashion.com/imp_reports/qc_first/");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setFilteredData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle Filtering Logic
  useEffect(() => {
    let result = data;

    if (startDate) {
      result = result.filter((item) => new Date(item.date) >= new Date(startDate));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.date) <= end);
    }

    if (selectedUnit) {
      result = result.filter((item) => item.unit?.toString() === selectedUnit);
    }

    if (selectedJob) {
      result = result.filter((item) => item.jobno === selectedJob);
    }

    setFilteredData(result);
  }, [data, startDate, endDate, selectedUnit, selectedJob]);

  // Clear all filters
  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedUnit("");
    setSelectedJob("");
  };

  const handleRoving = () => {
    navigate("/imp/roving");
  };

  // Derive dynamic options for dropdowns
  const uniqueUnits = [...new Set(data.map((item) => item.unit))].filter((u) => u !== null).sort();
  const uniqueJobs = [...new Set(data.map((item) => item.jobno))].filter(Boolean).sort();

  // Aggregate data for the Trend Graph (Group by Date)
  const trendData = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      if (!curr.date) return acc;
      
      const dateObj = new Date(curr.date);
      const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }); 
      
      if (!acc[dateStr]) {
        acc[dateStr] = { 
          dateLabel: dateStr, 
          timestamp: dateObj.getTime(), 
          total_pieces: 0, 
          checked_piece: 0 
        };
      }
      acc[dateStr].total_pieces += Number(curr.total_pieces) || 0;
      acc[dateStr].checked_piece += Number(curr.checked_piece) || 0;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredData]);

  // Calculate Summary KPI Stats
  const summaryStats = useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        acc.totalChecked += Number(curr.checked_piece) || 0;
        acc.totalPieces += Number(curr.total_pieces) || 0;
        return acc;
      },
      { totalChecked: 0, totalPieces: 0 }
    );
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-zinc-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-800 antialiased overflow-x-hidden">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-2.5 bg-indigo-600 rounded-full shadow-md shadow-indigo-200"></div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Quality Control Hub
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1.5 ml-3">
            Monitoring First Piece Output & Production Inspection Metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleRoving}
            className="flex justify-center items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-auto"
          >
            <span>Roving Inspection</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/imp")}
            className="flex justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all duration-200 focus:ring-2 focus:ring-slate-900/20 w-full sm:w-auto"
          >
            &larr; Back
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="group bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/60 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Filtered Batches</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 block tracking-tight">{filteredData.length}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/60 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Pieces (Jobs)</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2 block tracking-tight">{summaryStats.totalPieces.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-indigo-50/50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <div className="group bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/60 flex items-center justify-between sm:col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Audited Checked</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2 block tracking-tight">{summaryStats.totalChecked.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-8 rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/60 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Control Panel</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-end gap-4 sm:gap-5">
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col relative">
            <label className="mb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Unit Selection</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 appearance-none"
            >
              <option value="">All Production Units</option>
              {uniqueUnits.map((unit) => (
                <option key={unit} value={unit}>Unit {unit}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col relative">
            <label className="mb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">Job Number</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 appearance-none"
            >
              <option value="">All Active Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 h-[44px] w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Chart Section */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:gap-8 mb-8">
          
          {/* Trend Line Chart (Over Time) */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/60 overflow-hidden w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                Inspection Trend Over Time
              </h2>
            </div>
            <div className="h-[300px] sm:h-[350px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', padding: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" iconSize={8} />
                  <Line 
                    type="monotone" 
                    dataKey="total_pieces" 
                    name="Total Pieces" 
                    stroke="#94A3B8" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="checked_piece" 
                    name="Checked Pieces" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Data Table Wrapper (Now fixed height + fully scrollable w/ sticky header) */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200/60 overflow-hidden flex flex-col w-full">
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <h2 className="text-base font-bold text-slate-900">Detailed Inspection Logs</h2>
          <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg font-bold">Live Data Feed</span>
        </div>
        
        {/* Scrollable Area - Enables both horizontal scroll for mobile and vertical scroll for tbody */}
        <div className="w-full overflow-auto max-h-[600px] relative">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm relative">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-20 shadow-sm shadow-slate-200/50">
              <tr>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Timestamp Date</th>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Job Reference</th>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Bundle No</th>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Product Type</th>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Spec (Color/Size)</th>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Location (Unit/Line)</th>
                <th className="px-5 sm:px-6 py-4 font-bold bg-slate-50">Audited Yield Status</th>
                <th className="px-5 sm:px-6 py-4 font-bold text-right pr-5 sm:pr-8 bg-slate-50">QC Action Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex justify-center items-center flex-col">
                      <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <span className="text-slate-400 font-semibold text-sm">Syncing system logs...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center bg-rose-50/30">
                    <div className="inline-flex items-center gap-2 text-rose-600 font-bold px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
                      <span>Sync Fail: {error}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-400 font-medium">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-slate-500">No records found matching filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4 text-slate-500 font-medium">
                      {new Date(row.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {row.jobno}
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4 text-slate-600 font-mono text-xs">
                      {row.bundle_no || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4 text-slate-700 font-semibold">
                      {row.product}
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4">
                      <span className="text-slate-800 font-medium">{row.color}</span> 
                      <span className="text-slate-200 mx-2">/</span> 
                      <span className="text-slate-400 text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded">{row.size}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4 text-slate-600">
                      <span className="font-extrabold text-slate-800">U{row.unit}</span>
                      <span className="text-slate-400 font-medium text-xs ml-1">L{row.line}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{row.checked_piece}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-400 font-medium text-xs">{row.total_pieces} pcs</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 sm:px-6 py-4 text-right pr-5 sm:pr-8">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
                        row.qc_type?.toLowerCase().includes('pass') 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : row.qc_type?.toLowerCase().includes('fail') || row.qc_type?.toLowerCase().includes('reject')
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.qc_type?.toLowerCase().includes('pass') ? 'bg-emerald-500' :
                          row.qc_type?.toLowerCase().includes('fail') || row.qc_type?.toLowerCase().includes('reject') ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {row.qc_type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default First;