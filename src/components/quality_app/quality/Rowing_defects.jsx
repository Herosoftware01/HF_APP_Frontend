import React, { useState, useEffect, useContext } from "react";
import { api } from "../../../auth/auth";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../../UserContext";

export default function Rowing_defects() {
  const { unit, line } = useParams();
  const { userId } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const qc_type = "rowing_qc";

  // Persistent state implementation for mobile devices
  const [bundleData, setBundleData] = useState(() => {
    const stored = sessionStorage.getItem("rowing_qc_state");
    if (location.state) {
      sessionStorage.setItem("rowing_qc_state", JSON.stringify(location.state));
      return location.state;
    }
    return stored ? JSON.parse(stored) : {};
  });

  const {
    bundleNo,
    jobNo,
    product,
    colour,
    size,
    pieces,
    bundle_id,
    machineId,
    operator,
    process,
  } = bundleData || {};

  const [qcdatas, setQcdatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [inspectedCount, setInspectedCount] = useState(0);
  const [forceSave, setForceSave] = useState(false);
  
  // State for Checkboxes and Remarks
  const [shadeVariation, setShadeVariation] = useState(false);
  const [numberSticker, setNumberSticker] = useState(true);
  const [remarks, setRemarks] = useState("");

  const totalPieces = Number(pieces) || 0;

  // 1. Fetch Mistakes Master Data
  useEffect(() => {
    const fetch_qcdata = async () => {
      try {
        const res = await api.get("qcapp/qcadmin_mistakes/");
        setQcdatas(res.data);
      } catch (err) {
        console.error("Mistakes Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_qcdata();
  }, []);

  // 2. Fetch last checked piece
  useEffect(() => {
    const fetchLastBundle = async () => {
      if (!bundle_id) return;
      try {
        const res = await api.get(`qcapp/get_last_bundle/?unit=${unit}&line=${line}&qc_type=${qc_type}&seq=${process}`);
        const last = res.data;

        if (last && String(last.bundle_id) === String(bundle_id)) {
          console.log("Bundle match found. Setting inspected count to:", last.checked_pieces);
          setInspectedCount(Number(last.checked_pieces) || 0);
        } else {
          setInspectedCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch last bundle status:", err);
      }
    };

    fetchLastBundle();
  }, [bundle_id, unit, line, qc_type, process]);

  const getFilteredData = () => {
    return qcdatas.filter((item) => item.category === "rowing_qc");
  };

  const handleIncrement = (id) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id) => {
    setCounts((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  const totalMistakes = Object.values(counts).reduce((a, b) => a + b, 0);
  const mistakePercent = totalPieces > 0 ? ((totalMistakes / totalPieces) * 100).toFixed(1) : 0;

  const handleSavePiece = async () => {
    if (inspectedCount >= totalPieces) return;

    if (!userId) {
      alert("User not logged in! Cannot save piece.");
      return;
    }

    const defectsArray = Object.entries(counts).map(([id, count]) => {
      const defect = qcdatas.find((item) => item.id === Number(id));

      return {
        mistake_name: defect?.name || "unknown",
        mistake_count: count,
        category: defect?.category || "unknown",
      };
    }).filter(d => d.mistake_count > 0);

    if (defectsArray.length === 0) {
      defectsArray.push({ mistake_name: "no_mistake", mistake_count: 0, category: "no_mistake" });
    }

    const payload = {
      bundle_no: bundleNo,
      bundle_id,
      jobno: jobNo,
      product,
      color: colour,
      size,
      unit,
      line,
      qc_type: "rowing_qc",
      total_pieces: totalPieces,
      piece_no: inspectedCount + 1,
      total_mistake: totalMistakes,
      mistake_percentage: mistakePercent,
      defects: defectsArray,
      shade_variation: shadeVariation,
      number_sticker: numberSticker,
      remarks: remarks,
      machineId,
      operator,
      process,
      userId,
      seq: process
    };

    try {
      await api.post("qcapp/save_piece/", payload);
      alert(`Piece ${inspectedCount + 1} saved ✅`);
      setInspectedCount((prev) => prev + 1);
      setCounts({});
      setRemarks("");
    } catch (err) {
      console.log("ERROR:", err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert("Failed to save piece ❌\n" + msg);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await api.post("qcapp/save_final_piece/", {
        bundle_no: bundleNo,
        bundle_id,
        jobno: jobNo,
        product,
        color: colour,
        size,
        unit,
        line,
        qc_type: "rowing_qc",
        total_pieces: totalPieces,
        checked_piece: inspectedCount,
        force_save: forceSave,
        userId,
        seq: process,
        machineId
      });
      alert("Bundle Completed Successfully ✅");
      sessionStorage.removeItem("rowing_qc_state");
      navigate(-2);
    } catch (err) {
      alert("Final save failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-4 pb-12 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-4 md:p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-tight">Rowing QC</h1>
            <p className="text-slate-400 text-[10px] font-bold mt-0.5">UNIT: {unit || "N/A"} | LINE: {line || "N/A"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] md:text-[10px] font-bold px-2 py-1 rounded ${forceSave ? 'bg-orange-500' : 'bg-slate-700'}`}>
              {forceSave ? 'FORCE SAVE ON' : 'NORMAL MODE'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer scale-90">
              <input type="checkbox" className="sr-only peer" checked={forceSave} onChange={(e) => setForceSave(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Bundle Info Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-200">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Bundle / Job</p>
              <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{bundleNo || "N/A"} | {jobNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Size</p>
              <p className="text-xs md:text-sm font-bold text-slate-700">{size || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Color</p>
              <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{colour || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Machine ID</p>
              <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{machineId || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Operator</p>
              <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{operator || "N/A"}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Process</p>
              <p className="text-xs md:text-sm font-bold text-slate-700 truncate">{process || "N/A"}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border p-2 rounded-xl md:rounded-2xl text-center shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Inspected</p>
              <p className="text-base md:text-xl font-black text-blue-600">{inspectedCount}/{totalPieces}</p>
            </div>
            <div className="bg-white border p-2 rounded-xl md:rounded-2xl text-center shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Mistakes</p>
              <p className="text-base md:text-xl font-black text-red-500">{totalMistakes}</p>
            </div>
            <div className="bg-white border p-2 rounded-xl md:rounded-2xl text-center shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Mistake %</p>
              <p className="text-base md:text-xl font-black text-orange-500">{mistakePercent}%</p>
            </div>
          </div>

          {/* Save Piece Button */}
          <button
            onClick={handleSavePiece}
            disabled={loading || inspectedCount >= totalPieces}
            className={`w-full py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg transition shadow-lg active:scale-95 ${
              loading || inspectedCount >= totalPieces ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white"
            }`}
          >
            {loading ? "LOADING..." : `SAVE PIECE #${inspectedCount + 1}`}
          </button>

          {/* Scrollable Defect List */}
          <div className="grid gap-3 md:grid-cols-2 max-h-[280px] overflow-y-auto pr-2">
            {loading ? (
              <div className="col-span-full py-10 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Mistakes...</div>
            ) : (
              getFilteredData().map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2.5 bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm hover:border-blue-200 transition">
                  <div className="flex items-center gap-3 max-w-[60%]">
                    <img src={`https://hfapi.herofashion.com${item.image}`} alt="" className="w-9 h-9 md:w-12 md:h-12 rounded-xl object-cover bg-slate-50 border shadow-inner flex-shrink-0" />
                    <p className="font-bold text-slate-700 text-xs uppercase truncate">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => handleDecrement(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-red-500 font-black">-</button>
                    <span className="w-8 text-center font-black text-slate-700 text-sm">{counts[item.id] || 0}</span>
                    <button onClick={() => handleIncrement(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-green-500 font-black">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Compact Checkboxes & Textarea Remarks */}
          <div className="p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <label className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border transition-all shadow-sm cursor-pointer ${
                shadeVariation ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
              }`}>
                <span className="text-[10px] font-bold text-slate-600 uppercase">Shade Var.</span>
                <input type="checkbox" checked={shadeVariation} onChange={(e) => setShadeVariation(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              </label>
              <label className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border transition-all shadow-sm cursor-pointer ${
                numberSticker ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
              }`}>
                <span className="text-[10px] font-bold text-slate-600 uppercase">No. Sticker</span>
                <input type="checkbox" checked={numberSticker} onChange={(e) => setNumberSticker(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              </label>
            </div>

            <div className="relative group">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="2"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm text-xs md:text-sm font-medium resize-none placeholder:text-slate-300"
                placeholder="Enter remarks or measurements here..."
              ></textarea>
              <div className="absolute right-3 bottom-2 text-[8px] font-black text-slate-300 group-focus-within:text-blue-400 uppercase tracking-widest">Remarks Box</div>
            </div>
          </div>

          {/* Final Action Button */}
          <button
            onClick={handleFinalSubmit}
            disabled={!(inspectedCount === totalPieces || forceSave)}
            className={`w-full py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-black transition-all shadow-xl active:scale-95 ${
              inspectedCount === totalPieces || forceSave ? "bg-slate-900 text-white hover:bg-black cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            COMPLETE & SAVE BUNDLE
          </button>

        </div>
      </div>
    </div>
  );
}
