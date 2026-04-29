import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, Calendar, ChevronLeft, 
  Users, UserCheck, UserX, Info, X
} from 'lucide-react';
import { format, subMonths, isSunday, parseISO, addMonths } from 'date-fns';

// ChartJS Registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels
);

const API_BASE = "http://10.1.21.13:8200/reports";

const AttendanceDashboard = () => {
  const [data, setData] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal State
  const [modal, setModal] = useState({ show: false, type: '', date: '', data: [], loading: false });

  // Chart visibility state
  const [chartVisibility, setChartVisibility] = useState({
    totalChart: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false },
    presentChart: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false },
    absentChart: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false },
    combinedChart: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false }
  });

  // Chart toggle functionality
  const toggleDataset = (chartId, datasetIndex) => {
    setChartVisibility(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        [datasetIndex]: !prev[chartId][datasetIndex]
      }
    }));
  };

  // 1. Fetch Main Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/attendance/`, {
        params: { dept: unit, startDate, endDate }
      });
      setData(response.data.data);
      setHolidays(response.data.holidays);
      // Update dates if backend provided defaults
      if (!startDate) setStartDate(response.data.start_date);
      if (!endDate) setEndDate(response.data.end_date);
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [unit, startDate, endDate]);

  // 2. Compute Averages (Excluding Sundays)
  const stats = useMemo(() => {
    const filtered = data.filter(d => !isSunday(parseISO(d.date)));
    if (filtered.length === 0) return {};

    const totals = filtered.reduce((acc, curr) => ({
      total: acc.total + curr.total,
      present: acc.present + curr.present,
      absent: acc.absent + curr.absent,
      le: acc.le + curr.le,
      tlv: acc.tlv + curr.tlv,
      ntlv: acc.ntlv + curr.ntlv,
    }), { total: 0, present: 0, absent: 0, le: 0, tlv: 0, ntlv: 0 });

    const count = filtered.length;
    return {
      avgTotal: Math.round(totals.total / count),
      avgPresent: Math.round(totals.present / count),
      presentPct: ((totals.present / totals.total) * 100).toFixed(1),
      absentPct: ((totals.absent / totals.total) * 100).toFixed(1),
      avgLe: Math.round(totals.le / count),
      lePct: ((totals.le / totals.total) * 100).toFixed(1),
      avgTlv: Math.round(totals.tlv / count),
      tlvPct: ((totals.tlv / totals.total) * 100).toFixed(1),
      avgNtlv: Math.round(totals.ntlv / count),
      ntlvPct: ((totals.ntlv / totals.total) * 100).toFixed(1),
    };
  }, [data]);

  // 3. Modal Handlers
  const openDetails = async (type, date) => {
    setModal({ show: true, type, date, data: [], loading: true });
    const endpoint = type === 'Present' ? 'present_details' : 'absent_details';
    try {
      const res = await axios.get(`${API_BASE}/${endpoint}/`, {
        params: { dept: unit, date }
      });
      setModal(prev => ({ ...prev, data: res.data.data, loading: false }));
    } catch (err) {
      setModal(prev => ({ ...prev, loading: false }));
    }
  };

  // 4. Date Handlers
  const setDateRange = (months) => {
    const today = new Date();
    const start = subMonths(today, months);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  const clearFilters = () => {
    setUnit('ALL');
    setStartDate('');
    setEndDate('');
  };

  // 5. Chart Data Preparation
  const filteredData = data.filter(d => !isSunday(parseISO(d.date)));
  const labels = filteredData.map(d => format(parseISO(d.date), 'dd-MM-yyyy'));

  const totalData = filteredData.map(d => d.total);
  const presentData = filteredData.map(d => d.present);
  const absentData = filteredData.map(d => d.absent);
  const tailorOnroll = filteredData.map(d => d.tail_onr);
  const nonTailorOnroll = filteredData.map(d => d.ntail_onr);
  const tailorPresent = filteredData.map(d => d.tailor);
  const nonTailorPresent = filteredData.map(d => d.n_tailor);
  const tailorAbsent = filteredData.map(d => d.tabsent);
  const nonTailorAbsent = filteredData.map(d => d.ntabsent);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#4b5563',
        font: { weight: 'bold', size: 10 },
        rotation: -90,
        formatter: (value) => value === 0 ? '' : value,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true, borderDash: [4, 4] } },
    },
    elements: { line: { tension: 0.3 } },
  };

  // 6. Export Functions
  const exportAttendanceExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  const exportAbsentExcel = () => {
    const ws = XLSX.utils.json_to_sheet(modal.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absent_Details");
    XLSX.writeFile(wb, `Absent_Report_${unit}.xlsx`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Emp Attendance Dashboard</h1>
              <p className="text-sm text-gray-500">Overview for <span className="font-semibold text-indigo-600">{unit}</span></p>
            </div>
          </div>

          <form className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select 
              name="dept" 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full hover:bg-gray-100 transition-colors cursor-pointer font-medium"
            >
              <option value="ALL">All Units</option>
              <option value="CUTTING">Cutting</option>
              <option value="FABRIC">Fabric</option>
              <option value="UNIT-1">Unit 1</option>
              <option value="UNIT-2">Unit 2</option>
              <option value="UNIT-3">Unit 3</option>
              <option value="UNIT-4">Unit 4</option>
              <option value="Training Instutite">Unit 5 (Training)</option>
              <option value="UNIT-6">Unit 6</option>
            </select>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <input 
                type="date" 
                name="startDate" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-transparent border-none text-gray-600 text-sm focus:ring-0 py-2 pl-3"
              />
              <span className="text-gray-400 px-1">-</span>
              <input 
                type="date" 
                name="endDate" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-transparent border-none text-gray-600 text-sm focus:ring-0 py-2 pr-3"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button type="button" onClick={() => setDateRange(1)} className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-md hover:bg-white hover:shadow-sm transition-all">1M</button>
                <button type="button" onClick={() => setDateRange(6)} className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-md hover:bg-white hover:shadow-sm transition-all">6M</button>
              </div>
              <button type="button" onClick={clearFilters} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm">
                Clear
              </button>
            </div>

            <button type="button" onClick={exportAttendanceExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
              <FileSpreadsheet size={16} />
              Excel
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[450px]">
          <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-700 bg-white">Daily Attendance Log</div>
          <div className="custom-scrollbar overflow-auto flex-1 relative w-full">
            <table className="w-full text-center text-sm font-sans" id="attendanceTable">
              <thead className="bg-gray-50 sticky top-0 shadow-sm ring-1 ring-gray-100">
                <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <th rowspan="2" className="px-4 py-3 bg-gray-50 text-left sticky left-0">Date</th>
                  <th rowspan="2" className="px-4 py-3 text-gray-800 bg-gray-50">Total</th>
                  <th colspan="2" className="px-4 py-2 text-emerald-600 bg-gray-50 border-b border-gray-200">Present</th>
                  <th colspan="2" className="px-4 py-2 text-rose-600 bg-gray-50 border-b border-gray-200">Absent</th>
                  <th colspan="2" className="px-4 py-2 text-orange-600 bg-gray-50 border-b border-gray-200">Leave</th>
                  <th colspan="2" className="px-4 py-2 text-purple-600 bg-gray-50 border-b border-gray-200">Tailor</th>
                  <th colspan="2" className="px-4 py-2 text-pink-600 bg-gray-50 border-b border-gray-200">Non-Tailor</th>
                </tr>
                <tr className="text-[10px] uppercase text-gray-400 font-bold bg-gray-50">
                  <th className="py-2">Count</th><th className="py-2">%</th>
                  <th className="py-2">Count</th><th className="py-2">%</th>
                  <th className="py-2">Count</th><th className="py-2">%</th>
                  <th className="py-2">Count</th><th className="py-2">%</th>
                  <th className="py-2">Count</th><th className="py-2">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.map((row, idx) => {
                  const isSun = isSunday(parseISO(row.date));
                  const isHol = holidays[format(parseISO(row.date), 'yyyy-MM-dd')];
                  return (
                    <tr key={idx} className={`hover:bg-gray-50 transition-colors ${isSun ? 'sunday-row' : ''} ${isHol ? 'holiday-row' : ''}`}>
                      <td className="px-4 py-3 date-cell sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-100 font-medium text-gray-600 text-left" 
                          data-original-date={row.date}>
                        {format(parseISO(row.date), 'dd-MM-yyyy')}
                      </td>
                      
                      <td className="px-3 py-3 font-extrabold text-gray-800 text-base">{row.total}</td>
                      
                      <td className="px-2 py-3 text-emerald-600 font-bold text-sm cursor-pointer hover:underline" 
                          onClick={() => openDetails('Present', row.date)}>
                        {row.present}
                      </td>
                      <td className="px-2 py-3">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          {row.present_pct}%
                        </span>
                      </td>
                      
                      <td className="px-2 py-3 text-rose-600 font-bold text-sm cursor-pointer hover:underline" 
                          onClick={() => openDetails('Absent', row.date)}>
                        {row.absent}
                      </td>
                      <td className="px-2 py-3">
                        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          {row.absent_pct}%
                        </span>
                      </td>
                      
                      <td className="px-2 py-3 text-orange-600 font-bold text-sm">{row.le}</td>
                      <td className="px-2 py-3">
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          {row.le_pct}%
                        </span>
                      </td>

                      <td className="px-2 py-3 text-purple-600 font-bold text-sm">{row.tlv}</td>
                      <td className="px-2 py-3">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          {row.tlv_pct}%
                        </span>
                      </td>

                      <td className="px-2 py-3 text-pink-600 font-bold text-sm">{row.ntlv}</td>
                      <td className="px-2 py-3">
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                          {row.ntlv_pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] text-center">
                <tr className="bg-gray-100 font-bold text-xs uppercase tracking-wide border-t border-gray-200">
                  <td className="px-4 py-4 text-left text-gray-600 sticky left-0 bg-gray-100">Average</td>

                  <td id="sumTotal" className="px-3 py-3 text-gray-800 text-base">{stats.avgTotal || 0}</td>

                  <td id="sumPresent" className="px-2 py-3 text-emerald-600">{stats.avgPresent || 0}</td>
                  <td className="px-2 py-3"><span id="avgPresentPct" className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-md">{stats.presentPct || 0}%</span></td>

                  <td id="sumAbsent" className="px-2 py-3 text-rose-600 font-bold">{Math.round((stats.avgTotal || 0) - (stats.avgPresent || 0))}</td>
                  <td className="px-2 py-3"><span id="avgAbsentPct" className="bg-rose-200 text-rose-800 px-2 py-1 rounded-md">{stats.absentPct || 0}%</span></td>

                  <td id="sumLe" className="px-2 py-3 text-orange-600 font-bold">{stats.avgLe || 0}</td>
                  <td className="px-2 py-3"><span id="avgLePct" className="bg-orange-200 text-orange-800 px-2 py-1 rounded-md">{stats.lePct || 0}%</span></td>

                  <td id="sumTlv" className="px-2 py-3 text-purple-600 font-bold">{stats.avgTlv || 0}</td>
                  <td className="px-2 py-3"><span id="avgTlvPct" className="bg-purple-200 text-purple-800 px-2 py-1 rounded-md">{stats.tlvPct || 0}%</span></td>

                  <td id="sumNtlv" className="px-2 py-3 text-pink-600 font-bold">{stats.avgNtlv || 0}</td>
                  <td className="px-2 py-3"><span id="avgNtlvPct" className="bg-pink-200 text-pink-800 px-2 py-1 rounded-md">{stats.ntlvPct || 0}%</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Onroll Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-5 h-[450px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2 shrink-0">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Onroll Trends
          </h2>
          <div className="relative flex-1 w-full min-h-0">
            <Bar 
              data={{
                labels,
                datasets: [
                  { label: "Total", data: totalData, backgroundColor: '#3b82f6', borderRadius: 4, order: 2, hidden: !chartVisibility.totalChart[0] },
                  { type: 'line', label: "Total Trend", data: totalData, borderColor: "#1e40af", borderWidth: 2, pointRadius: 0, order: 1, hidden: !chartVisibility.totalChart[1] },
                  { type: 'bar', label: "Tailor", data: tailorOnroll, backgroundColor: "#9ca3af", borderRadius: 4, order: 3, hidden: !chartVisibility.totalChart[2] },
                  { type: 'line', label: "Tailor Trend", data: tailorOnroll, borderColor: "#6b7280", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.totalChart[3] },
                  { type: 'bar', label: "Non-Tailor", data: nonTailorOnroll, backgroundColor: "#a855f7", borderRadius: 4, order: 3, hidden: !chartVisibility.totalChart[4] },
                  { type: 'line', label: "Non-Tailor Trend", data: nonTailorOnroll, borderColor: "#7e22ce", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.totalChart[5] }
                ]
              }}
              options={commonOptions}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 pt-3 border-t border-gray-50 shrink-0">
            <button onClick={() => toggleDataset('totalChart', 0)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.totalChart[0] ? 'active' : ''}`} data-chart="totalChart" data-dataset="0">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>Total
            </button>
            <button onClick={() => toggleDataset('totalChart', 1)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.totalChart[1] ? 'active' : ''}`} data-chart="totalChart" data-dataset="1">
              <span className="w-2.5 h-2.5 bg-blue-700 rounded-full mr-2"></span>Trend
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => toggleDataset('totalChart', 2)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.totalChart[2] ? 'active' : ''}`} data-chart="totalChart" data-dataset="2">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2"></span>Tailor
            </button>
            <button onClick={() => toggleDataset('totalChart', 3)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.totalChart[3] ? 'active' : ''}`} data-chart="totalChart" data-dataset="3">
              <span className="w-2.5 h-2.5 bg-gray-500 rounded-full mr-2"></span>Tailor Trend
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => toggleDataset('totalChart', 4)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.totalChart[4] ? 'active' : ''}`} data-chart="totalChart" data-dataset="4">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-2"></span>Non-Tailor
            </button>
            <button onClick={() => toggleDataset('totalChart', 5)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.totalChart[5] ? 'active' : ''}`} data-chart="totalChart" data-dataset="5">
              <span className="w-2.5 h-2.5 bg-purple-400 rounded-full mr-2"></span>Non-Tailor Trend
            </button>
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Present Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-5 h-[450px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Present Stats
          </h2>
          <div className="relative flex-1 w-full min-h-0">
            <Bar 
              data={{
                labels,
                datasets: [
                  { label: "Present", data: presentData, backgroundColor: '#10b981', borderRadius: 4, order: 2, hidden: !chartVisibility.presentChart[0] },
                  { type: 'line', label: "Present Trend", data: presentData, borderColor: "#047857", borderWidth: 2, pointRadius: 0, order: 1, hidden: !chartVisibility.presentChart[1] },
                  { type: 'bar', label: "Tailor", data: tailorPresent, backgroundColor: "#9ca3af", borderRadius: 4, order: 3, hidden: !chartVisibility.presentChart[2] },
                  { type: 'line', label: "Tailor Trend", data: tailorPresent, borderColor: "#6b7280", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.presentChart[3] },
                  { type: 'bar', label: "Non-Tailor", data: nonTailorPresent, backgroundColor: "#a855f7", borderRadius: 4, order: 3, hidden: !chartVisibility.presentChart[4] },
                  { type: 'line', label: "Non-Tailor Trend", data: nonTailorPresent, borderColor: "#7e22ce", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.presentChart[5] }
                ]
              }}
              options={commonOptions}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 pt-3 border-t border-gray-50">
            <button onClick={() => toggleDataset('presentChart', 0)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.presentChart[0] ? 'active' : ''}`} data-chart="presentChart" data-dataset="0">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></span>Present
            </button>
            <button onClick={() => toggleDataset('presentChart', 1)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.presentChart[1] ? 'active' : ''}`} data-chart="presentChart" data-dataset="1">
              <span className="w-2.5 h-2.5 bg-emerald-700 rounded-full mr-2"></span>Trend
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => toggleDataset('presentChart', 2)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.presentChart[2] ? 'active' : ''}`} data-chart="presentChart" data-dataset="2">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2"></span>Tailor
            </button>
            <button onClick={() => toggleDataset('presentChart', 3)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.presentChart[3] ? 'active' : ''}`} data-chart="presentChart" data-dataset="3">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2"></span>Tailor Trend
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => toggleDataset('presentChart', 4)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.presentChart[4] ? 'active' : ''}`} data-chart="presentChart" data-dataset="4">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-2"></span>Non-Tailor
            </button>
            <button onClick={() => toggleDataset('presentChart', 5)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.presentChart[5] ? 'active' : ''}`} data-chart="presentChart" data-dataset="5">
              <span className="w-2.5 h-2.5 bg-purple-400 rounded-full mr-2"></span>Non Tailor Trend
            </button>
          </div>
        </div>

        {/* Absent Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-5 h-[450px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
            Absent Stats
          </h2>
          <div className="relative flex-1 w-full min-h-0">
            <Bar 
              data={{
                labels,
                datasets: [
                  { label: "Absent", data: absentData, backgroundColor: '#f43f5e', borderRadius: 4, order: 2, hidden: !chartVisibility.absentChart[0] },
                  { type: 'line', label: "Absent Trend", data: absentData, borderColor: "#be123c", borderWidth: 2, pointRadius: 0, order: 1, hidden: !chartVisibility.absentChart[1] },
                  { type: 'bar', label: "Tailor", data: tailorAbsent, backgroundColor: "#9ca3af", borderRadius: 4, order: 3, hidden: !chartVisibility.absentChart[2] },
                  { type: 'line', label: "Tailor Trend", data: tailorAbsent, borderColor: "#6b7280", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.absentChart[3] },
                  { type: 'bar', label: "Non-Tailor", data: nonTailorAbsent, backgroundColor: "#a855f7", borderRadius: 4, order: 3, hidden: !chartVisibility.absentChart[4] },
                  { type: 'line', label: "Non-Tailor Trend", data: nonTailorAbsent, borderColor: "#7e22ce", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.absentChart[5] }
                ]
              }}
              options={commonOptions}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2 pt-3 border-t border-gray-50">
            <button onClick={() => toggleDataset('absentChart', 0)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.absentChart[0] ? 'active' : ''}`} data-chart="absentChart" data-dataset="0">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2"></span>Absent
            </button>
            <button onClick={() => toggleDataset('absentChart', 1)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.absentChart[1] ? 'active' : ''}`} data-chart="absentChart" data-dataset="1">
              <span className="w-2.5 h-2.5 bg-rose-700 rounded-full mr-2"></span>Trend
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => toggleDataset('absentChart', 2)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.absentChart[2] ? 'active' : ''}`} data-chart="absentChart" data-dataset="2">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2"></span>Tailor
            </button>
            <button onClick={() => toggleDataset('absentChart', 3)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.absentChart[3] ? 'active' : ''}`} data-chart="absentChart" data-dataset="3">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2"></span>Tailor Trend
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => toggleDataset('absentChart', 4)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.absentChart[4] ? 'active' : ''}`} data-chart="absentChart" data-dataset="4">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-2"></span>Non-Tailor
            </button>
            <button onClick={() => toggleDataset('absentChart', 5)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.absentChart[5] ? 'active' : ''}`} data-chart="absentChart" data-dataset="5">
              <span className="w-2.5 h-2.5 bg-purple-400 rounded-full mr-2"></span>Non-Tailor Trend
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
        <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Comprehensive Analysis</h2>
        <div className="relative w-full h-[340px]">
          <Bar 
            data={{
              labels,
              datasets: [
                { label: "Total", data: totalData, backgroundColor: '#3b82f6', borderRadius: 4, hidden: !chartVisibility.combinedChart[0] },
                { type: 'line', label: "Total Trend", data: totalData, borderColor: "#1e40af", borderWidth: 2, hidden: !chartVisibility.combinedChart[1] },
                { label: "Present", data: presentData, backgroundColor: '#10b981', borderRadius: 4, hidden: !chartVisibility.combinedChart[2] },
                { type: 'line', label: "Present Trend", data: presentData, borderColor: "#047857", borderWidth: 2, hidden: !chartVisibility.combinedChart[3] },
                { label: "Absent", data: absentData, backgroundColor: '#f43f5e', borderRadius: 4, hidden: !chartVisibility.combinedChart[4] },
                { type: 'line', label: "Absent Trend", data: absentData, borderColor: "#be123c", borderWidth: 2, hidden: !chartVisibility.combinedChart[5] },
                { label: "Tailor", data: tailorPresent, backgroundColor: '#fb923c', borderRadius: 4, hidden: !chartVisibility.combinedChart[6] },
                { type: 'line', label: "Tailor Trend", data: tailorPresent, borderColor: "#ea580c", borderWidth: 2, hidden: !chartVisibility.combinedChart[7] },
                { label: "Non-Tailor", data: nonTailorPresent, backgroundColor: '#a855f7', borderRadius: 4, hidden: !chartVisibility.combinedChart[8] },
                { type: 'line', label: "Non-Tailor Trend", data: nonTailorPresent, borderColor: "#7e22ce", borderWidth: 2, hidden: !chartVisibility.combinedChart[9] }
              ]
            }}
            options={commonOptions}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => toggleDataset('combinedChart', 0)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.combinedChart[0] ? 'active' : ''}`} data-chart="combinedChart" data-dataset="0">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>Total
          </button>
          <button onClick={() => toggleDataset('combinedChart', 2)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.combinedChart[2] ? 'active' : ''}`} data-chart="combinedChart" data-dataset="2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></span>Present
          </button>
          <button onClick={() => toggleDataset('combinedChart', 4)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.combinedChart[4] ? 'active' : ''}`} data-chart="combinedChart" data-dataset="4">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2"></span>Absent
          </button>
          <button onClick={() => toggleDataset('combinedChart', 6)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.combinedChart[6] ? 'active' : ''}`} data-chart="combinedChart" data-dataset="6">
            <span className="w-2.5 h-2.5 bg-orange-400 rounded-full mr-2"></span>Tailor
          </button>
          <button onClick={() => toggleDataset('combinedChart', 8)} className={`chart-toggle-btn px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${chartVisibility.combinedChart[8] ? 'active' : ''}`} data-chart="combinedChart" data-dataset="8">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-2"></span>Non Tailor
          </button>
        </div>
      </div>

      {/* Absent Modal */}
      {modal.show && modal.type === 'Absent' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModal({ ...modal, show: false })}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-4 border-b pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-800" id="modalTitle">Absent Details</h3>
                  <button onClick={exportAbsentExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center gap-1 transition-colors">
                    Excel
                  </button>
                </div>
                <button onClick={() => setModal({ ...modal, show: false })} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="overflow-y-auto custom-scrollbar relative flex-1">
                <table className="w-full text-sm text-left border-none border-collapse">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold sticky top-0 shadow-sm ring-1 ring-gray-200">
                    <tr>
                      <th className="px-4 py-3 bg-gray-50">Photo</th>
                      <th className="px-4 py-3 bg-gray-50">Code</th>
                      <th className="px-4 py-3 bg-gray-50">Name</th>
                      <th className="px-4 py-3 bg-gray-50">Dept</th>
                      <th className="px-4 py-3 bg-gray-50">Category</th>
                      <th className="px-4 py-3 bg-gray-50">Mobile</th>
                    </tr>
                  </thead>
                  <tbody id="absentDetailsBody" className="divide-y divide-gray-100">
                    {modal.loading ? (
                      <tr><td colSpan="6" className="p-10 text-center text-gray-500">Fetching records...</td></tr>
                    ) : modal.data.length === 0 ? (
                      <tr><td colSpan="6" className="p-10 text-center font-medium text-gray-500">No records found.</td></tr>
                    ) : (
                      modal.data.map((emp, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                          <td className="px-4 py-2">
                            {emp.photo ? (
                              <img src={emp.photo} className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                {emp.name.charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-700">{emp.code}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{emp.name}</td>
                          <td className="px-4 py-3 text-gray-500">{emp.dept || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{emp.category || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{emp.mobile || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Present Modal */}
      {modal.show && modal.type === 'Present' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setModal({ ...modal, show: false })}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-4 border-b pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800" id="presentModalTitle">Present Details</h3>
                    <p className="text-xs text-gray-500" id="presentModalSubtitle">{format(parseISO(modal.date), 'dd-MM-yyyy')} | {unit}</p>
                  </div>
                </div>
                <button onClick={() => setModal({ ...modal, show: false })} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto custom-scrollbar relative flex-1">
                <table className="w-full text-sm text-left border-none border-collapse">
                  <thead className="bg-emerald-50 text-emerald-800 uppercase text-[11px] font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Photo</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Dept</th>
                      <th className="px-4 py-3">Category</th>
                    </tr>
                  </thead>
                  <tbody id="presentDetailsBody" className="divide-y divide-gray-100">
                    {modal.loading ? (
                      <tr><td colSpan="5" className="p-10 text-center text-emerald-600 animate-pulse font-medium">Fetching records...</td></tr>
                    ) : modal.data.length === 0 ? (
                      <tr><td colSpan="5" className="p-10 text-center font-medium text-gray-500">No records found.</td></tr>
                    ) : (
                      modal.data.map((emp, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2">
                            {emp.photo ? (
                              <img src={emp.photo} className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                {emp.name.charAt(0)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-700">{emp.code}</td>
                          <td className="px-4 py-3 font-semibold">{emp.name}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{emp.dept}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{emp.category}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t text-right">
                <button onClick={() => setModal({ ...modal, show: false })} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chart-toggle-btn {
          background-color: var(--gray-100);
          color: var(--gray-600);
          border: 1px solid var(--gray-200);
          transition: all 0.2s;
        }
        .chart-toggle-btn:hover {
          background-color: var(--gray-200);
        }
        .chart-toggle-btn.active {
          background-color: var(--white);
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.1);
          border-color: transparent;
          font-weight: bold;
          text-decoration: none;
          border-color: var(--blue-200);
        }
        .sunday-row, .sunday-row td {
          background-color: #fee2e2 !important;
          color: #991b1b !important;
        }
        .holiday-row, .holiday-row td {
          background-color: #fef9c3 !important;
          color: #854d0e !important;
        }
      `}</style>
    </div>
  );
};

export default AttendanceDashboard;