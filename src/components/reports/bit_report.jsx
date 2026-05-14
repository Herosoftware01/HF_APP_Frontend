import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, AreaChart, Area, Cell, LabelList
} from "recharts";
import { Activity, Target, AlertCircle, TrendingUp, RefreshCcw, FileText, ArrowLeft } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

// Vibrant color palette for employees
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'];

const Bit_report = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const chartsRef = useRef(null);
  const navigate = useNavigate();

  const SALARY = 500;


  const getEmpColor = useCallback((empName) => {
    if (!empName) return "#6366f1";
    const allUniqueNames = [...new Set(data.map(d => d.empname))].sort();
    const index = allUniqueNames.indexOf(empName);
    return COLORS[index % COLORS.length] || COLORS[0];
  }, [data]);

  const handelNavi = () => {
    navigate(-1);
  }
  const handleReset = () => {
    setFilter("today");
    setStartDate("");
    setEndDate("");
    setSelectedEmp(null);
  };

  const fetchData = useCallback(async () => {
    try {
      let url = `https://app.herofashion.com/attendance/bit_check/`;
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else {
        params.append('filter', filter);
      }
      const res = await axios.get(`${url}?${params.toString()}`);
      // Ensure we are setting an array even if data is null
      setData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeData = useMemo(() => {
    return selectedEmp ? data.filter(d => d.empname === selectedEmp) : data;
  }, [data, selectedEmp]);

  const consolidatedTableData = useMemo(() => {
    if (!activeData.length) return [];
    const tableMap = activeData.reduce((acc, current) => {
      if (!acc[current.empname]) {
        acc[current.empname] = { ...current };
      } else {
        acc[current.empname].total_pcs += (current.total_pcs || 0);
        acc[current.empname].mistake_pcs += (current.mistake_pcs || 0);
        acc[current.empname].ok_pcs += (current.ok_pcs || 0);
      }
      return acc;
    }, {});
    return Object.values(tableMap).sort((a, b) => b.ok_pcs - a.ok_pcs);
  }, [activeData]);

  // FIXED: Renamed to match the onClick caller 'exportToPDF'
  const exportToPDF = () => {
  if (consolidatedTableData.length === 0) {
    alert("No data to export");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(14);
  doc.text("Production Report", 14, 15);

  const tableColumn = [
    "Employee",
    "Total PCS",
    "Mistakes",
    "OK PCS",
    "Efficiency",
    "Profit/Loss"
  ];

  const tableRows = consolidatedTableData.map(row => {
    const efficiency =
      row.total_pcs > 0
        ? Math.round((row.ok_pcs / row.total_pcs) * 100)
        : 0;

    const profit = (row.ok_pcs - SALARY / 2.3);

    return [
      row.empname,
      row.total_pcs,
      row.mistake_pcs,
      row.ok_pcs,
      `${efficiency}%`,
      `Rs ${profit.toFixed(2)}` // ✅ only here (no manual draw)
    ];
  });

  autoTable(doc, {
    startY: 25,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",

    styles: {
      fontSize: 10,
      cellPadding: 3
    },

    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "right" }
    }
  });

  doc.save("Production_Report.pdf");
};

  const displayKpi = useMemo(() => {
    const totals = activeData.reduce((acc, curr) => {
      acc.prod += curr.total_pcs || 0;
      acc.mistake += curr.mistake_pcs || 0;
      acc.ok += curr.ok_pcs || 0;
      return acc;
    }, { prod: 0, mistake: 0, ok: 0 });

    return {
      production: totals.prod,
      mistake: totals.mistake,
      ok: totals.ok,
      profit: (totals.ok - (SALARY / 2.3)).toFixed(2),
    };
  }, [activeData]);

  const formatAMPM = (value) => {
    if(!value) return "";
    const [h, m] = value.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const displayTrendData = useMemo(() => {
    const hours = ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30", "19:30", "20:00"];
    const hourlyMap = hours.reduce((acc, time) => {
      acc[time] = { time, ok_pcs: 0 };
      return acc;
    }, {});

    activeData.forEach(d => {
      const fullTime = d.time1 || "00:00:00";
      const hourPart = parseInt(fullTime.split(':')[0]);
      const timeKey = `${hourPart.toString().padStart(2, '0')}:30`;
      if (hourlyMap[timeKey]) hourlyMap[timeKey].ok_pcs += (d.ok_pcs || 0);
    });
    return Object.values(hourlyMap);
  }, [activeData]);

  const displayEmpData = useMemo(() => {
    const empMap = data.reduce((acc, d) => {
      if (!acc[d.empname]) acc[d.empname] = { name: d.empname, ok_pcs: 0 };
      acc[d.empname].ok_pcs += (d.ok_pcs || 0);
      return acc;
    }, {});
    return Object.values(empMap).sort((a, b) => b.ok_pcs - a.ok_pcs);
  }, [data]);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-slate-50 min-h-screen md:h-screen font-sans text-slate-900 flex flex-col overflow-auto md:overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Bit Checking                                        Production Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            {selectedEmp ? `Viewing results for: ${selectedEmp}` : "Real-time monitoring and performance tracking"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 w-full xl:w-auto rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => { setFilter("today"); handleReset(); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all flex-1 sm:flex-none ${filter === "today" && !startDate ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >Today</button>
          <button 
            onClick={() => { setFilter("week"); handleReset(); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all flex-1 sm:flex-none ${filter === "week" && !startDate ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >Week</button>
          
          <div className="flex items-center gap-2 px-2 border-l border-slate-200 w-full sm:w-auto mt-2 sm:mt-0">
            <input type="date" className="bg-slate-50 border-none text-xs rounded-lg p-1.5 w-full sm:w-auto" value={startDate} onChange={(e) => { setStartDate(e.target.value); setSelectedEmp(null); }} />
            <input type="date" className="bg-slate-50 border-none text-xs rounded-lg p-1.5 w-full sm:w-auto" value={endDate} onChange={(e) => { setEndDate(e.target.value); setSelectedEmp(null); }} />
          </div>

          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto sm:ml-2">
            <button onClick={exportToPDF} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-1 text-sm font-medium">
              <FileText size={18} />
              <span>Export PDF</span>
            </button>
            <button onClick={handleReset} className="p-2 flex-1 sm:flex-none justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-1 text-sm font-medium">
              <RefreshCcw size={16} />
              <span>Reset</span>
            </button>
            <buttton onClick={(handelNavi) => navigate(-1)} className="p-2 px-4 flex-1 sm:flex-none justify-center cursor-pointer bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors">
              <ArrowLeft size={16} />
              Back
            </buttton>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 shrink-0">
        <KpiCard title="Total Production" value={displayKpi.production} icon={<Activity size={20}/>} color="indigo" />
        <KpiCard title="Total Mistakes" value={displayKpi.mistake} icon={<AlertCircle size={20}/>} color="red" />
        <KpiCard title="Total OK PCS" value={displayKpi.ok} icon={<Target size={20}/>} color="emerald" />
        <KpiCard title="Total Profit" value={`₹${displayKpi.profit}`} icon={<TrendingUp size={20}/>} color="blue" />
      </div>

      {/* Charts Row */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-4 shrink-0">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm md:text-base font-semibold truncate pr-2">
              {selectedEmp ? `${selectedEmp}'s Trend` : "Overall Production Trend"}
            </h3>
            {selectedEmp && (
              <button onClick={() => setSelectedEmp(null)} className="text-[10px] md:text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 bg-indigo-50 rounded">
                Clear Selection
              </button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={displayTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedEmp ? getEmpColor(selectedEmp) : "#6366f1"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={selectedEmp ? getEmpColor(selectedEmp) : "#6366f1"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={formatAMPM} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px'}} />
              <Area 
                type="monotone" 
                dataKey="ok_pcs" 
                stroke={selectedEmp ? getEmpColor(selectedEmp) : "#6366f1"} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorOk)"
              >
                <LabelList dataKey="ok_pcs" position="top" offset={10} style={{ fill: selectedEmp ? getEmpColor(selectedEmp) : '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm md:text-base font-semibold mb-2">Top Performers</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={displayEmpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} interval={0} textAnchor="end" height={40} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="ok_pcs" name="OK PCS" radius={[4, 4, 0, 0]} barSize={24} onClick={(data) => setSelectedEmp(data.name)} cursor="pointer">
                {displayEmpData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getEmpColor(entry.name)} 
                    opacity={selectedEmp && selectedEmp !== entry.name ? 0.3 : 1} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-100 md:min-h-0 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-slate-50 shrink-0">
          <h3 className="text-sm md:text-base font-semibold">Detailed Production Log</h3>
        </div>
        
        <div className="flex-1 overflow-auto relative"> 
          <table className="w-full min-w-175 text-left border-collapse">
            <thead className="bg-slate-50/95 backdrop-blur sticky top-0 z-10 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">Employee</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Total PCS</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center text-red-500">Mistakes</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center text-emerald-600">OK PCS</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {consolidatedTableData.map((row, i) => {
                const profit = row.ok_pcs - SALARY / 2.3;
                const empColor = getEmpColor(row.empname);
                return (
                  <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${selectedEmp === row.empname ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: empColor }}></div>
                        <div>
                          <div className="font-semibold text-slate-700">{row.empname}</div>
                          <div className="text-[10px] md:text-xs text-slate-400 font-mono">ID: {row.empid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center font-medium">{row.total_pcs}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-red-500 font-medium">{row.mistake_pcs}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center font-bold text-emerald-600">{row.ok_pcs}</td>
                    <td className={`px-4 md:px-6 py-3 md:py-4 text-right font-mono font-bold ${profit >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
                      {profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50",
    red: "text-red-600 bg-red-50",
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
  };
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg shrink-0 ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <h3 className="text-slate-500 text-[10px] md:text-xs font-medium truncate">{title}</h3>
        <p className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
};

export default Bit_report;