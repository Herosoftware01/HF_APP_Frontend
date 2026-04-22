import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const Gray = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Set default range to 'Today'
  const [range, setRange] = useState('Today');
  const [m1Active, setM1Active] = useState('All');
  const [m2Active, setM2Active] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://10.1.21.13:200/reports/coraroll/');
      const api = await res.json();

      const formatted = api.map(item => ({
        roll_id: item.roll_id || 'N/A',
        weight: parseFloat(item.weight) || 0,
        mach_id: item.mach_id || 'Unknown',
        date: item.dt || '',
        dia: item.dia || '',
        gsm: item.gsm || '',
        time: item.time2 || '00:00:00',
        empid: item.empid || 'N/A'
      }));

      setData(formatted);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHourlyData = (filteredList) => {
    const hours = {};
    filteredList.forEach(item => {
      const hour = item.time.split(':')[0] + ":00";
      if (!hours[hour]) hours[hour] = { hour, rollCount: 0 };
      hours[hour].rollCount += 1;
    });
    return Object.values(hours).sort((a, b) => a.hour.localeCompare(b.hour));
  };

  const filteredSets = useMemo(() => {
    // Ensure date comparison matches 'YYYY-MM-DD'
    const todayStr = new Date().toISOString().split('T')[0];

    const filterFn = (categoryPrefix, activeFilter) => {
      const raw = data.filter(d => {
        const isInCategory = d.mach_id.startsWith(categoryPrefix);
        const matchesToggle = activeFilter === 'All' || d.mach_id === activeFilter;
        const matchesDate = range === 'Today' ? d.date === todayStr : true;
        return isInCategory && matchesToggle && matchesDate;
      });

      return {
        raw,
        hourly: getHourlyData(raw)
      };
    };

    return {
      m1: filterFn('1', m1Active),
      m2: filterFn('2', m2Active)
    };
  }, [data, range, m1Active, m2Active]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Syncing Production Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800">Production Analytics</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Live Monitoring
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                <button 
                    onClick={() => setRange('Today')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === 'Today' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >Today</button>
                <button 
                    onClick={() => setRange('Week')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === 'Week' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >All History</button>
            </div>
            <button onClick={() => navigate('/r_home')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Back</button>
            <button onClick={() => window.location.reload()} className="bg-white border border-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-semibold shadow-sm transition-all">Refresh</button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Machine Line 01"
            chartData={filteredSets.m1.hourly}
            active={m1Active}
            setActive={setM1Active}
            options={['All', '1A', '1B']}
            color="#2563eb"
          />
          <ChartCard
            title="Machine Line 02"
            chartData={filteredSets.m2.hourly}
            active={m2Active}
            setActive={setM2Active}
            options={['All', '2A', '2B']}
            color="#db2777"
          />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Detailed Log</h3>
             <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {range === 'Today' ? "Viewing Today's Output" : "Viewing All Time"}
             </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Roll ID</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Machine</th>
                  <th className="px-6 py-4">Dia/GSM</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(range === 'Today' ? [...filteredSets.m1.raw, ...filteredSets.m2.raw] : data).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-blue-600 text-sm">{r.roll_id}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{r.empid}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${r.mach_id.startsWith('1') ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                            {r.mach_id}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{r.dia} / {r.gsm}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium text-sm">{r.weight} kg</td>
                    <td className="px-6 py-4 text-slate-400 text-xs text-right group-hover:text-slate-600">
                        {r.date} <span className="ml-1 font-mono text-slate-300">|</span> {r.time}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                    <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No production records found.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const ChartCard = ({ title, chartData, active, setActive, options, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="font-bold text-slate-800 tracking-tight">{title}</h2>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Performance Trend</p>
      </div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {options.map(m => (
          <button 
            key={m}
            onClick={() => setActive(m)}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              active === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>

    <div style={{ width: '100%', height: 260 }}>
      {chartData.length > 0 ? (
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="hour" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: '#94a3b8'}}
                dy={10}
            />
            <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{fill: '#94a3b8'}}
            />
            <Tooltip 
              cursor={{ stroke: color, strokeWidth: 1 }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="rollCount" 
              name="Rolls Produced"
              stroke={color} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill={`url(#colorGradient-${color})`}
              dot={{ r: 4, fill: 'white', stroke: color, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-slate-400 text-xs font-medium italic">No production data for this selection</span>
        </div>
      )}
    </div>
  </div>
);

export default Gray;