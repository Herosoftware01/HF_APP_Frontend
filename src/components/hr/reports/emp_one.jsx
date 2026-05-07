import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { useNavigate } from 'react-router-dom';

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

const Emp_one = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0], // Default today
    dept: 'ALL',
  });
  const [displayDate, setDisplayDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Note: Added params for date and department as per your Django logic
      const response = await axios.get(
        'https://hfapi.herofashion.com//reports/emp_one/',
        {
          params: {
            date: filters.date,
            dept: filters.dept,
          },
        }
      );

      if (response.data.status === 'success') {
        setAttendanceData(response.data.data);
        setDisplayDate(response.data.filters.date_display);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handelNavi = () => {
    navigate('/hr/attendance');
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Chart Configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20 },
      },
      tooltip: { backgroundColor: '#1e293b' },
      datalabels: {
        color: (context) =>
          context.dataset.label === 'Present' ? '#059669' : '#e11d48',
        anchor: 'end',
        align: 'top',
        rotation: -90,
        offset: 5,
        font: { weight: 'bold', size: 10 },
        formatter: (value, context) => {
          const total = attendanceData[context.dataIndex].total;
          return total > 0 ? Math.round((value / total) * 100) + '%' : '';
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  const chartData = {
    labels: attendanceData.map((item) => item.unit),
    datasets: [
      {
        label: 'Onroll',
        data: attendanceData.map((item) => item.total),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        datalabels: { display: false }, // Hide percentages for total
      },
      {
        label: 'Present',
        data: attendanceData.map((item) => item.present),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Absent',
        data: attendanceData.map((item) => item.absent),
        backgroundColor: '#f43f5e',
        borderRadius: 4,
      },
    ],
  };

  // Grand Total Calculations
  const totals = attendanceData.reduce(
    (acc, curr) => {
      acc.total += curr.total;
      acc.present += curr.present;
      acc.absent += curr.absent;
      acc.le += curr.le;
      acc.tlv += curr.tlv;
      return acc;
    },
    { total: 0, present: 0, absent: 0, le: 0, tlv: 0 }
  );

  const getPct = (val) =>
    totals.total > 0 ? ((val / totals.total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen p-4 lg:p-8 space-y-6 bg-slate-50 font-sans">
      {/* Header & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Unit Wise Summary
            </h1>
            <p className="text-xs text-gray-500">
              Data for:{' '}
              <span className="font-bold text-indigo-600">{displayDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
          <select
            value={filters.dept}
            onChange={(e) => setFilters({ ...filters, dept: e.target.value })}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
          >
            <option value="ALL">All Units</option>
            <option value="UNIT-1">Unit 1</option>
            <option value="UNIT-2">Unit 2</option>
            <option value="UNIT-3">Unit 3</option>
            <option value="UNIT-4">Unit 4</option>
            <option value="UNIT-5">Unit 5 (Training)</option>
            <option value="UNIT-6">Unit 6</option>
          </select>
          <button
            onClick={handelNavi}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Table Section */}
        <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[550px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Department Metrics</h2>
          </div>

          <div className="overflow-auto flex-1 custom-scroll">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="text-[10px] uppercase text-gray-600 font-bold bg-gray-50">
                  <th rowSpan="2" className="px-4 py-3 border border-gray-200">
                    Unit Name
                  </th>
                  <th
                    rowSpan="2"
                    className="px-2 py-3 border border-gray-200 text-blue-700"
                  >
                    Onroll
                  </th>
                  <th
                    colSpan="2"
                    className="py-1 border border-gray-200 text-emerald-600"
                  >
                    Present
                  </th>
                  <th
                    colSpan="2"
                    className="py-1 border border-gray-200 text-rose-600"
                  >
                    Absent
                  </th>
                  <th
                    colSpan="2"
                    className="py-1 border border-gray-200 text-orange-600"
                  >
                    Leave
                  </th>
                </tr>
                <tr className="text-[9px] uppercase text-gray-500 font-bold bg-gray-50">
                  <th className="py-2 border border-gray-200">Count</th>
                  <th className="py-2 border border-gray-200">%</th>
                  <th className="py-2 border border-gray-200">Count</th>
                  <th className="py-2 border border-gray-200">%</th>
                  <th className="py-2 border border-gray-200">Count</th>
                  <th className="py-2 border border-gray-200">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-gray-700 text-left border border-gray-200">
                      {row.unit}
                    </td>
                    <td className="px-2 py-2.5 font-bold text-blue-700 border border-gray-200">
                      {row.total}
                    </td>
                    <td className="px-2 py-2.5 text-emerald-600 border border-gray-200">
                      {row.present}
                    </td>
                    <td className="px-2 py-2.5 font-bold text-emerald-700 bg-emerald-50/30 border border-gray-200">
                      {row.present_pct}%
                    </td>
                    <td className="px-2 py-2.5 text-rose-500 border border-gray-200">
                      {row.absent}
                    </td>
                    <td className="px-2 py-2.5 font-bold text-rose-700 bg-rose-50/30 border border-gray-200">
                      {row.absent_pct}%
                    </td>
                    <td className="px-2 py-2.5 text-orange-500 border border-gray-200">
                      {row.le}
                    </td>
                    <td className="px-2 py-2.5 font-bold text-orange-700 bg-orange-50/30 border border-gray-200">
                      {row.le_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-gray-100 font-bold border-t-2 border-gray-300">
                <tr>
                  <td className="px-4 py-3 text-left border border-gray-200">
                    GRAND TOTAL
                  </td>
                  <td className="text-blue-700 border border-gray-200">
                    {totals.total}
                  </td>
                  <td className="text-emerald-600 border border-gray-200">
                    {totals.present}
                  </td>
                  <td className="bg-emerald-50 border border-gray-200">
                    {getPct(totals.present)}%
                  </td>
                  <td className="text-rose-500 border border-gray-200">
                    {totals.absent}
                  </td>
                  <td className="bg-rose-50 border border-gray-200">
                    {getPct(totals.absent)}%
                  </td>
                  <td className="text-orange-500 border border-gray-200">
                    {totals.le}
                  </td>
                  <td className="bg-orange-50 border border-gray-200">
                    {getPct(totals.le)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-[550px] flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">
            Unit Breakdown
          </h2>
          <div className="relative flex-1 w-full min-h-0">
            {!loading && <Bar options={chartOptions} data={chartData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emp_one;
