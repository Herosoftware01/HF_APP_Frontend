import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';

const API_BASE = 'https://hfapi.herofashion.com//reports';

const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

const formatDateToInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isSunday = (dateStr) => new Date(dateStr).getDay() === 0;

const DEPT_COLORS = {
  HR: '#a855f7',
  Production: '#0ea5e9',
  Finance: '#f59e0b',
  Merchandising: '#ec4899',
  CAD: '#14b8a6',
  Cutting: '#f97316',
  IT: '#6366f1',
  Fabric: '#84cc16',
  Design: '#e879f9',
  Export: '#38bdf8',
};

const generateTrend = (series) =>
  series.map((v, i) =>
    i < 2
      ? v || 0
      : Math.round(
          ((series[i] || 0) + (series[i - 1] || 0) + (series[i - 2] || 0)) / 3
        )
  );

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-white shadow-2xl min-w-[130px]">
      <p className="font-bold mb-1.5 text-slate-400 text-[11px]">{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{ color: p.color }}
          className="flex items-center gap-1.5 mt-0.5"
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: p.color }}
          />
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

const AvatarImg = ({ src, alt = '' }) => {
  const [errored, setErrored] = useState(false);
  const initials = alt
    ? alt
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';
  if (errored || !src) {
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-9 h-9 rounded-full object-cover border-2 border-slate-200"
      onError={() => setErrored(true)}
    />
  );
};

const StaffModal = ({ title, color, data, loading, onClose }) => {
  if (!title) return null;
  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="px-5 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl flex-shrink-0"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="w-1 h-5 rounded-sm"
              style={{ background: color }}
            />
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
          </div>
          <button
            className="bg-slate-100 border-none w-7 h-7 rounded-full cursor-pointer text-sm text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading...</div>
          ) : !data || data.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No records found
            </div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr style={{ background: color + '18' }}>
                  {['Photo', 'Code', 'Name', 'Dept'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[11px] uppercase tracking-wider font-bold sticky top-0 z-[5] border-b border-slate-200 text-left"
                      style={{ background: color + '18' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((emp, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-2.5 align-middle">
                      <AvatarImg src={emp.photo || emp.img} alt={emp.name} />
                    </td>
                    <td className="px-4 py-2.5 align-middle font-mono text-xs font-bold text-slate-500">
                      {emp.code}
                    </td>
                    <td className="px-4 py-2.5 align-middle font-semibold text-slate-800">
                      {emp.name}
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] text-slate-500">
                        {emp.dept}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 text-right flex-shrink-0">
          <button
            className="bg-slate-100 border-none px-5 py-2 rounded-lg text-[13px] font-semibold cursor-pointer text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, accentColor, children, controls }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[460px] flex flex-col gap-0">
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className="w-1 h-[18px] rounded-sm"
        style={{ background: accentColor }}
      />
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {title}
      </h2>
    </div>
    <div className="flex-1 min-h-0">{children}</div>
    {controls && (
      <div className="flex flex-wrap gap-1.5 pt-2.5 mt-1.5 border-t border-slate-100 justify-center">
        {controls}
      </div>
    )}
  </div>
);

const ToggleBtn = ({ label, color, idx, vis, setter }) => {
  const toggle = (setter, idx) => setter((v) => ({ ...v, [idx]: !v[idx] }));
  return (
    <button
      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-all
        ${
          vis[idx]
            ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
        }`}
      onClick={() => toggle(setter, idx)}
    >
      <span
        className="w-2 h-2 rounded-sm flex-shrink-0"
        style={{ background: color }}
      />
      {label}
    </button>
  );
};

export default function Staff_att() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [unit, setUnit] = useState('ALL');
  const [startDate, setStartDate] = useState(formatDateToInput(firstOfMonth));
  const [endDate, setEndDate] = useState(formatDateToInput(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalVis, setTotalVis] = useState({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [presentVis, setPresentVis] = useState({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [absentVis, setAbsentVis] = useState({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [combinedVis, setCombinedVis] = useState({
    0: true,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const [modal, setModal] = useState({
    type: null,
    date: null,
    loading: false,
    data: null,
  });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ dept: unit, startDate, endDate });
      const res = await fetch(`${API_BASE}/staff_overview/?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : json.data || [];
      setData(rows);
      const deptSet = new Set();
      rows.forEach(
        (r) =>
          r.departments &&
          Object.keys(r.departments).forEach((d) => deptSet.add(d))
      );
      setDepartments([...deptSet].sort());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [unit, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = async (type, date) => {
    setModal({ type, date, loading: true, data: null });
    const dept = unit;
    const endpoint = type === 'present' ? 'staff_pre' : 'staff_abe';
    try {
      const res = await fetch(
        `${API_BASE}/${endpoint}/?date=${date}&dept=${dept}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setModal((m) => ({
        ...m,
        loading: false,
        data: Array.isArray(json) ? json : json.data || [],
      }));
    } catch {
      setModal((m) => ({ ...m, loading: false, data: [] }));
    }
  };

  const closeModal = () =>
    setModal({ type: null, date: null, loading: false, data: null });

  const setDateRange = (months) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    setStartDate(formatDateToInput(start));
    setEndDate(formatDateToInput(end));
  };

  const clearFilters = () => {
    setUnit('ALL');
    setStartDate(formatDateToInput(firstOfMonth));
    setEndDate(formatDateToInput(today));
  };

  const nonSundayData = data.filter((r) => !isSunday(r.date));
  const avg = (arr, key) =>
    arr.length
      ? Math.round(arr.reduce((s, r) => s + (r[key] || 0), 0) / arr.length)
      : 0;
  const avgPct = (arr, key) =>
    arr.length
      ? (arr.reduce((s, r) => s + (r[key] || 0), 0) / arr.length).toFixed(1)
      : '0.0';

  const chartLabels = data.map((r) => formatDateToDisplay(r.date));
  const totalArr = data.map((r) => r.total || 0);
  const presentArr = data.map((r) => r.present || 0);
  const absentArr = data.map((r) => r.absent || 0);
  const totalTrend = generateTrend(totalArr);
  const presentTrend = generateTrend(presentArr);
  const absentTrend = generateTrend(absentArr);

  const getDept = (dept, field) =>
    data.map((r) => r.departments?.[dept]?.[field] || 0);

  const chartData = data.map((r, i) => ({
    date: chartLabels[i],
    total: totalArr[i],
    present: presentArr[i],
    absent: absentArr[i],
    totalTrend: totalTrend[i],
    presentTrend: presentTrend[i],
    absentTrend: absentTrend[i],
    hrTotal: generateTrend(getDept('HR', 'total'))[i],
    prodTotal: generateTrend(getDept('Production', 'total'))[i],
    finTotal: generateTrend(getDept('Finance', 'total'))[i],
    merchTotal: generateTrend(getDept('Merchandising', 'total'))[i],
    hrPresent: generateTrend(getDept('HR', 'present'))[i],
    prodPresent: generateTrend(getDept('Production', 'present'))[i],
    finPresent: generateTrend(getDept('Finance', 'present'))[i],
    merchPresent: generateTrend(getDept('Merchandising', 'present'))[i],
    hrAbsent: generateTrend(getDept('HR', 'absent'))[i],
    prodAbsent: generateTrend(getDept('Production', 'absent'))[i],
    finAbsent: generateTrend(getDept('Finance', 'absent'))[i],
    merchAbsent: generateTrend(getDept('Merchandising', 'absent'))[i],
  }));

  const exportCSV = () => {
    const headers = [
      'Date',
      'Total',
      'Present',
      'Present%',
      'Absent',
      'Absent%',
      'Leave',
      'Leave%',
    ];
    const rows = data.map((r) => [
      formatDateToDisplay(r.date),
      r.total,
      r.present,
      r.present_pct,
      r.absent,
      r.absent_pct,
      r.leave || 0,
      r.leave_pct || 0,
    ]);
    rows.push([
      'AVERAGE (Excl Sun)',
      avg(nonSundayData, 'total'),
      avg(nonSundayData, 'present'),
      avgPct(nonSundayData, 'present_pct'),
      avg(nonSundayData, 'absent'),
      avgPct(nonSundayData, 'absent_pct'),
      '',
      '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'attendance_report.csv';
    a.click();
  };

  return (
    <div className="font-sans min-h-screen bg-[#eef2f7] p-5 flex flex-col gap-5 text-slate-800">
      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-lg">
            📊
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              Staff Attendance
            </div>
            <div className="text-xs text-slate-500">
              Analysis for <b className="text-blue-600">{unit}</b>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          <select
            className="px-3 py-[7px] bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none cursor-pointer focus:border-blue-400"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="ALL">All Depts</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
            <input
              type="date"
              className="border-none bg-transparent px-2.5 py-[7px] text-xs text-slate-700 outline-none w-[130px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-400 px-1 text-xs">–</span>
            <input
              type="date"
              className="border-none bg-transparent px-2.5 py-[7px] text-xs text-slate-700 outline-none w-[130px]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button
              className="bg-transparent border-none px-3 py-1 text-xs font-semibold text-slate-500 rounded-md cursor-pointer hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
              onClick={() => setDateRange(1)}
            >
              1M
            </button>
            <button
              className="bg-transparent border-none px-3 py-1 text-xs font-semibold text-slate-500 rounded-md cursor-pointer hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
              onClick={() => setDateRange(6)}
            >
              6M
            </button>
          </div>

          <button
            className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            onClick={clearFilters}
            title="Clear Filters"
          >
            ✕
          </button>

          <button
            className="bg-blue-600 text-white border-none rounded-lg cursor-pointer text-[13px] font-semibold px-4 py-2 hover:bg-blue-700 transition-colors"
            onClick={() => {
              setStartDate(formatDateToInput(firstOfMonth));
              setEndDate(formatDateToInput(today));
              navigate('/hr/staff_one');
            }}
          >
            Today
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-slate-600 cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* ── Loading Bar ── */}
      {loading && (
        <div className="h-[3px] rounded-sm bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%] animate-[shimmer_1.2s_infinite]" />
      )}

      {/* ── Error Box ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-[13px]">
          ⚠ Failed to load data: {error}
        </div>
      )}

      {/* ── Summary Cards ── */}
      {nonSundayData.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex flex-col gap-1.5 shadow-sm">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Avg Onroll
            </div>
            <div className="text-3xl font-extrabold leading-none text-blue-600">
              {avg(nonSundayData, 'total')}
            </div>
            <div className="text-xs text-slate-400">Excl. Sundays</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex flex-col gap-1.5 shadow-sm">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Avg Present
            </div>
            <div className="text-3xl font-extrabold leading-none text-emerald-600">
              {avg(nonSundayData, 'present')}
            </div>
            <div className="text-xs text-slate-400">
              {avgPct(nonSundayData, 'present_pct')}% attendance
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex flex-col gap-1.5 shadow-sm">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Avg Absent
            </div>
            <div className="text-3xl font-extrabold leading-none text-rose-600">
              {avg(nonSundayData, 'absent')}
            </div>
            <div className="text-xs text-slate-400">
              {avgPct(nonSundayData, 'absent_pct')}% absenteeism
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex flex-col gap-1.5 shadow-sm">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Days Tracked
            </div>
            <div className="text-3xl font-extrabold leading-none text-violet-600">
              {data.length}
            </div>
            <div className="text-xs text-slate-400">
              {nonSundayData.length} working days
            </div>
          </div>
        </div>
      )}

      {/* ── Table + Onroll Chart ── */}
      <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
        {/* Daily Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden">
          <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 rounded-t-2xl flex justify-between items-center flex-shrink-0">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Daily Log
            </span>
            <button
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={exportCSV}
            >
              ⬇ Export CSV
            </button>
          </div>

          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="sticky top-0 z-10 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100 text-left"
                  >
                    Date
                  </th>
                  <th
                    rowSpan={2}
                    className="sticky top-0 z-10 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100 text-center"
                  >
                    Total
                  </th>
                  <th
                    colSpan={2}
                    className="sticky top-0 z-10 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-emerald-600 border-b border-slate-100 text-center"
                  >
                    Present
                  </th>
                  <th
                    colSpan={2}
                    className="sticky top-0 z-10 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-rose-600 border-b border-slate-100 text-center"
                  >
                    Absent
                  </th>
                  <th
                    colSpan={2}
                    className="sticky top-0 z-10 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-amber-600 border-b border-slate-100 text-center"
                  >
                    Leave
                  </th>
                </tr>
                <tr>
                  {['Count', '%', 'Count', '%', 'Count', '%'].map((h, i) => (
                    <th
                      key={i}
                      className="sticky top-[37px] z-10 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100 text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-slate-50 transition-colors hover:bg-slate-50 ${isSunday(row.date) ? 'bg-purple-50' : ''}`}
                  >
                    <td
                      className={`px-3 py-2.5 font-semibold whitespace-nowrap ${isSunday(row.date) ? 'text-purple-700 font-bold' : 'text-slate-700'}`}
                    >
                      {formatDateToDisplay(row.date)}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold">
                      {row.total}
                    </td>
                    <td
                      className="px-3 py-2.5 text-center font-bold text-emerald-600 cursor-pointer hover:underline"
                      onClick={() => openModal('present', row.date)}
                    >
                      {row.present}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        {row.present_pct}%
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 text-center font-bold text-rose-600 cursor-pointer hover:underline"
                      onClick={() => openModal('absent', row.date)}
                    >
                      {row.absent}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700">
                        {row.absent_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-amber-600">
                      {row.leave || 0}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-700">
                        {row.leave_pct || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {nonSundayData.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-200">
                    <td className="px-3 py-2.5 text-left font-bold text-xs">
                      AVERAGE
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs text-blue-600">
                      {avg(nonSundayData, 'total')}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs text-emerald-600">
                      {avg(nonSundayData, 'present')}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs text-emerald-600">
                      {avgPct(nonSundayData, 'present_pct')}%
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs text-rose-600">
                      {avg(nonSundayData, 'absent')}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs text-rose-600">
                      {avgPct(nonSundayData, 'absent_pct')}%
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs">
                      {avg(nonSundayData, 'leave')}
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-xs">
                      {avgPct(nonSundayData, 'leave_pct')}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Onroll Trends Chart */}
        <ChartCard
          title="Onroll Trends"
          accentColor="#3b82f6"
          controls={
            <>
              <ToggleBtn
                label="Total"
                color="#3b82f6"
                idx={0}
                vis={totalVis}
                setter={setTotalVis}
              />
              <ToggleBtn
                label="Trend"
                color="#1e40af"
                idx={1}
                vis={totalVis}
                setter={setTotalVis}
              />
              <ToggleBtn
                label="HR"
                color="#a855f7"
                idx={2}
                vis={totalVis}
                setter={setTotalVis}
              />
              <ToggleBtn
                label="Prod"
                color="#0ea5e9"
                idx={3}
                vis={totalVis}
                setter={setTotalVis}
              />
              <ToggleBtn
                label="Fin"
                color="#f59e0b"
                idx={4}
                vis={totalVis}
                setter={setTotalVis}
              />
              <ToggleBtn
                label="Merch"
                color="#ec4899"
                idx={5}
                vis={totalVis}
                setter={setTotalVis}
              />
            </>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {totalVis[0] && (
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="rgba(59,130,246,0.6)"
                  radius={[3, 3, 0, 0]}
                />
              )}
              {totalVis[1] && (
                <Line
                  type="monotone"
                  dataKey="totalTrend"
                  name="Trend"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {totalVis[2] && (
                <Line
                  type="monotone"
                  dataKey="hrTotal"
                  name="HR"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {totalVis[3] && (
                <Line
                  type="monotone"
                  dataKey="prodTotal"
                  name="Prod"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {totalVis[4] && (
                <Line
                  type="monotone"
                  dataKey="finTotal"
                  name="Fin"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {totalVis[5] && (
                <Line
                  type="monotone"
                  dataKey="merchTotal"
                  name="Merch"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Present + Absent Charts ── */}
      <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
        <ChartCard
          title="Present Stats"
          accentColor="#10b981"
          controls={
            <>
              <ToggleBtn
                label="Present"
                color="#10b981"
                idx={0}
                vis={presentVis}
                setter={setPresentVis}
              />
              <ToggleBtn
                label="Trend"
                color="#047857"
                idx={1}
                vis={presentVis}
                setter={setPresentVis}
              />
              <ToggleBtn
                label="HR"
                color="#a855f7"
                idx={2}
                vis={presentVis}
                setter={setPresentVis}
              />
              <ToggleBtn
                label="Prod"
                color="#0ea5e9"
                idx={3}
                vis={presentVis}
                setter={setPresentVis}
              />
              <ToggleBtn
                label="Fin"
                color="#f59e0b"
                idx={4}
                vis={presentVis}
                setter={setPresentVis}
              />
              <ToggleBtn
                label="Merch"
                color="#ec4899"
                idx={5}
                vis={presentVis}
                setter={setPresentVis}
              />
            </>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {presentVis[0] && (
                <Bar
                  dataKey="present"
                  name="Present"
                  fill="rgba(16,185,129,0.6)"
                  radius={[3, 3, 0, 0]}
                />
              )}
              {presentVis[1] && (
                <Line
                  type="monotone"
                  dataKey="presentTrend"
                  name="Trend"
                  stroke="#047857"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {presentVis[2] && (
                <Line
                  type="monotone"
                  dataKey="hrPresent"
                  name="HR"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {presentVis[3] && (
                <Line
                  type="monotone"
                  dataKey="prodPresent"
                  name="Prod"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {presentVis[4] && (
                <Line
                  type="monotone"
                  dataKey="finPresent"
                  name="Fin"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {presentVis[5] && (
                <Line
                  type="monotone"
                  dataKey="merchPresent"
                  name="Merch"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Absent Stats"
          accentColor="#f43f5e"
          controls={
            <>
              <ToggleBtn
                label="Absent"
                color="#f43f5e"
                idx={0}
                vis={absentVis}
                setter={setAbsentVis}
              />
              <ToggleBtn
                label="Trend"
                color="#be123c"
                idx={1}
                vis={absentVis}
                setter={setAbsentVis}
              />
              <ToggleBtn
                label="HR"
                color="#a855f7"
                idx={2}
                vis={absentVis}
                setter={setAbsentVis}
              />
              <ToggleBtn
                label="Prod"
                color="#0ea5e9"
                idx={3}
                vis={absentVis}
                setter={setAbsentVis}
              />
              <ToggleBtn
                label="Fin"
                color="#f59e0b"
                idx={4}
                vis={absentVis}
                setter={setAbsentVis}
              />
              <ToggleBtn
                label="Merch"
                color="#ec4899"
                idx={5}
                vis={absentVis}
                setter={setAbsentVis}
              />
            </>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {absentVis[0] && (
                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill="rgba(244,63,94,0.6)"
                  radius={[3, 3, 0, 0]}
                />
              )}
              {absentVis[1] && (
                <Line
                  type="monotone"
                  dataKey="absentTrend"
                  name="Trend"
                  stroke="#be123c"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {absentVis[2] && (
                <Line
                  type="monotone"
                  dataKey="hrAbsent"
                  name="HR"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {absentVis[3] && (
                <Line
                  type="monotone"
                  dataKey="prodAbsent"
                  name="Prod"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {absentVis[4] && (
                <Line
                  type="monotone"
                  dataKey="finAbsent"
                  name="Fin"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {absentVis[5] && (
                <Line
                  type="monotone"
                  dataKey="merchAbsent"
                  name="Merch"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Combined Chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3.5 text-center">
          Comprehensive Analysis (Excluding Sundays)
        </div>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData.filter((_, i) => !isSunday(data[i]?.date))}
              margin={{ top: 16, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {combinedVis[0] && (
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="rgba(59,130,246,0.6)"
                  radius={[3, 3, 0, 0]}
                />
              )}
              {combinedVis[1] && (
                <Bar
                  dataKey="present"
                  name="Present"
                  fill="rgba(16,185,129,0.6)"
                  radius={[3, 3, 0, 0]}
                />
              )}
              {combinedVis[2] && (
                <Bar
                  dataKey="absent"
                  name="Absent"
                  fill="rgba(244,63,94,0.6)"
                  radius={[3, 3, 0, 0]}
                />
              )}
              {combinedVis[3] && (
                <Line
                  type="monotone"
                  dataKey="totalTrend"
                  name="Total Trend"
                  stroke="#1e40af"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {combinedVis[4] && (
                <Line
                  type="monotone"
                  dataKey="presentTrend"
                  name="Pres Trend"
                  stroke="#15803d"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {combinedVis[5] && (
                <Line
                  type="monotone"
                  dataKey="absentTrend"
                  name="Abs Trend"
                  stroke="#b91c1c"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2.5 mt-2.5 border-t border-slate-100 justify-center">
          <ToggleBtn
            label="Total"
            color="#3b82f6"
            idx={0}
            vis={combinedVis}
            setter={setCombinedVis}
          />
          <ToggleBtn
            label="Present"
            color="#10b981"
            idx={1}
            vis={combinedVis}
            setter={setCombinedVis}
          />
          <ToggleBtn
            label="Absent"
            color="#f43f5e"
            idx={2}
            vis={combinedVis}
            setter={setCombinedVis}
          />
          <ToggleBtn
            label="Total Trend"
            color="#1e40af"
            idx={3}
            vis={combinedVis}
            setter={setCombinedVis}
          />
          <ToggleBtn
            label="Pres Trend"
            color="#15803d"
            idx={4}
            vis={combinedVis}
            setter={setCombinedVis}
          />
          <ToggleBtn
            label="Abs Trend"
            color="#b91c1c"
            idx={5}
            vis={combinedVis}
            setter={setCombinedVis}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {modal.type && (
        <StaffModal
          title={`${modal.type === 'present' ? 'Present' : 'Absent'} Details — ${formatDateToDisplay(modal.date)} | ${unit}`}
          color={modal.type === 'present' ? '#10b981' : '#f43f5e'}
          data={modal.data}
          loading={modal.loading}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
