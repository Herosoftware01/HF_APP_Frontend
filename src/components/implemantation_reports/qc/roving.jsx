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

const Roving = () => {
  // State for raw data and filtered data
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const navigate = useNavigate();

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  // Fetch data from the API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("https://hfapi.herofashion.com/imp_reports/qc_roving/");
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

  const handleNavigate = () => {
    navigate(-1);
  };

  // Derive dynamic options for dropdowns
  const uniqueUnits = [...new Set(data.map((item) => item.unit))].filter((u) => u !== null).sort();
  const uniqueJobs = [...new Set(data.map((item) => item.jobno))].filter(Boolean).sort();

  // Aggregate data for the Trend Chart (Group by Date)
  const chartData = useMemo(() => {
    const grouped = filteredData.reduce((acc, curr) => {
      const dateObj = new Date(curr.date);
      const dateStr = isNaN(dateObj) ? "Unknown Date" : dateObj.toLocaleDateString();

      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, rawDate: dateObj, total_pieces: 0, checked_piece: 0 };
      }
      acc[dateStr].total_pieces += Number(curr.total_pieces) || 0;
      acc[dateStr].checked_piece += Number(curr.checked_piece) || 0;
      return acc;
    }, {});
    
    // Sort chronologically by date
    return Object.values(grouped).sort((a, b) => a.rawDate - b.rawDate);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header and Back Button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Production Quality Trend
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor inspection outputs and quality metrics over time.</p>
        </div>
        <button
          onClick={handleNavigate}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          &larr; Back to Home
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Filter Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-semibold text-slate-600">START DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-semibold text-slate-600">END DATE</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-semibold text-slate-600">UNIT</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">All Units</option>
              {uniqueUnits.map((unit) => (
                <option key={unit} value={unit}>
                  Unit {unit}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-semibold text-slate-600">JOB NO</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="">All Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleClearFilters}
            className="rounded-lg bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 hover:border-slate-300 transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Analytics Trend Graph Section */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Inspection Volume Trend</h2>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
              Daily Aggregation
            </span>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#CBD5E1' }}
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                
                <Line 
                  type="monotone" 
                  dataKey="total_pieces" 
                  name="Total Pieces" 
                  stroke="#94A3B8" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#94A3B8', strokeWidth: 2, stroke: '#FFF' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="checked_piece" 
                  name="Checked Pieces" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFF' }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4338CA' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">Detailed Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-white text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Job No</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Bundle</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Color / Size</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Unit / Line</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Checked / Total</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">QC Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600 mb-3"></div>
                      Loading dashboard data...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-rose-500 bg-rose-50 font-medium">
                    Error loading data: {error}
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No records match your current filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 font-medium">
                      {new Date(row.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-indigo-600">
                      {row.jobno}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {row.bundle_no}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {row.product}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      <span className="font-medium text-slate-800">{row.color}</span> 
                      <span className="text-slate-300 mx-2">|</span> 
                      {row.size}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      <span className="font-bold text-slate-800">{row.unit}</span> / {row.line}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-bold text-slate-900">{row.checked_piece}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-slate-500">{row.total_pieces}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
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

export default Roving;