import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dyed = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [employeeData, setEmployeeData] = useState({});
  const [machineData, setMachineData] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeRolls, setEmployeeRolls] = useState({ live: [], idle: [] });
  
  
  
  const navigate = useNavigate();


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterByDate();
  }, [data, selectedDate]);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://hfapi.herofashion.com/imp_reports/get_master_final_mistake_data/");
      const rows = res.data || [];
      setData(rows);
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handelNavi = () => {
    navigate(-1);
  }

  const filterByDate = () => {
    const rows = data.filter((item) => String(item.date).includes(selectedDate));
    setFilteredData(rows);
    processDashboard(rows);
  };

  const processDashboard = (rows) => {
    let emp = {};
    let machine = {};

    rows.forEach((item) => {
      const employee = item.emp_id1 || "Unknown";
      const machineId = item.machine_id || "Unknown";
      const jobNo = item.job_no || "N/A";
      const weight = parseFloat(item.weight || 0);

      if (!emp[employee]) {
        emp[employee] = { rolls: 0, weight: 0, pnl: 0 };
      }
      emp[employee].rolls += 1;
      emp[employee].weight += weight;
      emp[employee].pnl += weight * 0.63;

      if (!machine[machineId]) {
        machine[machineId] = { totalWeight: 0, totalRolls: 0, jobs: {} };
      }
      machine[machineId].totalWeight += weight;
      machine[machineId].totalRolls += 1;

      if (!machine[machineId].jobs[jobNo]) {
        machine[machineId].jobs[jobNo] = { rolls: 0, weight: 0 };
      }
      machine[machineId].jobs[jobNo].rolls += 1;
      machine[machineId].jobs[jobNo].weight += weight;
    });

    setEmployeeData(emp);
    setMachineData(machine);
  };

  const resetToHome = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEmployeeModal = (empId) => {
    const rows = filteredData.filter((item) => item.emp_id1 === empId);
    
    // LOGIC: Timer >= 15 is LIVE
    const live = rows
      .filter((item) => parseFloat(item.timer || 0) >= 15)
      .sort((a, b) => String(a.job_no).localeCompare(String(b.job_no)));
      
    // LOGIC: Timer < 15 is IDLE
    const idle = rows
      .filter((item) => parseFloat(item.timer || 0) < 15)
      .sort((a, b) => String(a.job_no).localeCompare(String(b.job_no)));

    setEmployeeRolls({ live, idle });
    setSelectedEmployee(empId);
    setShowModal(true);
  };

  const getStatusBadge = (timer) => {
    const isLive = parseFloat(timer || 0) >= 15;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
        isLive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {isLive ? "Live" : "Idle"}
      </span>
    );
  };

  const RenderRow = ({ item, index, array }) => {
    const isFirstInJob = index === 0 || item.job_no !== array[index - 1].job_no;
    return (
      <tr className={`${isFirstInJob ? "border-t border-slate-50" : ""} hover:bg-slate-50/50 transition-colors`}>
        <td className="py-4 pl-4">
          {isFirstInJob ? (
            <span className="font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg text-xs tracking-tight">
              {item.job_no}
            </span>
          ) : (
            <span className="text-slate-300 ml-4">↳</span>
          )}
        </td>
        <td className="py-4">{getStatusBadge(item.timer)}</td>
        <td className="py-4 font-mono text-xs text-slate-500">{item.roll_no}</td>
        <td className="py-4">
          <span className="font-bold text-slate-700 text-xs uppercase">{item.machine_id}</span>
        </td>
        <td className="py-4 font-bold text-slate-600 text-xs">{item.weight} kg</td>
        <td className="py-4 text-right pr-4 font-black text-indigo-600 text-xs">
          ₹ {(parseFloat(item.weight || 0) * 0.63).toFixed(2)}
        </td>
      </tr>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* FIXED HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={resetToHome}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 group"
            title="Back to Home"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              DYED <span className="text-indigo-600">ROLL CHECKING</span>
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Monitoring
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 font-bold text-indigo-600 cursor-pointer text-sm"
          />
          <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
          <div className="bg-indigo-600 text-white px-4 py-1 rounded-xl text-center min-w-[80px]">
            <p className="text-[9px] font-bold opacity-80 uppercase leading-tight">Total Rolls</p>
            <p className="text-base font-black">{filteredData.length}</p>
          </div>
          <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setSelectedDate(today);
                setShowModal(false);
                setSelectedEmployee(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-slate-900 hover:bg-blue-700 text-white px-5 cursor-pointer py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              Reset
            </button>
                        <button onClick={(handelNavi) => navigate(-1)} 
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm font-semibold text-slate-700 hover:bg-slate-50">
              ← Back
            </button>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Employee Performance Table */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold">Employee Performance</h2>
                <span className="text-xs text-slate-400 font-medium italic">Click row for details</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Rolls</th>
                      <th className="px-6 py-4">Weight</th>
                      <th className="px-6 py-4 text-right">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(employeeData).map(([emp, val], i) => (
                      <tr
                        key={i}
                        className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                        onClick={() => openEmployeeModal(emp)}
                      >
                        <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{emp}</td>
                        <td className="px-6 py-4 font-medium">{val.rolls}</td>
                        <td className="px-6 py-4 text-slate-500">{val.weight.toFixed(2)} <span className="text-[10px]">KG</span></td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-emerald-600 font-black">₹ {val.pnl.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Machine Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-0">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold">Machine Utilization</h2>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {Object.entries(machineData).map(([mc, data], i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-b border-slate-100">
                      <span className="font-black text-indigo-600 uppercase text-xs">Machine {mc}</span>
                      <span className="text-[10px] font-bold text-slate-400">{data.totalRolls} ROLLS | {data.totalWeight.toFixed(1)} KG</span>
                    </div>
                    <div className="p-2 space-y-1">
                      {Object.entries(data.jobs).map(([job, details], j) => (
                        <div key={j} className="flex justify-between items-center px-3 py-2 bg-white rounded-xl text-xs border border-transparent hover:border-slate-100">
                          <span className="font-bold text-slate-600">Job: {job}</span>
                          <div className="flex gap-4">
                              <span className="text-slate-400 font-medium">{details.rolls} Rolls</span>
                              <span className="text-slate-800 font-bold">{details.weight.toFixed(1)} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white relative">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">Employee Activity</h2>
                  <p className="text-indigo-600 font-bold text-sm">Operator ID: {selectedEmployee}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="bg-white shadow-md text-slate-400 hover:text-red-500 w-10 h-10 rounded-full transition-all flex items-center justify-center border border-slate-100 hover:rotate-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-slate-400 text-left text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 pl-4">Job Number</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Roll ID</th>
                    <th className="pb-4">Machine</th>
                    <th className="pb-4">Weight</th>
                    <th className="pb-4 text-right pr-4">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {/* LIVE SECTION (Timer >= 15) */}
                  {employeeRolls.live.length > 0 && (
                    <>
                      <tr className="bg-green-50/50">
                        <td colSpan="6" className="py-2 px-4 text-[10px] font-black text-green-700 uppercase tracking-widest border-y border-green-100">
                          ● Live Production (Timer ≥ 15)
                        </td>
                      </tr>
                      {employeeRolls.live.map((item, i) => (
                        <RenderRow key={`live-${i}`} item={item} index={i} array={employeeRolls.live} />
                      ))}
                    </>
                  )}

                  {/* IDLE SECTION (Timer < 15) */}
                  {employeeRolls.idle.length > 0 && (
                    <>
                      <tr className="bg-red-50/50">
                        <td colSpan="6" className="py-2 px-4 text-[10px] font-black text-red-700 uppercase tracking-widest border-y border-red-100">
                          ○ Idle / Inactive (Timer &lt; 15)
                        </td>
                      </tr>
                      {employeeRolls.idle.map((item, i) => (
                        <RenderRow key={`idle-${i}`} item={item} index={i} array={employeeRolls.idle} />
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer / Back Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-8 py-2 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Back to Dashboard
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dyed;