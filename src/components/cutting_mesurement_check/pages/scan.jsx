import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scan() {
  const { unit, line } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [jobNo, setJobNo] = useState("");
  const [product, setProduct] = useState("");
  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");
  const [pieces, setPieces] = useState("");
  const [bundleNo, setBundleNo] = useState("");
  const [bundleid, setBundleid] = useState("");

  const [measurements, setMeasurements] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Popup states
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeMeasurementIndex, setActiveMeasurementIndex] = useState(null);
  const [activeField, setActiveField] = useState('f');
  const [inputValue, setInputValue] = useState("");

  const html5QrCodeRef = useRef(null);

  const isPant = product.toLowerCase().includes("pant");

  // Pant sub-fields layout definition
  const pantFields = [
    { key: 'f_fr', label: 'F - FR' }, { key: 'f_br', label: 'F - BR' }, { key: 'f_fl', label: 'F - FL' }, { key: 'f_bl', label: 'F - BL' },
    { key: 'm_fr', label: 'M - FR' }, { key: 'm_br', label: 'M - BR' }, { key: 'm_fl', label: 'M - FL' }, { key: 'm_bl', label: 'M - BL' },
    { key: 'l_fr', label: 'L - FR' }, { key: 'l_br', label: 'L - BR' }, { key: 'l_fl', label: 'L - FL' }, { key: 'l_bl', label: 'L - BL' }
  ];
  const standardFields = ['f', 'm', 'l'];

  const isFieldApplicableForMeasurement = (fKey, measurdtls) => {
    if (!measurdtls) return false;
    const isBack = measurdtls.toLowerCase().startsWith('b');
    if (isBack) {
      return fKey.includes('br') || fKey.includes('bl');
    } else {
      return fKey.includes('fr') || fKey.includes('fl');
    }
  };

  const isMeasurementDone = (item) => {
    if (isPant) {
      return pantFields.every(f => {
        if (!isFieldApplicableForMeasurement(f.key, item.measurdtls)) return true;
        return item[f.key] !== undefined && item[f.key] !== "";
      });
    } else {
      return standardFields.every(sf => item[sf] !== undefined && item[sf] !== "");
    }
  };

  // Validation Logic based on Product type
  const isAllDone = measurements.length > 0 && measurements.every((m) => {
    if (isPant) {
      return pantFields.every(f => {
        if (!isFieldApplicableForMeasurement(f.key, m.measurdtls)) return true;
        return m[f.key] !== undefined && m[f.key] !== "";
      });
    } else {
      return standardFields.every(sf => m[sf] !== undefined && m[sf] !== "");
    }
  });

  const canContinue = jobNo && isAllDone;

  const fillBundleData = async (bundle) => {
    if (!bundle) return;
    try {
      const response = await fetch(`http://10.1.21.93:7003/qcapp/get_cutting_measurements/?sl=${bundle}`);
      const resData = await response.json();
      const data = resData.data || resData;
      if (!data || data.length === 0) return;

      const item = data[0];
      const prodName = item.TopBottom_des || "";
      setJobNo(item.jobno || item.JobNo || "");
      setProduct(prodName);
      setColour(item.Clrcombo || item.comboclr || "");
      setSize(item.Name || item.sizename || "");
      setPieces(item.Pc || item.pc || "");
      setBundleNo(bundle);
      setBundleid(item.sl || item.bundid || "");

      const checkPant = prodName.toLowerCase().includes("pant");
      setMeasurements(data.map((m) => {
        let base = { ...m };
        if (checkPant) {
          pantFields.forEach(f => { base[f.key] = ""; });
        } else {
          standardFields.forEach(f => { base[f] = ""; });
        }
        return base;
      }));
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            setBundleNo(decodedText);
            fillBundleData(decodedText);
            stopScanner();
          },
          () => {}
        ).catch((err) => console.error(err));
      }, 300);
      return () => stopScanner();
    }
  }, [isScanning]);

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }).catch(err => console.error(err));
      setIsScanning(false);
    }
  };

  const openPopup = (index) => {
    const item = measurements[index];
    const isCurrentB = item.measurdtls?.toLowerCase().startsWith('b');

    // B-measurement incomplete-ஆக இருக்கும்போது F-measurement-ஐத் தடுக்க சரிபார்ப்பு
    if (!isCurrentB) {
      const hasIncompleteB = measurements.some((m) =>
        m.measurdtls?.toLowerCase().startsWith('b') && !isMeasurementDone(m)
      );

      if (hasIncompleteB) {
        alert("Please complete all Back (B) measurements first!");
        return;
      }
    }

    setActiveMeasurementIndex(index);
    let fieldToTarget = '';

    if (isPant) {
      const allowedFields = pantFields
        .map(f => f.key)
        .filter(k => isFieldApplicableForMeasurement(k, item.measurdtls));

      const pendingField = allowedFields.find(k => item[k] === "");
      fieldToTarget = pendingField ? pendingField : allowedFields[0];
    } else {
      const pendingField = standardFields.find(f => item[f] === "");
      fieldToTarget = pendingField ? pendingField : standardFields[0];
    }

    setActiveField(fieldToTarget);
    setInputValue(item[fieldToTarget] || "");
    setIsPopupOpen(true);
  };

  const saveValue = () => {
    const updated = [...measurements];
    updated[activeMeasurementIndex][activeField] = inputValue;

    setMeasurements(updated);
    setIsPopupOpen(false);
    setInputValue("");

    // Auto next logic wrapper
    setTimeout(() => {
      let nextIndex = -1;
      let nextField = '';

      if (isPant) {
        // 1. முதலாவதாக 'B' (Back) இல்லாத குறைகளைத் தேடவும்
        for (let fKey of pantFields.map(f => f.key)) {
          for (let i = 0; i < updated.length; i++) {
            if (updated[i].measurdtls?.toLowerCase().startsWith('b')) {
              if (isFieldApplicableForMeasurement(fKey, updated[i].measurdtls) && updated[i][fKey] === "") {
                nextIndex = i;
                nextField = fKey;
                break;
              }
            }
          }
          if (nextIndex !== -1) break;
        }

        // 2. 'B' அனைத்தும் முடிந்தபின் 'F' (Front) முறைக்குச் செல்லவும்
        if (nextIndex === -1) {
          for (let fKey of pantFields.map(f => f.key)) {
            for (let i = 0; i < updated.length; i++) {
              if (!updated[i].measurdtls?.toLowerCase().startsWith('b')) {
                if (isFieldApplicableForMeasurement(fKey, updated[i].measurdtls) && updated[i][fKey] === "") {
                  nextIndex = i;
                  nextField = fKey;
                  break;
                }
              }
            }
            if (nextIndex !== -1) break;
          }
        }
      } else {
        const targetFieldsList = standardFields;
        for (let fKey of targetFieldsList) {
          for (let i = 0; i < updated.length; i++) {
            if (updated[i][fKey] === "") {
              nextIndex = i;
              nextField = fKey;
              break;
            }
          }
          if (nextIndex !== -1) break;
        }
      }

      if (nextIndex !== -1) {
        setActiveMeasurementIndex(nextIndex);
        setActiveField(nextField);
        setInputValue(updated[nextIndex][nextField] || "");
        setIsPopupOpen(true);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 flex flex-col items-center">
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[32px] w-full max-w-md shadow-2xl flex flex-col items-center">
            <h2 className="text-white font-black text-xl mb-6 tracking-wider uppercase">Scan QR Code</h2>
            <div id="reader" className="w-full max-w-[280px] h-[280px] bg-slate-900 rounded-3xl overflow-hidden border-4 border-white/10 flex items-center justify-center" />
            <button onClick={stopScanner} className="w-full mt-8 py-3.5 bg-red-600 font-bold text-white rounded-2xl">Close Camera</button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[850px] bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A]">Cut Part MMST</h1>
            <p className="text-sm text-blue-600 font-semibold mt-1">
              {product ? `Type: ${isPant ? "👖 Pant Mode" : "👕 Standard Mode"}` : "Waiting for Bundle..."}
            </p>
          </div>
          <button onClick={() => setIsScanning(true)} className="h-14 w-14 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white font-bold">QR</button>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bundle No</label>
          <input
            type="text"
            value={bundleNo}
            onChange={(e) => { setBundleNo(e.target.value); if (e.target.value) fillBundleData(e.target.value); }}
            placeholder="Enter or Scan Bundle No..."
            className="w-full h-[64px] px-6 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-lg font-medium text-slate-700 bg-slate-50 transition"
          />
        </div>

        {jobNo && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[{ l: 'Job No', v: jobNo }, { l: 'Product', v: product }, { l: 'Colour', v: colour }, { l: 'Size', v: size }, { l: 'Pieces', v: pieces }].map((itm, idx) => (
              <div key={idx}><span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">{itm.l}</span><span className="text-sm font-bold text-slate-800 block truncate">{itm.v}</span></div>
            ))}
          </div>
        )}

        {measurements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Measurements Required</h3>
            <div className="grid grid-cols-1 gap-4">
              {measurements.map((item, index) => (
                <div
                  key={index}
                  onClick={() => openPopup(index)}
                  className="p-6 rounded-2xl border-2 bg-white border-[#E2E8F0] cursor-pointer transition-all hover:border-blue-400"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-bold text-[#0F172A]">{item.measurdtls}</span>
                    <span className="text-xs text-slate-400">Standard: <span className="font-bold text-slate-700">{item.meas}</span></span>
                  </div>

                  {/* Conditional Layout for Pant vs Standard Products */}
                  {isPant ? (
                    <div className="space-y-4">
                      {['f', 'm', 'l'].map((prefix) => {
                        const isBack = item.measurdtls && item.measurdtls.toLowerCase().startsWith('b');
                        const allowedSuffixes = isBack ? ['br', 'bl'] : ['fr', 'fl'];

                        return (
                          <div key={prefix} className="bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                            <span className="text-[11px] font-black uppercase text-blue-600 block mb-2">{prefix}-Group</span>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              {allowedSuffixes.map((suffix) => {
                                const targetKey = `${prefix}_${suffix}`;
                                return (
                                  <div key={suffix} className="p-2 rounded-lg bg-white border border-slate-200">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">{suffix}</span>
                                    <span className="font-bold text-slate-700 text-sm">{item[targetKey] || '-'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {standardFields.map((field) => (
                        <div key={field} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">{field}</span>
                          <span className="font-bold text-slate-700">{item[field] || '-'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {canContinue && (
          <div className="mt-8">
            <button
              onClick={() => alert("Data Processing Complete!")}
              className="w-full h-[64px] rounded-2xl font-bold text-lg flex items-center justify-center bg-green-600 text-white hover:bg-green-700 shadow-xl transition-all"
            >
              SAVE ALL MEASUREMENTS &amp; CONTINUE
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Input Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-slate-100">
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2">
              Current Field: {isPant ? pantFields.find(f => f.key === activeField)?.label : activeField.toUpperCase()}
            </p>
            <h3 className="text-xl font-bold mb-6 text-slate-800">{measurements[activeMeasurementIndex]?.measurdtls}</h3>

            <input
              type="number"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full h-20 text-center text-4xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none text-slate-700 mb-8"
              placeholder="0"
            />

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsPopupOpen(false)} className="py-3.5 bg-slate-100 rounded-2xl font-bold text-sm text-slate-600">Cancel</button>
              <button onClick={saveValue} className="py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}