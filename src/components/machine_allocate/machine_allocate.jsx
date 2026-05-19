import React, { useEffect, useState, useContext, useRef } from "react";
import { api } from "../../auth/auth";
import { UserContext } from "../../UserContext";
import { Html5Qrcode } from "html5-qrcode";

function Machine_allocate() {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [allocatedMachines, setAllocatedMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [popup, setPopup] = useState({ open: false, machineId: null });
  const [searchEmp, setSearchEmp] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const { role } = useContext(UserContext);

  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState("allocation");
  const [scanStep, setScanStep] = useState(1);
  const [scannedMachine, setScannedMachine] = useState(null);
  const [scannedEmployee, setScannedEmployee] = useState(null);
  const [scannedSequence, setScannedSequence] = useState("");

  // Needle States
  const [isNeedleChanged, setIsNeedleChanged] = useState(false);
  const [needleCount, setNeedleCount] = useState(1);

  const [error, setError] = useState("");
  const [showManualInScanner, setShowManualInScanner] = useState(false);

  // Camera States
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const html5QrCodeRef = useRef(null);
  const lock = useRef(false);


  const [popupData, setPopupData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = (details) => {
    setPopupData(details);
    setShowPopup(true);
  };

  useEffect(() => {
    api.get("/qcapp/api/units/").then((res) => {
      setUnits(res.data);
      if (res.data.length > 0) {
        const match = role?.match(/\d+/);
        const allowedUnit = role === "admin" ? res.data[0] : res.data.find((u) => u.id.toString() === match?.[0]);
        if (allowedUnit) setSelectedUnit(allowedUnit.id);
      }
    });
    api.get("/qcapp/api/employees/").then((res) => setEmployees(res.data));

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCameraId(devices[0].id);
      }
    }).catch(err => console.error("Camera error", err));
  }, [role]);

  useEffect(() => {
    if (!selectedUnit) return;
    api.get(`/qcapp/api/lines/?unit=${selectedUnit}`).then((res) => setLines(res.data));
    setSelectedLine(null);
  }, [selectedUnit]);

  const fetchAllocations = () => {
    if (!selectedLine) return;
    api.get(`/qcapp/api/allocations/?line=${selectedLine}&unit=${selectedUnit}`)
      .then((res) => setAllocatedMachines(res.data));
  };

  useEffect(() => { fetchAllocations(); }, [selectedLine, selectedUnit]);

  
  // STABLE CAMERA SWITCHING LOGIC
const isTransitioning = useRef(false); 

useEffect(() => {
  const isScanningStep = scanStep >= 1 && scanStep <= 3;
  const shouldRun = showScanner && isScanningStep && !error && selectedCameraId && !showManualInScanner;

  let isMounted = true;

  const manageScanner = async () => {
    // Already oru transition nadandhuttu irundha, intha call-ai skip pannu
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    try {
      // 1. STOP PHASE
      if (html5QrCodeRef.current) {
        // Entha state-il irundhaalum safe-ah stop panna try pannuvom
        try {
          if (html5QrCodeRef.current.isScanning) {
            console.log("Stopping current scanner...");
            await html5QrCodeRef.current.stop();
          }
        } catch (stopErr) {
          console.warn("Stop warning (can be ignored):", stopErr);
        }
        
        // DOM cleaning
        const container = document.getElementById("reader");
        if (container) container.innerHTML = "";
        html5QrCodeRef.current = null;
        
        // Browser hardware camera-vai release seiya 500ms delay
        await new Promise(r => setTimeout(r, 500));
      }

      // 2. START PHASE
      if (shouldRun && isMounted) {
        console.log("Starting new scanner with ID:", selectedCameraId);
        
        // Container irukkannu oru vaati check pannikuvom
        if (!document.getElementById("reader")) {
            throw new Error("Reader element not found in DOM");
        }

        const scanner = new Html5Qrcode("reader");
        html5QrCodeRef.current = scanner;

        await scanner.start(
          selectedCameraId,
          { 
            fps: 20, // 20 FPS better for mobile
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0 
          },
          (text) => handleScanSuccess(text.trim()),
          () => {} // Silent error for frames
        );
      }
    } catch (err) {
      console.error("Scanner Transition Error:", err);
    } finally {
      // Step mudinja piragu lock-ai release pannuvom
      isTransitioning.current = false;
      
      // Oruvelai selectedCameraId maari, munnadi lock-ala skip aagi irundha, 
      // ippo thirumba oru check panni update panna ithu help pannum.
      if (isMounted && html5QrCodeRef.current?.isScanning && 
          html5QrCodeRef.current?.cameraId !== selectedCameraId) {
          // Trigger a re-sync if needed
      }
    }
  };

  manageScanner();

  return () => {
    isMounted = false;
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(() => {});
    }
  };
}, [showScanner, scanStep, selectedCameraId, error, showManualInScanner]);


  const handleScanSuccess = async (val) => {
  if (scanStep === 1) {
    if (scanMode === "needle") {
      try {
        // Machine status check API call
        const response = await api.post("/qcapp/machine-status/", { machine_id: val });
        
        // Response success-ah vantha (Machine online-ah iruntha)
        if (response.data.message === "Machine is online") {
          setScannedMachine({ 
            identity: val, 
            emp_code: response.data.emp_code,
            unit: response.data.unit,
            line: response.data.line 
          });
          setScanStep(5); // Needle change details page-ku pogum
        } else {
          // Offline-lo illai Not allocated-no vantha error kaatum
          setError(response.data.message);
        }
      } catch (err) {
        // API error or 404
        setError(err.response?.data?.message || "Machine verification failed");
      }
    } else {
      // Normal Allocation Logic
      const mObj = allocatedMachines.find(m => m.machine.Identity === val || m.machine.id.toString() === val);
      if (mObj) {
        setScannedMachine({ id: mObj.machine.id, identity: mObj.machine.Identity });
        setScanStep(2);
      } else {
        setError(`Machine ${val} not found.`);
      }
    }
  } 
  // ... rest of the logic (Step 2, 3) remains same
  else if (scanStep === 2) {
      const eObj = employees.find(e => e.code.toString() === val);
      if (eObj) {
        setScannedEmployee(eObj);
        setScanStep(3);
      } else {
        setError(`Employee ID ${val} invalid.`);
      }
  } else if (scanStep === 3) {
      setScannedSequence(val);
      setScanStep(4);
  }
};

  const resetScanner = () => {
    setShowScanner(false);
    setScanStep(1);
    setScannedMachine(null);
    setScannedEmployee(null);
    setScannedSequence("");
    setError("");
    setShowManualInScanner(false);
    setSearchEmp("");
    setIsNeedleChanged(false);
    setNeedleCount(1);
  };

  const handleAllocationSubmit = (empCode, mId, seq) => {
    api.post("/qcapp/api/emp_allocate/", {
      emp_code: empCode, machine_id: mId, unit: selectedUnit, line: selectedLine, sequence: seq
    }).then(() => {
      fetchAllocations();
      resetScanner();
      setPopup({ open: false, machineId: null });
    });
  };

  const handleNeedleSubmit = () => {
  api.post("/qcapp/api/needle_details/", {
    machine_id: scannedMachine.identity, // Scanned QR value
    emp_code: scannedMachine.emp_code,   // From status API
    unit: scannedMachine.unit,           // From status API
    line: scannedMachine.line,           // From status API
    needle_changed: isNeedleChanged ? 1 : 0,
    count: isNeedleChanged ? needleCount : 0,
  }).then(() => {
    resetScanner();
  }).catch((err) => {
    setError(err.response?.data?.message || "Failed to save needle details");
  });
};

  const toggleStatus = (mId, eCode, currStatus) => {
    api.post("/qcapp/api/emp_allocate/", {
      emp_code: eCode, machine_id: mId, unit: selectedUnit, line: selectedLine, 
      status: currStatus ? 0 : 1
    }).then(() => fetchAllocations());
  };

  const sortedAllocations = [...allocatedMachines].sort((a, b) => {
    const getW = (i) => !i.employees?.[0] ? 3 : (i.employees[0].status === 1 ? 1 : 2);
    return getW(a) - getW(b);
  });

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center z-10 mt-8 md:mt-8 lg:mt-0">
        <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Control Panel</h1>
        <div className="flex items-center">
           <button 
             onClick={() => { setScanMode("needle"); setScanStep(1); setShowScanner(true); }}
             className="text-[10px] font-black text-indigo-600 border-2 border-indigo-50 px-4 py-2 rounded-xl uppercase tracking-widest">
            Needle Scan
           </button>
           <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
             <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-green-700 uppercase">System Live</span>
           </div>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Filters */}
        <div className="space-y-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {units.map((u) => (
              <button key={u.id} onClick={() => setSelectedUnit(u.id)}
                className={`px-6 py-2 rounded-2xl text-xs font-bold shrink-0 ${selectedUnit === u.id ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-500 border"}`}>
                {u.name}
              </button>
            ))}
          </div>
          {selectedUnit && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {lines.map((l) => (
                <button key={l.id} onClick={() => setSelectedLine(l.id)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black shrink-0 ${selectedLine === l.id ? "bg-slate-800 text-white" : "bg-white text-slate-400 border"}`}>
                  LINE {l.line_number}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedLine && (
          <button onClick={() => { setScanMode("allocation"); setScanStep(1); setShowScanner(true); }} className="bg-indigo-600 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <span className="text-xl">📸</span>
            <span className="text-sm font-black text-white uppercase tracking-widest">New Allocation Scan</span>
          </button>
        )}

        {/* Table Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-5">Machine</th>
                  <th className="px-6 py-5">Employee</th>
                  {/* <th className="px-6 py-5">Seq</th> */}
                  <th className="px-6 py-5">Needle</th>
                  <th className="px-6 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedAllocations.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-slate-800">{a.machine.Identity}</div>
                      <div className="text-[10px] font-bold text-indigo-500 uppercase">#{a.machine.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {a.employees?.[0] ? (
                        <div className="flex items-center gap-3">
                          <img src={a.employees[0].photo || 'https://via.placeholder.com/40'} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" alt=""/>
                          <div>
                            <div className="text-xs font-black text-slate-700">{a.employees[0].emp_code} - {a.employees[0].name}</div>
                            <button onClick={() => setPopup({ open: true, machineId: a.machine.id })} className="text-[9px] font-bold text-indigo-600 uppercase">Change</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setPopup({ open: true, machineId: a.machine.id })} className="text-[10px] font-black text-slate-300 border border-dashed px-3 py-1 rounded-lg uppercase">Assign</button>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-sm font-black text-slate-800">{a.employees?.[0]?.sequence || "—"}</td> */}
                    {/* <td className="px-6 py-4 text-sm font-black text-slate-800">{a.needle_count}</td> */}
                    <td
                      className="px-6 py-4 text-sm font-black text-slate-800 cursor-pointer text-blue-600"
                      onClick={() => openPopup(a.needle_details)}
                    >
                      {a.needle_count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.employees?.[0] && (
                        <button onClick={() => toggleStatus(a.machine.id, a.employees[0].emp_code, a.employees[0].status)}
                          className={`w-20 py-2 rounded-xl text-[9px] font-black transition-all ${a.employees[0].status ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                          {a.employees[0].status ? "ONLINE" : "OFFLINE"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>



      {showPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
    
    {/* Modal */}
    <div className="w-[90%] sm:w-[400px] max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl bg-white/80 backdrop-blur-lg border border-white/40 animate-fadeIn">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Needle Change Details
        </h2>
        <button
          onClick={() => setShowPopup(false)}
          className="text-gray-500 hover:text-red-500 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[60vh]">
        <table className="w-full text-sm text-gray-700">
          <thead className="sticky top-0 bg-white/70 backdrop-blur">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Time</th>
              <th className="text-left px-4 py-2 font-medium">Count</th>
            </tr>
          </thead>

          <tbody>
            {popupData.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-blue-50/50 transition"
              >
                <td className="px-4 py-2">
                  {new Date(item.time).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-semibold text-blue-600">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {/* --- SCANNER MODAL --- */}
      {showScanner && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Step {scanStep}
                </span>
                <button onClick={resetScanner} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xl font-bold">&times;</button>
              </div>

              {/* Camera Selector */}
              {!showManualInScanner && scanStep <= 3 && cameras.length > 1 && (
                <div className="mb-4">
                  <select 
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600 outline-none"
                  >
                    {cameras.map(cam => <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id}`}</option>)}
                  </select>
                </div>
              )}
              
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full ${scanStep >= s ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-100'}`}></div>
                ))}
              </div>
              
              <h2 className="text-center text-xl font-black text-slate-800 uppercase tracking-tight">
                {scanStep === 1 ? "Scan Machine" : 
                 scanStep === 2 ? (showManualInScanner ? "Search Employee" : "Scan Employee") : 
                 scanStep === 3 ? "Scan Sequence" : 
                 scanStep === 5 ? "Needle Status" : "Verify Details"}
              </h2>
            </div>

            <div className="px-8 pb-10 min-h-[350px]">
              {error ? (
                <div className="text-center py-6">
                  <p className="text-red-500 font-bold mb-4">{error}</p>
                  <button onClick={() => setError("")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase">Try Again</button>
                </div>
              ) : (
                <>
                  {(scanStep === 1 || (scanStep === 2 && !showManualInScanner) || scanStep === 3) && (
                    <div className="w-full">
                        <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden border-[10px] border-slate-50 bg-slate-50 shadow-inner">
                            <div id="reader" className="w-full h-full"></div>
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            {scanStep === 2 && (
                                <button onClick={() => setShowManualInScanner(true)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                                    ⌨️ Manual Search
                                </button>
                            )}
                            {scanStep === 3 && (
                                <button onClick={() => {setScannedSequence(""); setScanStep(4);}} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                    ⏭️ Skip Sequence
                                </button>
                            )}
                        </div>
                    </div>
                  )}

                  {showManualInScanner && scanStep === 2 && (
                    <div className="w-full animate-in fade-in duration-300">
                        <input type="text" placeholder="Search Employee Code or Name..." autoFocus onChange={(e) => setSearchEmp(e.target.value)}
                            className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-indigo-50 outline-none mb-4 focus:border-indigo-500" />
                        <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {employees.filter(e => e.name.toLowerCase().includes(searchEmp.toLowerCase()) || e.code.toString().includes(searchEmp)).map(emp => (
                                <div key={emp.code} onClick={() => { setScannedEmployee(emp); setShowManualInScanner(false); setScanStep(3); }}
                                    className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all">
                                    <img src={emp.photo || 'https://via.placeholder.com/40'} className="h-10 w-10 rounded-full border shadow-sm" alt=""/>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-slate-700 uppercase">{emp.code}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{emp.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowManualInScanner(false)} className="w-full mt-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Back to Scanner</button>
                    </div>
                  )}

                  {scanStep === 5 && (
  <div className="w-full space-y-4">
    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
      <div className="text-center mb-4">
        <p className="text-xl font-black text-indigo-600 italic uppercase tracking-tight">
          {scannedMachine?.identity}
        </p>
        <div className="flex justify-center gap-2 mt-1">
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
            Emp: {scannedMachine?.emp_code}
          </span>
          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full uppercase">
            Line: {scannedMachine?.line}
          </span>
        </div>
      </div>

      <label className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm cursor-pointer mb-4 border border-slate-50">
        <input 
          type="checkbox" 
          checked={isNeedleChanged} 
          onChange={(e) => setIsNeedleChanged(e.target.checked)} 
          className="h-6 w-6 accent-indigo-600 rounded-lg"
        />
        <span className="font-black text-slate-700 text-xs uppercase tracking-tighter">
          Needle Changed?
        </span>
      </label>

      {isNeedleChanged && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-2">Quantity</p>
          <input 
            type="number" 
            value={needleCount} 
            onChange={(e) => setNeedleCount(e.target.value)}
            className="w-full p-4 bg-white border-2 border-indigo-50 rounded-2xl font-black text-indigo-600 outline-none text-xl text-center shadow-inner" 
          />
        </div>
      )}
    </div>
    
    <button 
      onClick={handleNeedleSubmit} 
      className="w-full bg-slate-900 py-5 rounded-[2.5rem] text-white font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
    >
      Save Maintenance
    </button>
  </div>
)}

                  {scanStep === 4 && (
                    <div className="w-full text-center space-y-6">
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] text-left space-y-4 border border-dashed border-slate-200">
                         <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine</span><span className="text-xs font-black text-slate-800 tracking-tight">{scannedMachine?.identity}</span></div>
                         <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</span><span className="text-xs font-black text-slate-800 tracking-tight">{scannedEmployee?.code}</span></div>
                         <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seq</span><span className="text-xs font-black text-slate-800">{scannedSequence || "EMPTY"}</span></div>
                      </div>
                      <button onClick={() => handleAllocationSubmit(scannedEmployee.code, scannedMachine.id, scannedSequence)} className="w-full bg-indigo-600 py-5 rounded-[2.5rem] text-white font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Confirm & Save</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Manual Table Popup */}
      {popup.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-7 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Assign Machine #{popup.machineId}</h3>
              <button onClick={() => setPopup({open:false})} className="text-slate-400 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-7">
              <input type="text" placeholder="Search Employee..." onChange={(e) => setSearchEmp(e.target.value)} className="w-full p-4 bg-slate-100 rounded-2xl text-sm font-bold outline-none mb-4 focus:bg-white border-2 border-transparent focus:border-indigo-100 transition-all" />
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {employees.filter(e => e.name.toLowerCase().includes(searchEmp.toLowerCase()) || e.code.toString().includes(searchEmp)).map(emp => (
                  <div key={emp.code} onClick={() => setSelectedEmp(emp.code)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border-2 transition-all ${selectedEmp === emp.code ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-600 hover:bg-slate-50'}`}>
                    <img src={emp.photo || 'https://via.placeholder.com/40'} className="h-9 w-9 rounded-full" alt=""/>
                    <span className="text-xs font-black tracking-tight">{emp.code} - {emp.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleAllocationSubmit(selectedEmp, popup.machineId, "")} className="w-full mt-6 bg-indigo-600 py-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Update Allocation</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        #reader__dashboard, #reader__header_message, .html5-qrcode-element, #reader__status_span { display: none !important; }
        #reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        #reader { border: none !important; }
      `}} />
    </div>
  );
}

export default Machine_allocate;