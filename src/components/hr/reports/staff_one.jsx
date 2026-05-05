import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  XCircle, 
  ChevronLeft, 
  ChevronDown 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Staff_one = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    dept: 'ALL'
  });

  // Fetch Data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Construction of URL with query params
      const response = await axios.get(`http://10.1.21.13:8200/reports/staff_one/`, {
        params: {
          date: filters.date,
          dept: filters.dept
        }
      });
      
      if (response.data.status === "success") {
        setData(response.data.data);
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Calculate Totals for Footer
  const totals = useMemo(() => {
    return data.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      present: acc.present + curr.present,
      absent: acc.absent + curr.absent,
    }), { total: 0, present: 0, absent: 0 });
  }, [data]);

  const totalPresentPct = totals.total > 0 ? ((totals.present / totals.total) * 100).toFixed(2) : "0.00";
  const totalAbsentPct = totals.total > 0 ? ((totals.absent / totals.total) * 100).toFixed(2) : "0.00";

  const handelNavi = () => {
    navigate(-1);
  }
  // Chart Configuration
  const chartData = {
    labels: data.map(item => item.unit),
    datasets: [
      {
        label: 'Onroll',
        data: data.map(item => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Present',
        data: data.map(item => item.present),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Absent',
        data: data.map(item => item.absent),
        backgroundColor: 'rgba(244, 63, 94, 0.6)',
        borderColor: '#be123c',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter' } } },
      datalabels: {
        anchor: 'end',
        align: 'top',
        display: (context) => context.dataset.label === 'Onroll',
        font: { weight: 'bold', size: 10 }
      }
    },
    scales: {
      y: { grid: { borderDash: [4, 4], color: '#f1f5f9' }, beginAtZero: true }
    }
  };

  const clearFilters = () => {
    setFilters({
      date: new Date().toISOString().split('T')[0],
      dept: 'ALL'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 font-sans">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Staff Attendance</h1>
              <p className="text-xs text-gray-500 font-medium">
                Live Data for: <span className="text-indigo-600 font-bold">{filters.date}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <input 
              type="date" 
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="px-3 py-2 bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            
            <div className="relative">
              <select 
                value={filters.dept}
                onChange={(e) => setFilters({...filters, dept: e.target.value})}
                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 text-sm rounded-lg appearance-none min-w-[140px] outline-none"
              >
                <option value="ALL">All Depts</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400" size={16} />
            </div>

            <button 
              onClick={clearFilters}
              className="px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <XCircle size={16} /> Clear
            </button>
            <button onClick={( ) => navigate(-1) } className="px-4 py-2 text-gray-600 cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <ChevronLeft size={16} />
                Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[550px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Attendance Log</h2>
            <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded">{filters.dept}</span>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-center border-separate border-spacing-0">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left border-b font-semibold">Dept</th>
                  <th className="px-4 py-3 border-b font-semibold">Onroll</th>
                  <th className="px-4 py-3 border-b font-semibold text-emerald-600">Present</th>
                  <th className="px-4 py-3 border-b font-semibold text-emerald-600">%</th>
                  <th className="px-4 py-3 border-b font-semibold text-rose-600">Absent</th>
                  <th className="px-4 py-3 border-b font-semibold text-rose-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="6" className="p-10 text-gray-400 animate-pulse">Loading data...</td></tr>
                ) : data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-left font-medium text-gray-700">{row.unit}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">{row.total}</td>
                    <td className="px-4 py-3 text-emerald-600">{row.present}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-bold">{row.present_pct}%</span>
                    </td>
                    <td className="px-4 py-3 text-rose-600">{row.absent}</td>
                    <td className="px-4 py-3">
                      <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-xs font-bold">{row.absent_pct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="bg-gray-100 border-t border-gray-200 grid grid-cols-6 text-center font-bold text-gray-800 p-3">
            <div className="text-left px-1">TOTAL</div>
            <div className="text-blue-700">{totals.total}</div>
            <div className="text-emerald-700">{totals.present}</div>
            <div className="text-emerald-700">{totalPresentPct}%</div>
            <div className="text-rose-700">{totals.absent}</div>
            <div className="text-rose-700">{totalAbsentPct}%</div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[550px] flex flex-col">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-6 text-center">Visual Distribution</h2>
          <div className="flex-1 relative">
            {!loading && data.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No data to visualize</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff_one;