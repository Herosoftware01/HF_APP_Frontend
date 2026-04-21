import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FaQrcode, FaArrowRight, FaTimes, FaRobot, FaUserTie } from "react-icons/fa";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../../auth/auth";

function OperatorProcess() {
  const [machineId, setMachineId] = useState("");
  const [employee, setEmployee] = useState(null);
  const [operator, setOperator] = useState("");
  const [process, setProcess] = useState("");
  const [processes, setProcesses] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { unit, line } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { bundleNo, jobNo, product, colour, size, pieces, bundle_id } = location.state || {};
  const dropdownRef = useRef(null);

  // Fetch Machine + Process in one API call
  const fetchMachineWithProcesses = async (id) => {
    if (!id || !jobNo || !product) return;

    try {
      const res = await api.get(
        `qcapp/api/machine/${encodeURIComponent(id)}/?jobno=${jobNo}&topbottom_des=${product}&unit=${unit}&line=${line}&bundleNo=${bundleNo}`
      );

      const data = res.data;
      setEmployee({
        employee_name: data.employee_name,
        emp_photo: data.emp_photo
      });

      setOperator(data.emp_code || "");
      setProcesses(data.processes || []);

      if (data.processes?.length) setProcess(data.processes[0].process_des);

    } catch (err) {
      console.error("Machine + Process Fetch Error:", err);
      setEmployee(null);
      setOperator("");
      setProcesses([]);
      setProcess("");
    }
  };

  useEffect(() => {
    if (!machineId) return;

    const delayDebounce = setTimeout(() => {
      fetchMachineWithProcesses(machineId);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [machineId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // QR Scanner logic
  useEffect(() => {
    let html5QrCode;
    if (showScanner) {
      html5QrCode = new Html5Qrcode("reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          setMachineId(decodedText);
          setShowScanner(false);
          await html5QrCode.stop();
          fetchMachineWithProcesses(decodedText);
        },
        (errorMessage) => {}
      ).catch(err => console.error("Scanner Start Error:", err));
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(e => console.log(e));
      }
    };
  }, [showScanner]);

  // Filter processes based on search term
  const filteredProcesses = processes.filter(p =>
    p.process_des.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canContinue = operator && process;

  const handleContinue = () => {
    if (!canContinue) return;

    navigate(`/qc-admin/rowing_defects/${unit}/${line}`, {
      state: {
        bundleNo,
        jobNo,
        product,
        colour,
        size,
        pieces,
        bundle_id,
        machineId,
        operator,
        process
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 md:p-8">
      {/* Top Summary */}
      <div className="w-full max-w-2xl bg-white border border-slate-100 shadow-sm rounded-2xl mt-12 md:mt-2 lg:mt-0 p-4 mb-6 flex overflow-x-auto no-scrollbar gap-6 items-center">
        <div className="flex-shrink-0 border-r pr-4 border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit / Line</p>
          <p className="text-sm font-bold text-blue-600">{unit} / {line}</p>
        </div>
        {[ { label: "Bundle", val: bundleNo },
           { label: "Job", val: jobNo },
           { label: "Product", val: product },
           { label: "Pcs", val: pieces },
           { label: "Colour", val: colour },
           { label: "Size", val: size },
           { label: "Bundle ID", val: bundle_id } ].map((item, i) => (
          <div key={i} className="flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-sm font-semibold text-slate-700">{item.val || "N/A"}</p>
          </div>
        )) }
      </div>

      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Operator & Task</h2>
            <p className="text-slate-400 text-sm mt-1">Scan machine to auto-fill details</p>
          </div>
          <button 
            onClick={() => setShowScanner(true)}
            className="h-14 w-14 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 group"
          >
            <FaQrcode className="text-2xl group-hover:rotate-12 transition-transform" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          

          {/* Machine ID */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FaRobot /> Machine Identification
            </label>
            <input
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchMachineWithProcesses(machineId);
                }
              }}
              className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none font-semibold text-slate-700"
              placeholder="Scan QR or Type Machine ID"
            />
          </div>


          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Select Operation
            </label>
            <input
              type="text"
              readOnly 
              value={searchTerm || process}
              
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
              }}
              onClick={() => setDropdownOpen(true)}
              placeholder="Choose Process..."
              className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none font-semibold text-slate-700 cursor-pointer"
            />
            {dropdownOpen && (
              <div className="absolute mt-1 w-full bg-white border border-slate-100 rounded-2xl max-h-48 overflow-y-auto shadow-lg z-10">
                {filteredProcesses.length > 0 ? (
                  filteredProcesses.map((p, i) => (
                    <div
                      key={i}
                      className="px-5 py-3 cursor-pointer hover:bg-blue-600 hover:text-white transition"
                      onClick={() => {
                        setProcess(p.process_des);
                        setSearchTerm("");
                        setDropdownOpen(false);
                      }}
                    >
                      {p.process_des}
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-3 text-slate-400">No processes found</div>
                )}
              </div>
            )}
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <FaUserTie /> Employee Details
            </label>
            <input
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              disabled
              className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none font-semibold text-slate-700"
              placeholder="Employee Name / ID"
            />
          </div>

          {/* Employee Preview Card */}
          {employee && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <img 
                  src={employee.emp_photo || "https://via.placeholder.com/150"} 
                  alt="emp" 
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" 
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase">Verified Operator</p>
                <p className="font-extrabold text-slate-800 text-lg leading-tight">{employee.employee_name}</p>
                <p className="text-sm text-slate-500 font-medium">ID: {machineId || '---'}</p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full h-[70px] rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed opacity-60'
            }`}
          >
            Continue to Defects <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowScanner(false)}></div>
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden relative z-10 shadow-2xl">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Align Machine QR</h3>
              <button 
                onClick={() => setShowScanner(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <div id="reader" className="w-full overflow-hidden rounded-2xl border-0 shadow-inner"></div>
              <p className="text-center text-slate-400 text-xs mt-4 font-medium uppercase tracking-widest">
                Scanning for Machine ID...
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

export default OperatorProcess;