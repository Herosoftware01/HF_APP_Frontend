import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import { useNavigate } from "react-router-dom";

// ─── Constants ───────────────────────────────────────────────────────────────
const ONE_HOUR_SALARY = 50; 
const TIME_FILTERS = ['Today', 'One Week', 'One Month'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt2 = (n) => Number(n || 0).toFixed(2);

const Lay = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('Today');
  const [selectedTable, setSelectedTable] = useState(null);

  const navigate = useNavigate();
  
  
  // New State for Date Range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ─── Filtering Logic ───────────────────────────────────────────────────────
  const applyFilter = useCallback((raw, timeframe, customStart, customEnd) => {
    setView(timeframe);
    const now = new Date();
    let startTime = new Date();
    startTime.setHours(0, 0, 0, 0);

    if (timeframe === 'One Week') {
      startTime.setDate(now.getDate() - 7);
    } else if (timeframe === 'One Month') {
      startTime.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'Custom' && customStart) {
      startTime = new Date(customStart);
      startTime.setHours(0, 0, 0, 0);
    }

    // Set end time to end of day if customEnd exists, otherwise use "now"
    const endTime = customEnd ? new Date(customEnd) : new Date();
    endTime.setHours(23, 59, 59, 999);

    const filtered = raw.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startTime && itemDate <= endTime;
    });

  const handelNavi = () => {
    navigate(-1);
  }

    setFilteredData(filtered);
    setSelectedTable(null);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://10.1.21.13:8200/reports/get_lay_sp_data/');
        const result = await res.json();
        setData(result);
        applyFilter(result, 'Today');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [applyFilter]);

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      applyFilter(data, 'Custom', startDate, endDate);
    } else {
      alert("Please select both start and end dates.");
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    applyFilter(data, 'Today');
  };

  // ─── Computations ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayData = data.filter(item => item.date === todayStr);
    const totalWeight = filteredData.reduce((a, c) => a + (parseFloat(c.actual_obwgt) || 0), 0);
    const totalTodayPly = todayData.reduce((a, c) => a + (parseInt(c.actual_ply) || 0), 0);
    const planCount = new Set(filteredData.map(i => i.plan_no)).size;
    return { planCount, totalTodayPly, totalWeight: fmt2(totalWeight) };
  }, [filteredData, data]);

   const formatAMPM = (value) => {
    if(!value) return "";
    const [h, m] = value.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

 const getTrendData = useCallback((tableId) => {
  const rows = filteredData.filter(
    item => String(item.final_plans__table_id) === String(tableId)
  );

  // 👉 WEEK / MONTH → DATE WISE (NO CHANGE)
  if (view === 'One Week' || view === 'One Month' || view === 'Custom') {
    const map = {};

    rows.forEach(item => {
      if (!item.date) return;

      const date = item.date;

      if (!map[date]) map[date] = 0;
      map[date] += Number(item.actual_ply) || 0;
    });

    return Object.keys(map)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        time: date,
        ply: map[date]
      }));
  }

  // 🔥 TODAY → SHOW ACTUAL TIME (NO GROUPING)
  return rows
    .filter(item => item.final_plans__date_time)
    .map(item => {
      let timePart =
        item.final_plans__date_time.split(' ')[1] ||
        item.final_plans__date_time.split('T')[1];

      if (!timePart) return null;

      const [h, m] = timePart.split(':');

      return {
        time: formatAMPM(`${h}:${m}`), // 👉 exact time
        ply: Number(item.actual_ply) || 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // sort by actual time
      const toMinutes = (t) => {
        const [time, ampm] = t.split(' ');
        let [hh, mm] = time.split(':').map(Number);
        if (ampm === 'PM' && hh !== 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
        return hh * 60 + mm;
      };
      return toMinutes(a.time) - toMinutes(b.time);
    });

}, [filteredData, view]);

  const employeeRows = useMemo(() => {
    return ["1", "2"].map(tableId => {
      const rows = filteredData.filter(d => String(d.final_plans__table_id) === String(tableId));
      const empId = rows[0]?.final_plans__empid ?? '—';
      const totalPly = rows.reduce((a, c) => a + (parseInt(c.actual_ply) || 0), 0);
      const totalPcs = rows.reduce((a, c) => a + (parseInt(c.final_plans__pcs) || 0), 0);
      const salary = fmt2(totalPcs / ONE_HOUR_SALARY);
      const efficiency = totalPcs > 0 ? Math.min(100, Math.round((totalPly / totalPcs) * 100)) : 0;
      const pnl = fmt2(totalPcs / ONE_HOUR_SALARY - (totalPcs * 0.8) / ONE_HOUR_SALARY);
      return { tableId, empId, totalPly, totalPcs, salary, efficiency, pnl, isProfit: parseFloat(pnl) >= 0 };
    });
  }, [filteredData]);

  const drillDownData = useMemo(() => {
    if (!selectedTable) return [];
    return filteredData.filter(d => String(d.final_plans__table_id) === String(selectedTable));
  }, [selectedTable, filteredData]);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Production Data...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-10">
      
      {/* HEADER */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm z-30 px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Lay Spreading Production Dashboard</h1>
            <p className="text-slate-400 text-[10px] md:text-xs font-medium italic">Interactive Manufacturing Insights</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* DATE RANGE INPUTS */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-600 outline-none px-1 uppercase"
              />
              <span className="text-slate-400 text-[10px] font-black tracking-widest uppercase">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-600 outline-none px-1 uppercase"
              />
              <button 
                onClick={handleCustomFilter}
                className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-colors"
              >
                GO
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {TIME_FILTERS.map(t => (
                <button 
                  key={t} 
                  onClick={() => applyFilter(data, t)} 
                  className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${view === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={handleClear} className="px-3 py-1.5 bg-white text-red-500 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-50 transition-colors">Reset</button>
              <button onClick={(handelNavi) => navigate(-1)} className="p-2 flex-1 sm:flex-none justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors">
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard title="Total Plans" value={stats.planCount} unit="Plan" color="text-blue-600" bg="bg-blue-50" icon="📋" />
            <MetricCard title="Total Ply" value={stats.totalTodayPly} unit="Ply" color="text-indigo-600" bg="bg-indigo-50" icon="🧵" />
            <MetricCard title="Total Weight" value={stats.totalWeight} unit="kg" color="text-emerald-600" bg="bg-emerald-50" icon="⚖️" />
          </div>

          {/* TREND GRAPHS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart tableId="1" data={getTrendData("1")} title="Table 1 Production Trend" color="#3b82f6" />
            <TrendChart tableId="2" data={getTrendData("2")} title="Table 2 Production Trend" color="#8b5cf6" />
          </div>

          {/* SUMMARY TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b bg-slate-50/70 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-xs md:text-sm uppercase tracking-wider">Efficiency Summary</h3>
                <span className="hidden md:block text-[10px] font-bold text-blue-500 animate-pulse">● Live Data</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{['Table No', 'Employee ID', 'Total Ply', 'Total PCS', 'Salary', 'Efficiency', 'Profit/Loss'].map(h => <th key={h} className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {employeeRows.map((row, i) => (
                    <tr key={i} onClick={() => setSelectedTable(row.tableId)} className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedTable === row.tableId ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">Table {row.tableId}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono font-medium">{row.empId}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-700">{row.totalPly}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{row.totalPcs}</td>
                        <td className="px-6 py-4 text-sm font-semibold">₹{row.salary}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: `${row.efficiency}%` }}></div>
                                </div>
                                <span className="text-xs font-black text-slate-700">{row.efficiency}%</span>
                            </div>
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold ${row.isProfit ? 'text-emerald-600' : 'text-rose-500'}`}>
                            <div className="flex items-center gap-1">
                                {row.isProfit ? '▲' : '▼'} ₹{row.pnl}
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>

          {/* DRILL DOWN */}
          {selectedTable && (
            <div className="bg-white rounded-xl shadow-xl border-2 border-blue-100 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-[10px] px-2 py-0.5 rounded">DETAILS</span>
                    <h3 className="font-bold text-sm uppercase">Table {selectedTable} Logs</h3>
                </div>
                <button onClick={() => setSelectedTable(null)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">✕</button>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 font-bold uppercase z-10">
                    <tr>
                      <th className="px-4 py-3 border-b">JobNO</th>
                      <th className="px-4 py-3 border-b">Plan</th>
                      <th className="px-4 py-3 border-b">Roll No</th>
                      <th className="px-4 py-3 border-b">Dia (P/A)</th>
                      <th className="px-4 py-3 border-b">Ply (P/A)</th>
                      <th className="px-4 py-3 border-b">Req Wgt</th>
                      <th className="px-4 py-3 border-b">Scl Wgt</th>
                      <th className="px-4 py-3 border-b">Actual OB</th>
                      <th className="px-4 py-3 border-b">End Bit</th>
                      <th className="px-4 py-3 border-b">Bal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drillDownData.length > 0 ? drillDownData.map((item, idx) => {
                      const isFirstInGroup = idx === 0 || 
                        item.plan_no !== drillDownData[idx - 1].plan_no || 
                        item.job_no !== drillDownData[idx - 1].job_no;
                      return (
                        <tr key={idx} className={`hover:bg-blue-50/30 transition-colors ${isFirstInGroup ? 'border-t-2 border-slate-100' : ''}`}>
                          <td className={`px-4 py-3 font-bold whitespace-nowrap ${!isFirstInGroup ? 'text-transparent' : 'text-blue-600 bg-slate-50/30'}`}>
                             <span className={isFirstInGroup ? "text-slate-400" : "text-transparent"}>{item.job_no}</span>
                          </td>
                          <td className={`px-4 py-3 font-bold whitespace-nowrap ${!isFirstInGroup ? 'text-transparent' : 'text-blue-600 bg-slate-50/30'}`}>
                            {item.plan_no}  <span className={isFirstInGroup ? "text-slate-400" : "text-transparent"}></span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{item.roll_no}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-slate-400"></span>  <span className="font-bold text-slate-700">{item.actual_dia}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {Number(item.actual_ply) === Number(item.plan_ply) ? (
                              <span className="font-bold text-emerald-600">
                                {item.actual_ply}
                              </span>
                            ) : Number(item.actual_ply) < Number(item.plan_ply) ? (
                              <>
                                <span className="text-slate-400">{item.plan_ply}</span>
                                <span className="mx-1">→</span>
                                <span className="font-bold text-blue-600">{item.actual_ply}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-slate-400">{item.plan_ply}</span>
                                <span className="mx-1">→</span>
                                <span className="font-bold text-red-500">{item.actual_ply}</span>
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3">{item.req_wgt}</td>
                          <td className="px-4 py-3 font-bold text-slate-700">{item.scl_wgt}</td>
                          <td className="px-4 py-3 text-orange-600 font-bold">{item.actual_obwgt}</td>
                          <td className="px-4 py-3 text-slate-400">{item.end_bit}</td>
                          <td className={`px-4 py-3 font-bold ${parseFloat(item.bal_wgt) < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {item.bal_wgt}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="10" className="p-10 text-center text-slate-400">No records found for this table.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TOTALS FOOTER */}
          <footer className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-black">Σ</div>
                    <span className="text-sm md:text-base font-bold tracking-tight">Consolidated Enterprise Totals</span>
                </div>
                <div className="grid grid-cols-3 gap-4 md:gap-12 w-full md:w-auto">
                    <div className="text-center md:text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total Ply</p>
                        <p className="text-lg font-black text-blue-400">{employeeRows.reduce((a, r) => a + r.totalPly, 0)}</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total PCS</p>
                        <p className="text-lg font-black text-indigo-400">{employeeRows.reduce((a, r) => a + r.totalPcs, 0)}</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Net Profit</p>
                        <p className="text-lg font-black text-emerald-400">₹{fmt2(employeeRows.reduce((a, r) => a + parseFloat(r.pnl), 0))}</p>
                    </div>
                </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const TrendChart = ({ tableId, data, title, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] bg-slate-50 px-2 py-1 rounded text-slate-500 font-bold border border-slate-100">Live Ply Count</span>
    </div>
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad_${tableId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8', fontWeight: 600 }}
          />
          <Tooltip 
            cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }}
            contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="ply" 
            stroke={color} 
            strokeWidth={3} 
            fill={`url(#grad_${tableId})`} 
            animationDuration={1500}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          >
            <LabelList dataKey="ply" position="top" offset={10} fontSize={10} fontWeight={800} fill={color} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const MetricCard = ({ title, value, unit, color, bg, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`${bg} h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-inner`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  </div>
);

export default Lay;