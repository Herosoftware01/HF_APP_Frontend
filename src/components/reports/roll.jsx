import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LabelList 
} from 'recharts';

import { useNavigate } from "react-router-dom";


// --- Enhanced UI Components ---
const StatCard = ({ label, value, iconColor }) => (
  <div className="relative overflow-hidden bg-white border border-slate-200 p-5 rounded-3xl shadow-sm transition-all hover:shadow-md group">
    <div className={`absolute top-0 left-0 h-1 w-full ${iconColor}`} />
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
  </div>
);

const Roll = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today');

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedRoll, setSelectedRoll] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://10.1.21.13:8200/reports/get_master_final_mistake_data/');
        const result = await response.json();
        setData(result);
        applyTimeframe(result, 'today');
        setLoading(false);
      } catch (error) {
        console.error("API Error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getChartLabel = (dateStr, timeframe) => {
    const d = new Date(dateStr);
    if (timeframe === 'today') return `${d.getHours()}:00`;
    if (timeframe === 'week') return d.toLocaleDateString([], { weekday: 'short' });
    if (timeframe === 'month') return `${d.getDate()}/${d.getMonth() + 1}`;
    return dateStr;
  };

  const handelNavi = () => {
    navigate(-1);
  }
  const applyTimeframe = (rawData, timeframe) => {
    setView(timeframe);
    let startTime = new Date();
    if (timeframe === 'today') startTime.setHours(0, 0, 0, 0);
    else if (timeframe === 'week') startTime.setDate(startTime.getDate() - 7);
    else if (timeframe === 'month') startTime.setMonth(startTime.getMonth() - 1);

    const filtered = rawData.filter(item => {
      const itemDate = new Date(item.date);
      return timeframe === 'custom' ? true : itemDate >= startTime;
    });
    setFilteredData(filtered);
  };

  const handleCustomFilter = () => {
    let filtered = [...data];
    if (startDate) filtered = filtered.filter(d => new Date(d.date) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(d => new Date(d.date) <= new Date(endDate));
    if (selectedJob) filtered = filtered.filter(d => d.job_no === selectedJob);
    if (selectedRoll) filtered = filtered.filter(d => d.roll_no === selectedRoll);
    setFilteredData(filtered);
    setView('custom');
  };

  const getTrendData = (items) => {
    const groups = {};
    items.forEach(item => {
      const label = getChartLabel(item.time1, view);
      if (!groups[label]) groups[label] = { label, rollCount: 0 };
      groups[label].rollCount += 1;
    });
    return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
  };

  const machineData = useMemo(() => {
    const grouped = {};
    filteredData.forEach(item => {
      const mId = item.machine_id || "Unset";
      if (!grouped[mId]) grouped[mId] = [];
      grouped[mId].push(item);
    });
    return { grouped, keys: Object.keys(grouped).slice(0, 4) };
  }, [filteredData]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-slate-800 tracking-tighter">INITIALIZING SYSTEMS...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
             <div className="bg-slate-100 rounded-full px-4 py-1 text-[10px] font-bold text-slate-600 uppercase">Status: Live</div>
          </div>
          <button onClick={() => window.location.href='/r_home'} className="text-[10px] font-black tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-colors">
            ← DASHBOARD
          </button>
          
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* H1 Header - Preserved as requested */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
            ROLL CHEKING PRODUCTION <span className="text-indigo-600">TRENDS</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time machine throughput and performance metrics.</p>
        </div>

        {/* Dynamic Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Production" value={filteredData.length} iconColor="bg-indigo-500" />
          <StatCard label="Active Machines" value={machineData.keys.length} iconColor="bg-emerald-500" />
          <StatCard label="Current Window" value={view.toUpperCase()} iconColor="bg-amber-500" />
          <div className="bg-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-200 flex flex-col justify-center">
            <p className="text-indigo-100 text-[11px] font-bold uppercase mb-1">Last Update</p>
            <p className="text-white text-xl font-bold">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Advanced Filter Panel */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Range Start</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-2xl text-sm p-3 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Range End</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-2xl text-sm p-3 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Select Job</span>
              <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} className="w-full bg-slate-50 border-slate-100 rounded-2xl text-sm p-3 appearance-none">
                <option value="">All Jobs</option>
                {[...new Set(data.map(i => i.job_no))].map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <button onClick={handleCustomFilter} className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all">APPLY FILTERS</button>
              <button onClick={() => applyTimeframe(data, 'today')} className="px-4 py-3.5 bg-slate-100 text-slate-400 rounded-2xl hover:text-red-500 transition-all text-xs">RESET</button>
            </div>
            <div className="flex items-center pt-5">
               <div className="bg-slate-100 p-1 rounded-xl flex w-full">
                  {['today', 'week', 'month'].map(t => (
                    <button key={t} onClick={() => applyTimeframe(data, t)} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${view === t ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.toUpperCase()}</button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[0, 1, 2, 3].map((idx) => {
            const mId = machineData.keys[idx];
            const hasData = !!mId;
            const trendData = hasData ? getTrendData(machineData.grouped[mId]) : [];

            return (
              <div key={idx} className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                      {hasData ? `MCH-${mId}` : `STATION-0${idx + 1}`}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Waveform</p>
                  </div>
                  {hasData && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-indigo-600">LIVE</span>
                    </div>
                  )}
                </div>

                <div className="h-80 w-full mt-4">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" fontSize={10} fontWeight="900" tick={{fill: '#cbd5e1'}} axisLine={false} tickLine={false} tickMargin={15}/>
                        <YAxis fontSize={10} fontWeight="900" tick={{fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                          contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="rollCount" 
                          stroke="#6366f1" 
                          strokeWidth={4} 
                          fill={`url(#grad-${idx})`}
                          dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        >
                          <LabelList dataKey="rollCount" position="top" offset={15} style={{ fill: '#6366f1', fontSize: '12px', fontWeight: 'bold' }} />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-300 font-black text-xs uppercase tracking-widest">Waiting for source...</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roll;