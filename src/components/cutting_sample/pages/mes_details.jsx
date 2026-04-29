import React, { useEffect, useState } from "react";
import { useLocation, useNavigate  } from "react-router-dom";
import { X, ArrowDown, ShieldCheck, ToggleRight, ToggleLeft, Hash } from "lucide-react";

function MesDetails() {
  const location = useLocation();
  const { jobNo, product, size, bundleNo, colour, pieces,bundle_id,bf_ironing,af_ironing } = location.state || {};

  const [measurements, setMeasurements] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPieceModal, setShowPieceModal] = useState(false);
  const [tempPiece, setTempPiece] = useState("");
  const [readingPieces, setReadingPieces] = useState({ 0: "", 1: "", 2: "" });
  const [tempValue, setTempValue] = useState(""); 
  const [inputs, setInputs] = useState({});
  const [forceSave, setForceSave] = useState(false);
  const navigate = useNavigate();

  const bfIroningValue = bf_ironing === true || bf_ironing === 1 || bf_ironing === "true";
const afIroningValue = af_ironing === true || af_ironing === 1 || af_ironing === "true";

  useEffect(() => {
    if (jobNo && product && size) {
      fetchMeasurements();
    }
  }, [jobNo, product, size]);



  // const fetchMeasurements = async () => {
  //   try {
  //     const response = await fetch(
  //       `http://10.1.21.133:7003/qcapp/get_order_measurements?ordid=${jobNo}&TopBottom_des=${product}&siz=${size}`
  //     );
  //     const data = await response.json();
  //     setMeasurements(data.data || []);

  //     if (meas.length > 0) {
  //     fetchExistingData(meas);
  //   }
  //   } catch (error) {
  //     console.error("API Error:", error);
  //   }
  // };


  const fetchExistingData = async (measList) => {
  try {
    const res = await fetch(
      `https://hfapi.herofashion.com/qcapp/get-existing-measurements?bundle_id=${bundle_id}&product=${product}&bf_ironing=${bfIroningValue}&af_ironing=${afIroningValue}`
    );

    const data = await res.json();

    console.log("EXISTING API DATA:", data); // 🔥 ADD THIS

    if (!data.data || data.data.length === 0) return;

    let newInputs = {};
    let pcs = { 0: "", 1: "", 2: "" };

    data.data.forEach((item) => {

      const rowIndex = measList.findIndex(
        (m) =>
          m.tit === item.title &&
          m.measurdtls === item.measurement_dtls
      );

      console.log("Matching Row:", rowIndex, item); // 🔥 DEBUG

      if (rowIndex === -1) return;

      if (item.reading1 !== null) {
        newInputs[`${rowIndex}-0`] = {
          value: parseFloat(item.measurement) + parseFloat(item.reading1),
          diff: item.reading1,
        };
        pcs[0] = item.pcs_no_r1;
      }

      if (item.reading2 !== null) {
        newInputs[`${rowIndex}-1`] = {
          value: parseFloat(item.measurement) + parseFloat(item.reading2),
          diff: item.reading2,
        };
        pcs[1] = item.pcs_no_r2;
      }

      if (item.reading3 !== null) {
        newInputs[`${rowIndex}-2`] = {
          value: parseFloat(item.measurement) + parseFloat(item.reading3),
          diff: item.reading3,
        };
        pcs[2] = item.pcs_no_r3;
      }
    });

    console.log("FINAL INPUTS:", newInputs); // 🔥 DEBUG

    setInputs(newInputs);
    setReadingPieces(pcs);

  } catch (err) {
    console.error("Existing fetch error:", err);
  }
};

  const fetchMeasurements = async () => {
  try {
    const response = await fetch(
      `https://hfapi.herofashion.com/qcapp/get_order_measurements?ordid=${jobNo}&TopBottom_des=${product}&siz=${size}`
    );
    const data = await response.json();

    const meas = data.data || [];   // ✅ DEFINE HERE
    setMeasurements(meas);

    if (meas.length > 0) {
      fetchExistingData(meas);      // ✅ PASS CORRECT DATA
    }

  } catch (error) {
    console.error("API Error:", error);
  }
};

  const getCurrentActiveCol = () => {
    if (measurements.length === 0) return 0;
    const isCol0Done = measurements.every((_, i) => inputs[`${i}-0`]);
    const isCol1Done = measurements.every((_, i) => inputs[`${i}-1`]);
    if (!isCol0Done) return 0;
    if (!isCol1Done) return 1;
    return 2;
  };

  const currentActiveCol = getCurrentActiveCol();

  // கிளிக் செய்யும் வரிசையை (rowIndex) அப்படியே ஓபன் செய்யும் வசதி
  const handleCellClick = (rowIndex, colIndex) => {
    if (colIndex !== currentActiveCol) return;
    
    if (readingPieces[colIndex]) {
      openMeasurementModal(rowIndex, colIndex);
    } else {
      // பீஸ் நம்பர் இல்லை என்றால் மட்டும் பீஸ் கேட்கும்
      setTempPiece("");
      setShowPieceModal(true);
    }
  };



  

  const handlePieceSubmit = () => {
    const pNum = parseInt(tempPiece);
    const maxPcs = parseInt(pieces || 0);

    if (pNum > 0 && pNum <= maxPcs) {
      setReadingPieces(prev => ({ ...prev, [currentActiveCol]: tempPiece }));
      setShowPieceModal(false);
      openMeasurementModal(0, currentActiveCol);
    } else {
      alert(`Valid Piece No (1 to ${maxPcs})`);
    }
  };

  const openMeasurementModal = (rowIndex, colIndex) => {
    setActiveCell({ rowIndex, colIndex });
    const existingValue = inputs[`${rowIndex}-${colIndex}`]?.value;
    setTempValue(existingValue !== undefined ? String(existingValue) : "");
    setShowModal(true);
  };

  

  const handleSave = async () => {
  if (!activeCell || !measurements[activeCell.rowIndex]) return;

  const { rowIndex, colIndex } = activeCell;
  const row = measurements[rowIndex];

  const apiValue = parseFloat(row.meas || 0);
  const valStr = String(tempValue || "").trim();
  const finalEnteredValue = valStr === "" ? apiValue : parseFloat(valStr);
  const diff = (finalEnteredValue - apiValue).toFixed(2);

  // Update UI
  setInputs((prev) => ({
    ...prev,
    [`${rowIndex}-${colIndex}`]: {
      value: finalEnteredValue,
      diff: diff,
    },
  }));

  // 🔥 SEND TO BACKEND
  try {
    await fetch("https://hfapi.herofashion.com/qcapp/save-measurement/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobNo,
        bundleNo,
        product,
        colour,
        bundle_id,
        size,
        title: row.tit,
        measurement_dtls: row.measurdtls,
        measurement: row.meas,
        pcs_no_r1: colIndex === 0 ? readingPieces[0] : null,
        pcs_no_r2: colIndex === 1 ? readingPieces[1] : null,
        pcs_no_r3: colIndex === 2 ? readingPieces[2] : null,
        reading1: colIndex === 0 ? parseFloat(diff) : null,
        reading2: colIndex === 1 ? parseFloat(diff) : null,
        reading3: colIndex === 2 ? parseFloat(diff) : null,
        bf_ironing: bfIroningValue ? 1 : 0,
        af_ironing: afIroningValue ? 1 : 0,
      }),
    });
  } catch (err) {
    console.error("Save error:", err);
  }

  // Next row auto open
  let nextRow = rowIndex + 1;
  if (nextRow < measurements.length) {
    setTimeout(() => {
      openMeasurementModal(nextRow, colIndex);
    }, 150);
  } else {
    setShowModal(false);
  }
};


const handleFinalSave = async () => {
  try {
    const res = await fetch("https://hfapi.herofashion.com/qcapp/final-save-measurement/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobNo,
        bundleNo,
        bundle_id,
        product,
        colour,
        size,
        bf_ironing: bfIroningValue ? 1 : 0,
        af_ironing: afIroningValue ? 1 : 0,
        force_save: forceSave ? 1 : 0,  //  IMPORTANT
      }),
    });

    const data = await res.json();
    console.log(data);

    if (data.status === "success") {
      alert("Final Saved Successfully");
      navigate(-1);
    }
  } catch (err) {
    console.error(err);
  }
};

  const isAllComplete = measurements.length > 0 && Object.keys(inputs).length === measurements.length * 3;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 mt-4 md:mt-2 lg:mt-0">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">QC Entry</h1>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Reading {currentActiveCol + 1}</span>
              {readingPieces[currentActiveCol] && (
                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase">P#{readingPieces[currentActiveCol]}</span>
              )}
            </div>
          </div>
          <button 
            onClick={() => setForceSave(!forceSave)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${forceSave ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
          >
             <span className="text-[10px] font-black uppercase">Force Save</span>
             {forceSave ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-900 p-5 rounded-2xl text-white grid grid-cols-2 md:grid-cols-6 gap-3 text-[10px] uppercase font-bold">
           {[["Job", jobNo], ["Product", product], ["Size", size], ["Bundle", bundleNo], ["Color", colour], ["Total Pcs", pieces]].map(([l, v]) => (
            <div key={l} className="bg-slate-800/50 p-2 rounded">
              <p className="text-slate-500 mb-1">{l}</p>
              <p className="truncate">{v}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-black text-slate-500 uppercase">
                  <th className="p-4">Point</th>
                  <th className="p-4 text-center">Spec</th>
                  <th className="p-4 text-center">Tol</th>
                  <th className="p-4 text-center bg-blue-50/50 text-blue-600">Reading {currentActiveCol + 1}
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full mt-1 animate-in fade-in duration-300">
                      P#{readingPieces[currentActiveCol]}
                    </span></th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {measurements.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 border-r border-gray-50">
                      <div className="text-[13px] text-slate-800 font-bold">{item.measurdtls}</div>
                      <div className="font-bold text-sm text-blue-700">{item.tit}</div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 bg-slate-50/30 border-r border-gray-50">{item.meas}</td>
                    <td className="p-4 text-center text-slate-400 text-xs border-r border-gray-50">±{item.toll}</td>
                    
                    <td className="p-2 text-center" onClick={() => handleCellClick(index, currentActiveCol)}>
                      <div className={`min-h-[55px] flex flex-col items-center justify-center rounded-xl border-2 transition-all cursor-pointer
                        ${inputs[`${index}-${currentActiveCol}`] 
                          ? (Math.abs(parseFloat(inputs[`${index}-${currentActiveCol}`].diff)) > parseFloat(item.toll || 0) ? 'border-red-300 bg-red-50' : 'border-emerald-500 bg-emerald-50') 
                          : 'border-dashed border-blue-200 bg-white hover:border-blue-400'}
                      `}>
                        {inputs[`${index}-${currentActiveCol}`] ? (
                          <>
                            <span className="text-sm font-black">{inputs[`${index}-${currentActiveCol}`].value}</span>
                            <span className={`text-[10px] font-bold ${parseFloat(inputs[`${index}-${currentActiveCol}`].diff) >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                              {parseFloat(inputs[`${index}-${currentActiveCol}`].diff) > 0 ? `+${inputs[`${index}-${currentActiveCol}`].diff}` : inputs[`${index}-${currentActiveCol}`].diff}
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] font-black text-blue-300 uppercase">Click</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(forceSave || isAllComplete) && (
            <div className="p-6 bg-slate-50 border-t flex justify-end">
              <button onClick={handleFinalSave} className="px-12 py-4 rounded-2xl font-black text-xs tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-xl flex items-center gap-2 uppercase transition-all active:scale-95">
                <ShieldCheck size={18} /> Final Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PIECE MODAL */}
      {showPieceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/60">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-10 text-center">
              <Hash size={40} className="mx-auto text-orange-500 mb-4" />
              <h2 className="text-xl font-black mb-6 uppercase">Enter Piece No</h2>
              <input
                autoFocus
                type="number"
                className="w-full text-5xl font-black border-4 border-slate-100 rounded-[2rem] p-8 text-center focus:border-orange-400 outline-none transition-all"
                value={tempPiece}
                onChange={(e) => setTempPiece(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePieceSubmit()}
              />
              <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available: 1 to {pieces}</p>
              <button onClick={handlePieceSubmit} className="w-full mt-8 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-widest hover:bg-orange-600 transition-all uppercase shadow-xl">Start</button>
            </div>
          </div>
        </div>
      )}

      {/* MEASUREMENT MODAL */}
      {showModal && activeCell && measurements[activeCell.rowIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-white/20">
            <div className="flex justify-between items-center p-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3 text-slate-800">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">{activeCell.colIndex + 1}</div>
                <div>
                  <h3 className="font-black text-sm uppercase">Measurement</h3>
                  <p className="text-lg font-black text-blue-600 leading-none">Row :  
               {activeCell.rowIndex + 1} <span className="text-slate-300 font-medium">/</span> {measurements.length}
            </p>
                </div>
                <div>
                  <h2 className="bg-yellow-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">{measurements[activeCell.rowIndex]?.tit}</h2>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8">
              <div className="text-center mb-8 px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Point</p>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{measurements[activeCell.rowIndex]?.measurdtls}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Standard</p>
                  <p className="text-2xl font-black text-slate-800">{measurements[activeCell.rowIndex]?.meas}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-3xl text-center">
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Tolerance</p>
                  <p className="text-2xl font-black text-blue-600">±{measurements[activeCell.rowIndex]?.toll}</p>
                </div>
              </div>
              <input
                autoFocus
                type="number"
                step="0.01"
                className="w-full text-5xl font-black border-4 border-slate-100 rounded-[2rem] p-8 text-center focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder={measurements[activeCell.rowIndex]?.meas}
              />
              <button onClick={handleSave} className="w-full mt-8 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-sm tracking-[0.1em] shadow-xl hover:bg-blue-700 transition-all uppercase">
                {String(tempValue || "").trim() === "" ? "Use Spec" : "Update & Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MesDetails;
