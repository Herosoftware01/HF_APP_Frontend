import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FileSpreadsheet,
  Users,
  X,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronLeft
} from 'lucide-react';
import { format, subMonths, isSunday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const API_BASE = "https://hfapi.herofashion.com/reports";

/* ─── Design Tokens ─────────────────────────────────────── */
const TOKEN = {
  present: { bg: '#00c896', muted: '#e6faf5', text: '#007a5a', badge: '#b3f0e0' },
  absent:  { bg: '#ff4d6d', muted: '#fff0f3', text: '#a3002a', badge: '#ffc2cc' },
  total:   { bg: '#3a86ff', muted: '#eef4ff', text: '#1a4db5', badge: '#c2d9ff' },
  leave:   { bg: '#ff9f1c', muted: '#fff7eb', text: '#9a5c00', badge: '#ffe0a3' },
  tailor:  { bg: '#8b5cf6', muted: '#f3f0ff', text: '#5b21b6', badge: '#ddd6fe' },
  ntailor: { bg: '#ec4899', muted: '#fdf0f7', text: '#9d174d', badge: '#fecde8' },
};

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ label, value, pct, color, icon: Icon, trend }) => (
  <div style={{ borderTop: `3px solid ${color.bg}` }}
    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: color.text }}>{label}</span>
      <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color.muted }}>
        <Icon size={16} style={{ color: color.bg }} />
      </span>
    </div>
    <div className="text-3xl font-black text-gray-900 tabular-nums">{value ?? '—'}</div>
    {pct !== undefined && (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color.badge, color: color.text }}>
          {pct}%
        </span>
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(trend)}%
          </span>
        )}
      </div>
    )}
  </div>
);

/* ─── Toggle Legend Button ───────────────────────────────── */
const LegendBtn = ({ active, color, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
    style={{
      background: active ? color + '18' : '#f9fafb',
      borderColor: active ? color : '#e5e7eb',
      color: active ? color : '#6b7280',
      boxShadow: active ? `0 0 0 2px ${color}28` : 'none',
    }}
  >
    <span className="w-2 h-2 rounded-full" style={{ background: active ? color : '#d1d5db' }} />
    {label}
  </button>
);

/* ─── Chart Card ─────────────────────────────────────────── */
const ChartCard = ({ title, accent, datasets, labels, commonOptions, toggles, visibility, chartId, toggleDataset }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-6 h-110">
    <div className="flex items-center gap-3 mb-4 shrink-0">
      <span className="w-1 h-6 rounded-full" style={{ background: accent }} />
      <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{title}</h2>
    </div>
    <div className="relative flex-1 min-h-0">
      <Bar data={{ labels, datasets }} options={commonOptions} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-50 shrink-0">
      {toggles.map(({ idx, color, label }) => (
        <LegendBtn
          key={idx}
          active={visibility[idx]}
          color={color}
          label={label}
          onClick={() => toggleDataset(chartId, idx)}
        />
      ))}
    </div>
  </div>
);

/* ─── Main Dashboard ─────────────────────────────────────── */
const AttendanceDashboard = () => {
  const [data, setData] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const navigate = useNavigate();
  const [endDate, setEndDate] = useState('');
  
  // Modal & Sorting State
  const [modal, setModal] = useState({ show: false, type: '', date: '', data: [], loading: false });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [chartVisibility, setChartVisibility] = useState({
    totalChart:    { 0: true,  1: false, 2: false, 3: false, 4: false, 5: false },
    presentChart:  { 0: true,  1: false, 2: false, 3: false, 4: false, 5: false },
    absentChart:   { 0: true,  1: false, 2: false, 3: false, 4: false, 5: false },
    combinedChart: { 0: true,  1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false }
  });

  const toggleDataset = (chartId, idx) =>
    setChartVisibility(p => ({ ...p, [chartId]: { ...p[chartId], [idx]: !p[chartId][idx] } }));

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/attendance/`, { params: { dept: unit, startDate, endDate } });
      setData(res.data.data);
      setHolidays(res.data.holidays);
      if (!startDate) setStartDate(res.data.start_date);
      if (!endDate)   setEndDate(res.data.end_date);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [unit, startDate, endDate]);

  const handelNavi = () => navigate(-1);
  const handelone = () => navigate("/hr/emp_one");

  const stats = useMemo(() => {
    const filtered = data.filter(d => !isSunday(parseISO(d.date)));
    if (!filtered.length) return {};
    const t = filtered.reduce((a, c) => ({
      total: a.total + c.total, present: a.present + c.present,
      absent: a.absent + c.absent, le: a.le + c.le,
      tlv: a.tlv + c.tlv, ntlv: a.ntlv + c.ntlv,
    }), { total: 0, present: 0, absent: 0, le: 0, tlv: 0, ntlv: 0 });
    const n = filtered.length;
    return {
      avgTotal:   Math.round(t.total / n),
      avgPresent: Math.round(t.present / n),
      presentPct: ((t.present / t.total) * 100).toFixed(1),
      absentPct:  ((t.absent  / t.total) * 100).toFixed(1),
      avgLe:      Math.round(t.le / n),
      lePct:      ((t.le  / t.total) * 100).toFixed(1),
      avgTlv:     Math.round(t.tlv / n),
      tlvPct:     ((t.tlv / t.total) * 100).toFixed(1),
      avgNtlv:    Math.round(t.ntlv / n),
      ntlvPct:    ((t.ntlv / t.total) * 100).toFixed(1),
    };
  }, [data]);

  const openDetails = async (type, date) => {
    setModal({ show: true, type, date, data: [], loading: true });
    setSortConfig({ key: null, direction: 'ascending' }); // Reset sort on open
    const ep = type === 'Present' ? 'present_details' : 'absent_details';
    try {
      const res = await axios.get(`${API_BASE}/${ep}/`, { params: { dept: unit, date } });
      setModal(p => ({ ...p, data: res.data.data, loading: false }));
    } catch { setModal(p => ({ ...p, loading: false })); }
  };

  const setRange = (m) => {
    const today = new Date();
    setStartDate(format(subMonths(today, m), 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  // ── Sorting Logic for Modals ──
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedModalData = useMemo(() => {
    if (!modal.data) return [];
    let sortableItems = [...modal.data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
        const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [modal.data, sortConfig]);

  // ── Chart Data Extracts ──
  const fd = data.filter(d => !isSunday(parseISO(d.date)));
  const labels       = fd.map(d => format(parseISO(d.date), 'dd MMM'));
  const totalData    = fd.map(d => d.total);
  const presentData  = fd.map(d => d.present);
  const absentData   = fd.map(d => d.absent);
  const tailorOnr    = fd.map(d => d.tail_onr);
  const ntailorOnr   = fd.map(d => d.ntail_onr);
  const tailorPres   = fd.map(d => d.tailor);
  const ntailorPres  = fd.map(d => d.n_tailor);
  const tailorAbs    = fd.map(d => d.tabsent);
  const ntailorAbs   = fd.map(d => d.ntabsent);

  const commonOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end', align: 'top',
        color: '#9ca3af', font: { weight: '700', size: 9 },
        rotation: -90,
        formatter: v => v === 0 ? '' : v,
      },
      tooltip: {
        backgroundColor: '#1e293b', titleColor: '#94a3b8', bodyColor: '#f1f5f9', cornerRadius: 8, padding: 10,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } }, border: { display: false } },
      y: { grid: { color: '#f1f5f9', borderDash: [4, 4] }, ticks: { color: '#9ca3af', font: { size: 10 } }, border: { display: false } },
    },
    elements: { line: { tension: 0.4 }, bar: { borderRadius: 5 } },
    animation: { duration: 600, easing: 'easeOutQuart' },
  };

  // ── Excel Exports ──
  const exportAttendanceExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "Attendance_Report.xlsx");
  };

  const exportAbsentExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedModalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absent_Details");
    XLSX.writeFile(wb, `Absent_Report_${unit}.xlsx`);
  };

  const exportPresentExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedModalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Present_Details");
    XLSX.writeFile(wb, `Present_Report_${unit}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] p-4 lg:p-8 space-y-6 font-sans">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
        <div className="flex flex-col xl:flex-row justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                Attendance Dashboard
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Hero Fashion · <span className="text-indigo-500 font-bold">{unit}</span>
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={unit} onChange={e => setUnit(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 font-semibold cursor-pointer transition-all"
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
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <Calendar size={14} className="text-gray-400 mr-1" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none text-gray-600 text-sm focus:ring-0 p-0 w-32.5" />
              <span className="text-gray-300 mx-1">–</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-transparent border-none text-gray-600 text-sm focus:ring-0 p-0 w-32.5" />
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-0.5">
              {[1, 3, 6].map(m => (
                <button key={m} onClick={() => setRange(m)}
                  className="px-3 py-1.5 text-xs font-bold text-gray-500 rounded-lg hover:bg-white hover:text-gray-800 hover:shadow-sm transition-all">
                  {m}M
                </button>
              ))}
            </div>

            <button onClick={() => { setUnit('ALL'); setStartDate(''); setEndDate(''); }}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 px-3 py-2 rounded-xl text-sm font-semibold transition-all">
              <RefreshCw size={13} /> Reset
            </button>

            <button onClick={exportAttendanceExcel}
              className="flex items-center gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
              <Download size={14} /> Export
            </button>
            <button onClick={handelNavi}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={handelone} className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all'>
              One Day
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Avg Headcount" value={stats.avgTotal}     color={TOKEN.total}   icon={Users}        />
        <StatCard label="Avg Present"   value={stats.avgPresent}   pct={stats.presentPct} color={TOKEN.present} icon={TrendingUp}   />
        <StatCard label="Avg Absent"    value={Math.round((stats.avgTotal||0)-(stats.avgPresent||0))} pct={stats.absentPct} color={TOKEN.absent}  icon={TrendingDown} />
        <StatCard label="Avg Leave"     value={stats.avgLe}        pct={stats.lePct}      color={TOKEN.leave}  icon={Calendar}    />
        <StatCard label="Avg Tailor"    value={stats.avgTlv}       pct={stats.tlvPct}     color={TOKEN.tailor}  icon={Users}       />
        <StatCard label="Avg Non-Tailor" value={stats.avgNtlv}     pct={stats.ntlvPct}    color={TOKEN.ntailor} icon={Users}       />
      </div>

      {/* ── Table + Onroll Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-115">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-blue-500" />
            <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Daily Log</span>
          </div>
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-center text-xs" id="attendanceTable">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-50">Date</th>
                  <th className="px-3 py-3 text-gray-600">Total</th>
                  <th colSpan="2" className="py-2 text-emerald-500 border-b border-gray-100">Present</th>
                  <th colSpan="2" className="py-2 text-rose-400 border-b border-gray-100">Absent</th>
                  <th colSpan="2" className="py-2 text-amber-500 border-b border-gray-100">Leave</th>
                  <th colSpan="2" className="py-2 text-violet-500 border-b border-gray-100">Tailor</th>
                  <th colSpan="2" className="py-2 text-pink-400 border-b border-gray-100">Non-T</th>
                </tr>
                <tr className="bg-gray-50 text-gray-300 uppercase font-bold text-[9px] border-b border-gray-100">
                  <th className="sticky left-0 bg-gray-50" />
                  <th />
                  <th className="py-1.5">Cnt</th><th>%</th>
                  <th>Cnt</th><th>%</th>
                  <th>Cnt</th><th>%</th>
                  <th>Cnt</th><th>%</th>
                  <th>Cnt</th><th>%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {data.map((row, i) => {
                  const isSun = isSunday(parseISO(row.date));
                  const isHol = holidays[format(parseISO(row.date), 'yyyy-MM-dd')];
                  return (
                    <tr key={i} className={`transition-colors hover:bg-blue-50/40 ${isSun ? 'bg-rose-50 text-rose-800' : ''} ${isHol ? 'bg-amber-50 text-amber-800' : ''}`}>
                      <td className="px-4 py-2.5 sticky left-0 bg-inherit text-left font-semibold text-gray-500 border-r border-gray-100 whitespace-nowrap">
                        {format(parseISO(row.date), 'dd MMM yy')}
                        {isSun && <span className="ml-1.5 text-[9px] font-black text-rose-400 bg-rose-100 px-1 py-0.5 rounded">SUN</span>}
                        {isHol && <span className="ml-1.5 text-[9px] font-black text-amber-600 bg-amber-100 px-1 py-0.5 rounded">HOL</span>}
                      </td>
                      <td className="px-3 py-2.5 font-black text-gray-800 text-sm">{row.total}</td>
                      <td className="py-2.5 font-bold text-emerald-600 cursor-pointer hover:underline" onClick={() => openDetails('Present', row.date)}>{row.present}</td>
                      <td className="py-2.5"><span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold">{row.present_pct}%</span></td>
                      <td className="py-2.5 font-bold text-rose-500 cursor-pointer hover:underline" onClick={() => openDetails('Absent', row.date)}>{row.absent}</td>
                      <td className="py-2.5"><span className="bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md font-bold">{row.absent_pct}%</span></td>
                      <td className="py-2.5 font-bold text-amber-500">{row.le}</td>
                      <td className="py-2.5"><span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-bold">{row.le_pct}%</span></td>
                      <td className="py-2.5 font-bold text-violet-500">{row.tlv}</td>
                      <td className="py-2.5"><span className="bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-md font-bold">{row.tlv_pct}%</span></td>
                      <td className="py-2.5 font-bold text-pink-400">{row.ntlv}</td>
                      <td className="py-2.5"><span className="bg-pink-50 text-pink-500 px-1.5 py-0.5 rounded-md font-bold">{row.ntlv_pct}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0">
                <tr className="bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wide">
                  <td className="px-4 py-3 text-left sticky left-0 bg-gray-800 text-gray-300">Average</td>
                  <td className="px-3 py-3 text-blue-300 text-sm">{stats.avgTotal || 0}</td>
                  <td className="py-3 text-emerald-400">{stats.avgPresent || 0}</td>
                  <td className="py-3"><span className="bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded-md">{stats.presentPct || 0}%</span></td>
                  <td className="py-3 text-rose-400">{Math.round((stats.avgTotal||0)-(stats.avgPresent||0))}</td>
                  <td className="py-3"><span className="bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded-md">{stats.absentPct || 0}%</span></td>
                  <td className="py-3 text-amber-400">{stats.avgLe || 0}</td>
                  <td className="py-3"><span className="bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded-md">{stats.lePct || 0}%</span></td>
                  <td className="py-3 text-violet-400">{stats.avgTlv || 0}</td>
                  <td className="py-3"><span className="bg-violet-900/60 text-violet-300 px-1.5 py-0.5 rounded-md">{stats.tlvPct || 0}%</span></td>
                  <td className="py-3 text-pink-400">{stats.avgNtlv || 0}</td>
                  <td className="py-3"><span className="bg-pink-900/60 text-pink-300 px-1.5 py-0.5 rounded-md">{stats.ntlvPct || 0}%</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Onroll Chart */}
        <ChartCard
          title="Onroll Trends" accent="#3a86ff"
          labels={labels} commonOptions={commonOptions}
          chartId="totalChart" visibility={chartVisibility.totalChart} toggleDataset={toggleDataset}
          datasets={[
            { label: "Total",          data: totalData,   backgroundColor: '#3a86ff', order: 2, hidden: !chartVisibility.totalChart[0] },
            { type: 'line', label: "Total Trend",    data: totalData,   borderColor: "#1a4db5", borderWidth: 2, pointRadius: 0, order: 1, hidden: !chartVisibility.totalChart[1] },
            { label: "Tailor",         data: tailorOnr,   backgroundColor: '#9ca3af', order: 2, hidden: !chartVisibility.totalChart[2] },
            { type: 'line', label: "Tailor Trend",   data: tailorOnr,   borderColor: "#6b7280", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.totalChart[3] },
            { label: "Non-Tailor",     data: ntailorOnr,  backgroundColor: '#8b5cf6', order: 2, hidden: !chartVisibility.totalChart[4] },
            { type: 'line', label: "N-Tailor Trend", data: ntailorOnr,  borderColor: "#5b21b6", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.totalChart[5] },
          ]}
          toggles={[
            { idx: 0, color: '#3a86ff', label: 'Total' },
            { idx: 1, color: '#1a4db5', label: 'Trend' },
            { idx: 2, color: '#9ca3af', label: 'Tailor' },
            { idx: 3, color: '#6b7280', label: 'Tailor Trend' },
            { idx: 4, color: '#8b5cf6', label: 'Non-Tailor' },
            { idx: 5, color: '#5b21b6', label: 'N-Tailor Trend' },
          ]}
        />
      </div>

      {/* ── Present + Absent Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Present Stats" accent="#00c896"
          labels={labels} commonOptions={commonOptions}
          chartId="presentChart" visibility={chartVisibility.presentChart} toggleDataset={toggleDataset}
          datasets={[
            { label: "Present",        data: presentData, backgroundColor: '#00c896', order: 2, hidden: !chartVisibility.presentChart[0] },
            { type:'line', label: "Present Trend",  data: presentData, borderColor: "#007a5a", borderWidth: 2, pointRadius: 0, order: 1, hidden: !chartVisibility.presentChart[1] },
            { label: "Tailor",         data: tailorPres,  backgroundColor: '#9ca3af', order: 2, hidden: !chartVisibility.presentChart[2] },
            { type:'line', label: "Tailor Trend",   data: tailorPres,  borderColor: "#6b7280", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.presentChart[3] },
            { label: "Non-Tailor",     data: ntailorPres, backgroundColor: '#8b5cf6', order: 2, hidden: !chartVisibility.presentChart[4] },
            { type:'line', label: "N-Tailor Trend", data: ntailorPres, borderColor: "#5b21b6", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.presentChart[5] },
          ]}
          toggles={[
            { idx: 0, color: '#00c896', label: 'Present' },
            { idx: 1, color: '#007a5a', label: 'Trend' },
            { idx: 2, color: '#9ca3af', label: 'Tailor' },
            { idx: 3, color: '#6b7280', label: 'Tailor Trend' },
            { idx: 4, color: '#8b5cf6', label: 'Non-Tailor' },
            { idx: 5, color: '#5b21b6', label: 'N-Tailor Trend' },
          ]}
        />
        <ChartCard
          title="Absent Stats" accent="#ff4d6d"
          labels={labels} commonOptions={commonOptions}
          chartId="absentChart" visibility={chartVisibility.absentChart} toggleDataset={toggleDataset}
          datasets={[
            { label: "Absent",         data: absentData,  backgroundColor: '#ff4d6d', order: 2, hidden: !chartVisibility.absentChart[0] },
            { type:'line', label: "Absent Trend",   data: absentData,  borderColor: "#a3002a", borderWidth: 2, pointRadius: 0, order: 1, hidden: !chartVisibility.absentChart[1] },
            { label: "Tailor",         data: tailorAbs,   backgroundColor: '#9ca3af', order: 2, hidden: !chartVisibility.absentChart[2] },
            { type:'line', label: "Tailor Trend",   data: tailorAbs,   borderColor: "#6b7280", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.absentChart[3] },
            { label: "Non-Tailor",     data: ntailorAbs,  backgroundColor: '#8b5cf6', order: 2, hidden: !chartVisibility.absentChart[4] },
            { type:'line', label: "N-Tailor Trend", data: ntailorAbs,  borderColor: "#5b21b6", borderWidth: 2, pointRadius: 2, order: 1, hidden: !chartVisibility.absentChart[5] },
          ]}
          toggles={[
            { idx: 0, color: '#ff4d6d', label: 'Absent' },
            { idx: 1, color: '#a3002a', label: 'Trend' },
            { idx: 2, color: '#9ca3af', label: 'Tailor' },
            { idx: 3, color: '#6b7280', label: 'Tailor Trend' },
            { idx: 4, color: '#8b5cf6', label: 'Non-Tailor' },
            { idx: 5, color: '#5b21b6', label: 'N-Tailor Trend' },
          ]}
        />
      </div>

      {/* ── Comprehensive Analysis ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="w-1 h-5 rounded-full bg-indigo-500" />
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Comprehensive Analysis</h2>
        </div>
        <div className="relative w-full h-85">
          <Bar
            data={{
              labels,
              datasets: [
                { label: "Total",         data: totalData,   backgroundColor: '#3a86ff', hidden: !chartVisibility.combinedChart[0] },
                { type:'line', label: "Total Trend",    data: totalData,   borderColor: "#1a4db5", borderWidth: 2, pointRadius: 0, hidden: !chartVisibility.combinedChart[1] },
                { label: "Present",       data: presentData, backgroundColor: '#00c896', hidden: !chartVisibility.combinedChart[2] },
                { type:'line', label: "Present Trend",  data: presentData, borderColor: "#007a5a", borderWidth: 2, pointRadius: 0, hidden: !chartVisibility.combinedChart[3] },
                { label: "Absent",        data: absentData,  backgroundColor: '#ff4d6d', hidden: !chartVisibility.combinedChart[4] },
                { type:'line', label: "Absent Trend",   data: absentData,  borderColor: "#a3002a", borderWidth: 2, pointRadius: 0, hidden: !chartVisibility.combinedChart[5] },
                { label: "Tailor",        data: tailorPres,  backgroundColor: '#ff9f1c', hidden: !chartVisibility.combinedChart[6] },
                { type:'line', label: "Tailor Trend",   data: tailorPres,  borderColor: "#9a5c00", borderWidth: 2, pointRadius: 0, hidden: !chartVisibility.combinedChart[7] },
                { label: "Non-Tailor",    data: ntailorPres, backgroundColor: '#8b5cf6', hidden: !chartVisibility.combinedChart[8] },
                { type:'line', label: "N-Tailor Trend", data: ntailorPres, borderColor: "#5b21b6", borderWidth: 2, pointRadius: 0, hidden: !chartVisibility.combinedChart[9] },
              ]
            }}
            options={commonOptions}
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 pt-4 border-t border-gray-50">
          {[
            { idx: 0, color: '#3a86ff', label: 'Total' },
            { idx: 2, color: '#00c896', label: 'Present' },
            { idx: 4, color: '#ff4d6d', label: 'Absent' },
            { idx: 6, color: '#ff9f1c', label: 'Tailor' },
            { idx: 8, color: '#8b5cf6', label: 'Non-Tailor' },
          ].map(({ idx, color, label }) => (
            <LegendBtn
              key={idx}
              active={chartVisibility.combinedChart[idx]}
              color={color}
              label={label}
              onClick={() => toggleDataset('combinedChart', idx)}
            />
          ))}
        </div>
      </div>

      {/* ── Absent Modal ── */}
      {modal.show && modal.type === 'Absent' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setModal({ ...modal, show: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-rose-500" />
                <div>
                  <h3 className="font-black text-gray-800">Absent Details</h3>
                  <p className="text-xs text-gray-400">{modal.date && format(parseISO(modal.date), 'dd MMM yyyy')} · {unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportAbsentExcel}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors">
                  <Download size={12} /> Excel
                </button>
                <button onClick={() => setModal({ ...modal, show: false })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-400 hover:text-gray-700">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="px-5 py-3 bg-gray-50">Photo</th>
                    <th className="px-4 py-3 bg-gray-50">Code</th>
                    <th className="px-4 py-3 bg-gray-50">Name</th>
                    <th className="px-4 py-3 bg-gray-50">Dept</th>
                    {/* ── Sortable Category Column ── */}
                    <th 
                      className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort('category')}
                      title="Click to sort by Category"
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <span className="text-[10px] opacity-70">
                          {sortConfig.key === 'category' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 bg-gray-50">Mobile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {modal.loading ? (
                    <tr><td colSpan="6" className="py-16 text-center text-gray-400 font-medium">Loading…</td></tr>
                  ) : sortedModalData.length === 0 ? (
                    <tr><td colSpan="6" className="py-16 text-center text-gray-400 font-medium">No records.</td></tr>
                  ) : sortedModalData.map((emp, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        {emp.photo
                          ? <img src={emp.photo} className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                          : <div className="h-9 w-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">{emp.name?.charAt(0)}</div>
                        }
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700 text-xs">{emp.code}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{emp.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{emp.dept || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{emp.category || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{emp.mobile || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Present Modal ── */}
      {modal.show && modal.type === 'Present' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setModal({ ...modal, show: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full bg-emerald-500" />
                <div>
                  <h3 className="font-black text-gray-800">Present Details</h3>
                  <p className="text-xs text-gray-400">{modal.date && format(parseISO(modal.date), 'dd MMM yyyy')} · {unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportPresentExcel}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors">
                  <Download size={12} /> Excel
                </button>
                <button onClick={() => setModal({ ...modal, show: false })}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-400 hover:text-gray-700">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-emerald-50 sticky top-0">
                  <tr className="text-[11px] uppercase font-bold text-emerald-700 tracking-wider">
                    <th className="px-5 py-3">Photo</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Dept</th>
                    {/* ── Sortable Category Column ── */}
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-emerald-100 transition-colors select-none"
                      onClick={() => handleSort('category')}
                      title="Click to sort by Category"
                    >
                      <div className="flex items-center gap-1">
                        Category
                        <span className="text-[10px] opacity-70">
                          {sortConfig.key === 'category' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {modal.loading ? (
                    <tr><td colSpan="5" className="py-16 text-center text-emerald-500 font-medium animate-pulse">Loading…</td></tr>
                  ) : sortedModalData.length === 0 ? (
                    <tr><td colSpan="5" className="py-16 text-center text-gray-400 font-medium">No records.</td></tr>
                  ) : sortedModalData.map((emp, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        {emp.photo
                          ? <img src={emp.photo} className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm" alt="" />
                          : <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">{emp.name?.charAt(0)}</div>
                        }
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700 text-xs">{emp.code}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{emp.name}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{emp.dept}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{emp.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setModal({ ...modal, show: false })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default AttendanceDashboard;