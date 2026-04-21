import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaQrcode, FaArrowRight, FaRobot, FaChevronDown, 
  FaTimes, FaCamera, FaExclamationTriangle, FaBox 
} from "react-icons/fa";
import { api } from "../../../auth/auth";

export default function Roving() {
  const { unit, line } = useParams();
  const navigate = useNavigate();

  // --- Main Page States ---
  const [bundleNo, setBundleNo] = useState("");
  const [jobNo, setJobNo] = useState("");
  const [product, setProduct] = useState("");
  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");
  const [pieces, setPieces] = useState("");
  const [bundleid, setBundleid] = useState("");

  // --- Scanner Modal States ---
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanStep, setScanStep] = useState(1); 
  const [modalMachine, setModalMachine] = useState({ id: "", name: "", photo: "", process: "" });
  const [processes, setProcesses] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Camera Management
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const html5QrCodeRef = useRef(null);

  // --- API: Fetch Bundle Data ---
  const fillBundleData = async (bundle) => {
    if (!bundle) return;
    try {
      const response = await fetch(`https://hfapi.herofashion.com/qcapp/get_bundle_data/?bundle_id=${bundle}`);
      // const response = await fetch(`http://10.1.21.110:7003/qcapp/get_bundle_data/?bundle_id=${bundle}`);
      const data = await response.json();
      
      if (data.message || !data.length) {
        if (!showScannerModal) {
            // Manual entry error handling
            setJobNo(""); setProduct(""); setColour(""); setSize(""); setPieces("");
        }
        return;
      }

      const item = data[0];
      setJobNo(item.JobNo || "");
      setProduct(item.TopBottom_des || "");
      setColour(item.comboclr || "");
      setSize(item.sizename || "");
      setPieces(item.pc || "");
      setBundleNo(item.Bdl || bundle);
      setBundleid(item.bundid || "");
      
      if (showScannerModal) setScanStep(2); 
    } catch (e) { console.error("Fetch Error:", e); }
  };

  // --- API: Fetch Machine & Operator ---
  const fetchMachine = async (id) => {
    try {
      const res = await api.get(`qcapp/api/machine/${encodeURIComponent(id)}/?jobno=${jobNo}&topbottom_des=${product}&unit=${unit}&line=${line}&bundleNo=${bundleNo}`);
      const data = res.data;
      setModalMachine({
        id: id,
        name: data.employee_name || "",
        photo: data.emp_photo || "",
        process: data.processes?.[0]?.process_des || ""
      });
      setProcesses(data.processes || []);
      setScanStep(3);
      stopScanner();
    } catch (err) {
      setModalMachine({ id: id, name: "", photo: "", process: "" });
      setScanStep(3);
      stopScanner();
    }
  };

  // --- Camera Logic ---
  const startScanner = async (cameraId) => {
    try {
      if (html5QrCodeRef.current) await stopScanner();
      const html5QrCode = new Html5Qrcode("modal-reader");
      html5QrCodeRef.current = html5QrCode;
      await html5QrCode.start(cameraId, { fps: 20, qrbox: 250, aspectRatio: 1.0 },
        (text) => {
          if (scanStep === 1) fillBundleData(text);
          if (scanStep === 2) fetchMachine(text);
        }, () => {});
    } catch (err) { console.error(err); }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
    }
  };

  useEffect(() => {
    if (showScannerModal && scanStep < 3) {
      Html5Qrcode.getCameras().then(devices => {
        setCameras(devices);
        if (devices.length > 0) {
          const back = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
          setSelectedCameraId(back.id);
          startScanner(back.id);
        }
      });
    } else { stopScanner(); }
    return () => stopScanner();
  }, [showScannerModal, scanStep]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 flex flex-col items-center">
      
      {/* ---------------- MAIN UI (ALL FIELDS VISIBLE) ---------------- */}
      <div className="w-full max-w-[900px] bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Roving QC</h1>
            <p className="text-blue-600 font-bold text-lg mt-1 underline decoration-2 underline-offset-8">Unit {unit} / Line {line}</p>
          </div>
          <button
            onClick={() => { setShowScannerModal(true); setScanStep(1); }}
            className="h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all"
          >
            <FaQrcode size={28} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Input Field for Bundle */}
          <div className="space-y-2">
            <label className="text-slate-500 font-black text-xs uppercase ml-1">Bundle No</label>
            <div className="relative">
              <input 
                type="text" value={bundleNo} 
                onChange={(e) => { setBundleNo(e.target.value); fillBundleData(e.target.value); }}
                placeholder="Enter Bundle ID"
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all shadow-sm"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"><FaBox /></div>
            </div>
          </div>

          {/* Read-Only Fields */}
          {[
            { label: "Job No", val: jobNo },
            { label: "Product", val: product },
            { label: "Colour", val: colour },
            { label: "Size", val: size },
            { label: "Pieces", val: pieces },
          ].map((field, idx) => (
            <div key={idx} className="space-y-2">
              <label className="text-slate-400 font-black text-xs uppercase ml-1">{field.label}</label>
              <input 
                type="text" value={field.val} disabled 
                className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-slate-50 font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        {/* 🔴 Manual Continue (Old Redirect) */}
        <button
          onClick={() => navigate(`/qc-admin/roving/${unit}/${line}`, { state: { bundleNo, jobNo, product, colour, size, pieces, bundle_id: bundleid } })}
          disabled={!jobNo}
          className={`w-full h-20 mt-12 rounded-[2rem] font-black text-2xl transition-all shadow-xl ${
            jobNo ? 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          CONTINUE SESSION <FaArrowRight className="inline ml-2" />
        </button>
      </div>

      {/* ---------------- MODERN SCANNER MODAL ---------------- */}
      {showScannerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="bg-[#0F172A] p-8 text-white">
              <button onClick={() => setShowScannerModal(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors">
                <FaTimes size={24}/>
              </button>
              <h2 className="text-2xl font-bold tracking-tight">Scanner Flow</h2>
              <div className="mt-8 flex gap-3">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${scanStep >= s ? 'bg-blue-500' : 'bg-slate-800'}`} />
                ))}
              </div>
            </div>

            <div className="p-8">
              {scanStep < 3 ? (
                <div className="space-y-6">
                  {/* Camera Dropdown */}
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500"><FaCamera /></div>
                    <select 
                      value={selectedCameraId}
                      onChange={(e) => { setSelectedCameraId(e.target.value); startScanner(e.target.value); }}
                      className="w-full h-14 pl-14 pr-10 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-700 appearance-none outline-none focus:border-blue-400"
                    >
                      {cameras.map(cam => (
                        <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cameras.indexOf(cam) + 1}`}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><FaChevronDown size={14}/></div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest bg-blue-50 py-2 rounded-full inline-block px-6">
                      {scanStep === 1 ? "Step 1: Scan Bundle" : "Step 2: Scan Machine"}
                    </p>
                    <div className="w-full max-w-[320px] mx-auto aspect-square rounded-[2.5rem] overflow-hidden border-8 border-slate-50 bg-black shadow-inner relative">
                      <div id="modal-reader" className="w-full h-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 3: COMPREHENSIVE SUMMARY */
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 space-y-4 shadow-inner">
                    
                    {/* Machine ID Row */}
                    <div className="bg-white p-4 rounded-2xl flex justify-between items-center border border-slate-100">
                      <div className="flex items-center gap-3">
                        <FaRobot className="text-blue-500" />
                        <span className="text-xs font-black text-slate-400 uppercase">Machine ID</span>
                      </div>
                      <span className="font-black text-slate-800">{modalMachine.id}</span>
                    </div>

                    {/* Employee Info */}
                    {modalMachine.name ? (
                      <div className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                        <img src={modalMachine.photo || "https://via.placeholder.com/150"} className="w-16 h-16 rounded-xl object-cover border-2 border-slate-50" alt="op" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Operator Details</p>
                          <p className="font-black text-slate-800 text-lg leading-tight">{modalMachine.name}</p>
                          <p className="font-black text-slate-800 text-lg leading-tight">{modalMachine.code}</p>
                        </div>
                      </div>
                    ) : (
                      /* 🔴 Warning Alert */
                      <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-100 animate-pulse flex items-center gap-4">
                        <FaExclamationTriangle className="text-red-500" size={24} />
                        <div>
                          <p className="font-black text-red-600 text-sm">NO OPERATOR ALLOCATED</p>
                          <p className="text-[10px] font-bold text-red-400">Please assign an employee to start QC</p>
                        </div>
                      </div>
                    )}

                    {/* Operation Select */}
                    <div className="relative text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-wider">Operation</label>
                      <div 
                        onClick={() => setDropdownOpen(!dropdownOpen)} 
                        className="w-full h-16 px-6 rounded-2xl border-2 border-white bg-white flex items-center justify-between cursor-pointer shadow-sm hover:border-blue-200 transition-all"
                      >
                        <span className="font-extrabold text-slate-700">{modalMachine.process || "No Operation"}</span>
                        <FaChevronDown className={`text-slate-400 transition-all ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {dropdownOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white border-2 border-slate-50 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-[70] p-2">
                          {processes.map((p, i) => (
                            <div key={i} onClick={() => { setModalMachine({...modalMachine, process: p.process_des}); setDropdownOpen(false); }} className="px-5 py-4 hover:bg-blue-50 rounded-xl cursor-pointer font-bold text-slate-600 mb-1 last:mb-0 transition-all">
                              {p.process_des}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🔵 Scanner Redirect (New Flow) */}
                  <button 
                    onClick={() => navigate(`/qc-admin/rowing_defects/${unit}/${line}`, { 
                      state: { bundleNo, jobNo, product, colour, size, pieces, bundle_id: bundleid, machineId: modalMachine.id, operator: modalMachine.name, process: modalMachine.process } 
                    })}
                    disabled={!modalMachine.name}
                    className={`w-full h-20 rounded-[2rem] font-black text-2xl shadow-xl transition-all flex items-center justify-center gap-4 ${
                      modalMachine.name ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {modalMachine.name ? "START QC" : "LOCKED"} <FaArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        #modal-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 2rem; }
        #modal-reader__dashboard, #modal-reader__status_span { display: none !important; }
        #modal-reader img { display: none !important; }
      `}</style>
    </div>
  );
}