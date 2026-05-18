import React, { useState, useRef, useEffect } from 'react';

const QCSystemResponsive = () => {
  const [step, setStep] = useState(1);
  const [qrData, setQrData] = useState({ id: '', total: 0 });
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [activeSide, setActiveSide] = useState('Front');
  const [countData, setCountData] = useState({});
  const [descriptions, setDescriptions] = useState([]);
  const [checkedData, setCheckedData] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const scanInputRef = useRef(null);
  const [finalSaved, setFinalSaved] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingEmp, setLoadingEmp] = useState(false);

  const currentCount =
    countData[activeSide] || 0;

  const sideColors = [
    "bg-sky-500 border-sky-600 text-white",

  ];

  // const isSaved = (desc) => {
  //   return savedMap?.[qrData.id]?.includes(desc) ?? false;
  // };

  const isSaved = (desc) => {
    const list = savedMap?.[qrData.plan_no] || [];
    return list.includes(desc);
  };

  // const isLocked = (desc) => {
  //   return savedMap?.[qrData.id]?.includes(desc);
  // };

  const isLocked = (desc) => isSaved(desc);

  const allSaved =
    descriptions.length > 0 &&
    descriptions.every((desc) =>
      (savedMap?.[qrData.plan_no] || []).includes(desc)
    );


  useEffect(() => {

    const loadEmployees = async () => {

      try {

        setLoadingEmp(true);

        const response = await fetch(
          'https://hfapi.herofashion.com/bit_checking/emp_stick'
        );

        const data = await response.json();

        setEmployeeList(data);

      } catch (error) {

        console.error('Employee Load Error:', error);

      } finally {

        setLoadingEmp(false);

      }

    };

    loadEmployees();

  }, []);

  const filteredEmployees = employeeList.filter((emp) =>
    emp.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(emp.code).includes(searchTerm)
  );



  useEffect(() => {
    const checkFinalSaved = async () => {
      if (!qrData.id) return;

      try {
        const res = await fetch(
          `https://hfapi.herofashion.com/bit_checking/check_final_saved?scanner_id=${qrData.id}`
        );

        const data = await res.json();
        setFinalSaved(data.final_saved);
      } catch (err) {
        console.error(err);
      }
    };

    checkFinalSaved();
  }, [qrData.id]);




  useEffect(() => {

    const loadSaved = async () => {

      try {

        const res = await fetch(
          "https://hfapi.herofashion.com/bit_checking/saved_plans/"
        );

        const data = await res.json();

        const map = {};

        data.forEach(item => {

          if (!map[item.plan_no]) {
            map[item.plan_no] = [];
          }

          map[item.plan_no].push(item.descriptions);

        });

        setSavedMap(map);

      } catch (err) {
        console.error(err);
      }

    };

    loadSaved();

  }, []);


  useEffect(() => {
    if (step === 1 && scanInputRef.current) scanInputRef.current.focus();
  }, [step]);

  const handleScan = async (e) => {
    e.preventDefault();

    const val = scanInputRef.current.value;

    if (!val) return;

    try {

      const response = await fetch(
        `https://hfapi.herofashion.com/bit_checking/qr_api?qr_id=${val}`
      );

      const data = await response.json();

      if (data.status) {

        setQrData({
          id: data.sl,
          plan_no: data.plan_no,
          total: data.pc
        });

        // =====================
        // ALREADY SAVED
        // =====================
        if (data.already_saved) {

          setDescriptions(data.descriptions);

          setActiveSide(data.descriptions[0]);

          setCheckedData(data.checked_data);

          // employee auto select
          const emp = employeeList.find(
            e => String(e.code) === String(data.employee.code)
          );

          if (emp) {
            setSelectedEmp(emp);
          }

          setStep(3);

          return;
        }


        setDescriptions(data.descriptions);

        setActiveSide(data.descriptions[0]);

        const initialChecked = {};

        data.descriptions.forEach(desc => {
          initialChecked[desc] = [];
        });

        setCheckedData(initialChecked);

        setStep(2);
      } else {

        alert("QR Sticker Not Made");


      }

    } catch (error) {

      console.error(error);
      alert("Server Error");

    }
  };


  const toggleNumber = (num) => {

    if (isLocked(activeSide)) return; // 🚫 LOCKED → no selection

    setCheckedData(prev => {

      const current = prev[activeSide] || [];

      const updated = current.includes(num)
  ? current.filter(n => n !== num)
  : [...current, num]
      .filter(n => n > 0)
      .sort((a, b) => a - b);

      return {
        ...prev,
        [activeSide]: updated
      };
    });
  };



const totalUniqueList = [
  ...new Set(
    Object.values(checkedData)
      .flat()
      .filter(n => n > 0)
  )
].sort((a, b) => a - b);

const fullyChecked = Array.from(
  { length: qrData.total },
  (_, i) => i + 1
)
.filter(num => num > 0)
.filter(num =>
  descriptions.every(desc =>
    (checkedData[desc] || []).includes(num)
  )
);

  const currentMistakes = checkedData[activeSide] || [];

  const pendingPieces = totalUniqueList.filter(
    num => !fullyChecked.includes(num)
  );
  // --- RESPONSIVE SCREENS ---

  if (step === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <form onSubmit={handleScan} className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center w-full max-w-md border-b-8 border-blue-600">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔍</div>
          <h2 className="text-xl md:text-2xl font-black mb-6 text-gray-800">SCAN PRODUCT QR</h2>
          <input
            ref={scanInputRef}
            type="text"
            className="border-2 border-gray-200 p-4 rounded-2xl text-center text-xl outline-none w-full focus:border-blue-500 focus:ring-4 ring-blue-50 transition-all"
            placeholder="Scan here..."
          />
        </form>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl w-full max-w-lg">
          <h2 className="text-xl font-black mb-2 text-center text-gray-800">QC ASSIGNMENT</h2>
          <p className="text-center text-blue-500 font-mono text-sm mb-8 underline decoration-2 offset-4">{qrData.id}</p>
          {/* <p className="text-center text-blue-500 font-mono text-sm mb-8 underline decoration-2 offset-4">{qrData.plan_no}</p> */}
          <input
            type="text"
            placeholder="Search Employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-gray-200 p-4 rounded-2xl outline-none focus:border-blue-500 mb-4"
          />
          <div className="grid grid-cols-1 gap-4">
            {filteredEmployees.map(emp => (
              <button
                key={emp.code}
                onClick={() => {
                  setSelectedEmp(emp);
                  setStep(3);
                }}
                className="group flex justify-between items-center p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">

                  <img
                    src={emp.photo}
                    alt={emp.employee}
                    className="w-14 h-14 rounded-full object-cover border"
                  />

                  <div className="text-left">
                    <p className="font-bold text-gray-800 group-hover:text-blue-700">
                      {emp.employee}
                    </p>

                    <p className="text-xs text-gray-400 font-medium">
                      ID: {emp.code}
                    </p>

                    <p className="text-[11px] text-blue-500 font-semibold">
                      {emp.category}
                    </p>
                  </div>

                </div>

                <div className="bg-gray-100 group-hover:bg-blue-600 group-hover:text-white p-2 rounded-lg transition-colors">
                  ➔
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 sm:mt-4 md:mt-2 lg:mt-0 md text-slate-800 flex flex-col">
      {/* Top Navigation - Responsive Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-black text-xs">Bit</div>
          <div>
            <h1 className="text-sm font-black leading-tight uppercase tracking-wide">Panel Inspection</h1>
            <p className="text-[10px] font-bold text-gray-400">{selectedEmp.employee} ({selectedEmp.code})</p>
          </div>

        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* DELETE BUTTON */}
          {(savedMap?.[qrData.plan_no]?.length > 0) && (
            <button
              className="flex-1 sm:px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95"
              onClick={async () => {

                const confirmDelete =
                  window.confirm("Saved data delete panna confirm ah?");

                if (!confirmDelete) return;

                try {

                  const res = await fetch(
                    `https://hfapi.herofashion.com/bit_checking/delete_checking/?plan_no=${qrData.plan_no}`,
                    {
                      method: "DELETE",
                    }
                  );

                  const data = await res.json();

                  if (data.status) {

                    alert("Deleted Successfully");

                    // remove local saved state
                    setSavedMap((prev) => ({
                      ...prev,
                      [qrData.plan_no]: []
                    }));

                    setFinalSaved(false);

                  } else {

                    alert(data.message || "Delete Failed");

                  }

                } catch (err) {

                  console.error(err);
                  alert("Server Error");

                }

              }}
            >
              DELETE
            </button>
          )}

          {allSaved && !finalSaved && (
            <button
              className="flex-1 sm:px-10 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95"
              onClick={async () => {

                const payload = {
                  scaner_id: qrData.id,
                  emp_id: selectedEmp.code,
                  total_qty: qrData.total,

                  details: descriptions.map(desc => {

                    const checkedPieces =
                      checkedData[desc] || [];

                    // OUT PCS
                    const outPieces = totalUniqueList.filter(num => {

                      const selectedInCurrent =
                        (checkedData[desc] || []).includes(num);

                      const selectedInOthers =
                        descriptions.some(otherDesc => {

                          if (otherDesc === desc) return false;

                          return (
                            checkedData[otherDesc] || []
                          ).includes(num);

                        });

                      return !selectedInCurrent && selectedInOthers;

                    });

                    return {

                      scaner_id: qrData.id,

                      emp_id: selectedEmp.code,

                      descriptions: desc,

                      // select_pcs: checkedPieces.join(','),

                      // mistake_pcs: checkedPieces.join(','),
                      mistake_pcs: checkedPieces.filter(n => n > 0).join(','),

                      mistake_count: checkedPieces.length,

                      // out_pcs: outPieces.join(','),
                      out_pcs: outPieces.filter(n => n > 0).join(','),

                      ok_pcs: outPieces.length,

                      total_qty: qrData.total,

                      plan_no: qrData.plan_no,

                      // total_select_pcs:totalUniqueList.join(','),
                      
                      total_select_pcs: totalUniqueList.filter(n => n > 0).join(','),

                      final_tpcs: totalUniqueList.length

                    };

                  })
                };

                try {

                  const res = await fetch(
                    "https://hfapi.herofashion.com/bit_checking/final_bit_checking",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify(payload)
                    }
                  );

                  const data = await res.json();

                  if (data.status) {

                    alert("Final Checking Completed");

                    // current plan descriptions mark as saved
                    setSavedMap((prev) => ({
                      ...prev,
                      [qrData.plan_no]: [...descriptions]
                    }));

                    setFinalSaved(true);

                    // RESET SCREEN
                    setCheckedData({});
                    setDescriptions([]);
                    setSelectedEmp(null);

                    setQrData({
                      id: '',
                      total: 0,
                      plan_no: ''
                    });

                    setStep(1);

                  } else {

                    alert(data.message || "Finish Failed");

                  }

                } catch (err) {

                  console.error(err);
                  alert("Server Error");

                }

              }}
            >
              FINISH
            </button>
          )}

          <button
            className="px-6 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-colors"
            onClick={() => {
              setCheckedData({});
              setDescriptions([]);
              setSelectedEmp(null);
              setQrData({ id: '', total: 0 });
              setStep(1);
            }}
          >
            ↻
          </button>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-xl">
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase">Ratio ID</p>
            <p className="text-sm font-mono font-bold text-blue-600">{qrData.id}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase">Plan No</p>
            <p className="text-sm font-mono font-bold text-blue-600">{qrData.plan_no}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase">Total Qty</p>
            {/* <p className="text-xl font-black">{qrData.total}</p> */}
            <span className="text-xl font-black">{totalUniqueList.length} <span className="text-xl text-slate-500 ">/ {qrData.total}</span></span>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 flex-1 flex flex-col gap-4 mx-auto w-full">

        <div className="flex bg-gray-200 p-1 rounded-2xl overflow-x-auto">

          {descriptions.map((desc) => (
            <button
              key={desc}
              onClick={() => setActiveSide(desc)}
              className={`flex-1 whitespace-nowrap px-4 py-3 rounded-xl font-black text-sm transition-all ${activeSide === desc
                  ? 'bg-white text-blue-600 shadow-sm scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {desc.toUpperCase()}

              {isSaved(desc) && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white text-[10px] rounded-full">
                  ✓
                </span>
              )}
            </button>
          ))}

        </div>
        {/* GRID SECTION - Dynamic Columns */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-inner border border-gray-100">
          <div className='flex'>

            <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-19 2xl:grid-cols-28 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">

              {Array.from({ length: qrData.total }, (_, i) => i + 1).map((num) => {

                const isSelectedInActive =
                  (checkedData[activeSide] || []).includes(num);

                const fullySelected = descriptions.every(desc =>
                  (checkedData[desc] || []).includes(num)
                );

                let style = "bg-slate-50 text-black border-slate-200";

                // ONLY current active side selection matters
                if (fullySelected) {
                  style = "bg-emerald-500 text-white border-emerald-600 shadow-lg font-bold";
                }
                else if (isSelectedInActive) {
                  style = "bg-sky-500 text-white border-sky-600 shadow-lg font-bold";
                }

                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`aspect-square sm:h-11 border rounded-xl flex items-center justify-center text-[11px] transition-all active:scale-90 shadow-sm ${style}  ${isLocked(activeSide)
                      ? "bg-gray-300 text-black cursor-not-allowed"
                      : style
                      }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className='px-3 py-2 border-l-4 border-emerald-500 rounded-r-xl bg-white shadow-md flex flex-col items-center gap-2'>

              <button
                disabled={isLocked(activeSide)}
                className={`w-10 h-10 rounded-lg text-xl font-bold shadow transition
    ${isLocked(activeSide)
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white active:scale-95"
                  }`
                }
                onClick={() => {
                  if (isLocked(activeSide)) return;

                  const newCount = Math.min(
                    currentCount + 1,
                    qrData.total
                  );
                  setCountData((prev) => ({
                    ...prev,
                    [activeSide]: newCount,
                  }));

                  const start = qrData.total - newCount + 1;

                  const lastPieces = Array.from(
                    { length: newCount },
                    (_, i) => start + i
                  );

                  setCheckedData((prev) => ({
                    ...prev,
                    [activeSide]: lastPieces,
                  }));
                }}
              >
                +
              </button>

              <input
                type="number"
                value={currentCount}
                readOnly
                className='w-16 text-center text-xl font-bold outline-none bg-transparent'
              />

              <button
                disabled={isLocked(activeSide)}
                className={`w-10 h-10 rounded-lg text-xl font-bold shadow transition
    ${isLocked(activeSide)
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white active:scale-95"
                  }`
                }
                onClick={() => {
                  if (isLocked(activeSide)) return;

                  const newCount = Math.max(currentCount - 1, 0);

                  setCountData((prev) => ({
                    ...prev,
                    [activeSide]: newCount,
                  }));

                  if (newCount === 0) {
                    setCheckedData((prev) => ({
                      ...prev,
                      [activeSide]: [],
                    }));
                    return;
                  }

                  const start = qrData.total - newCount + 1;

                  const lastPieces = Array.from(
                    { length: newCount },
                    (_, i) => start + i
                  );

                  setCheckedData((prev) => ({
                    ...prev,
                    [activeSide]: lastPieces,
                  }));
                }}
              >
                -
              </button>

            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* {descriptions.map((desc, index) => { */}
          {[
          activeSide,
          ...descriptions.filter(
            d => d !== activeSide
          )
        ].map((desc, index) => {
            const checkedPieces = checkedData[desc] || [];

            // OTHER DESCRIPTION-la select aana pieces
            const outPieces = totalUniqueList.filter(num => {

              // current description-la iruka?
              const selectedInCurrent =
                (checkedData[desc] || []).includes(num);

              // other description-la iruka?
              const selectedInOthers =
                descriptions.some(otherDesc => {

                  if (otherDesc === desc) return false;

                  return (
                    checkedData[otherDesc] || []
                  ).includes(num);

                });

              // current-la illa but other-la irundha OUT
              return !selectedInCurrent && selectedInOthers;

            });

            // fully completed pcs
            const completedCount = fullyChecked.length;

            return (

              <div
                key={desc}
                className={`p-5 rounded-3xl border shadow-sm transition-all ${activeSide === desc
                  ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]"
                  : "border-gray-100 bg-white"
                  }`}
              >

                <div className="flex justify-between items-center border-b pb-3 mb-4">

                  <h3 className="font-black text-xs uppercase tracking-tighter">
                    {desc}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${sideColors[index % sideColors.length].split(' ')[0]
                      }`}
                  >
                    Mistake Count : {checkedPieces.length}
                  </span>

                  {activeSide === desc && (
                    <button
                      disabled={isSaved(desc)}
                      onClick={async () => {
                        if (isSaved(desc)) return;

                        const checkedPieces = checkedData[desc] || [];

                        const payload = {
                          scaner_id: qrData.id,
                          emp_id: selectedEmp.code,
                          descriptions: desc,
                          out_pcs: outPieces.join(","),
                          mistake_pcs: checkedPieces.join(","),
                          mistake_count: checkedPieces.length,
                          ok_pcs: outPieces.length,
                          total_qty: qrData.total,
                          plan_no: qrData.plan_no,
                          // total_select_pcs: totalUniqueList.join(","),
                          total_select_pcs: totalUniqueList.filter(n => n > 0).join(','),
                        };

                        try {
                          const res = await fetch(
                            "https://hfapi.herofashion.com/bit_checking/save_checking/",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload),
                            }
                          );

                          const data = await res.json();

                          if (data.status) {
                            setSavedMap((prev) => {
                              const key = qrData.plan_no;
                              const list = prev[key] || [];

                              return {
                                ...prev,
                                [key]: [...new Set([...list, desc])],
                              };
                            });

                            // alert("Saved successfully");
                          } else {
                            alert(data.message || "Already saved");
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Server error");
                        }
                      }}
                      className={`ml-2 px-3 py-1 text-[10px] font-bold rounded-full transition
    ${isSaved(desc)
                          ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                          : "bg-green-600 hover:bg-green-700 text-white"
                        }`
                      }
                    >
                      {isSaved(desc) ? "SAVED" : "SAVE"}
                    </button>
                  )}

                </div>

                <div className="space-y-3">

                  {/* SELECTED */}
                  <div>

                    <p className="text-[12px] font-bold text-sky-400 uppercase mb-1">
                      Mistake Pieces
                    </p>

                    <div className="flex flex-wrap gap-1 text-[12px] text-sky-600 font-mono italic">

                      {checkedPieces.filter(n => n > 0).length > 0
  ? checkedPieces.filter(n => n > 0).join(', ')
  : '---'}

                    </div>

                  </div>

                  {/* OUT */}
                  <div>

                    <p className="text-[12px] font-bold text-green-400 uppercase mb-1">
                      Out Pieces
                    </p>

                    <div className="flex flex-wrap gap-1 text-[12px] text-green-600 font-mono font-bold">

                      {outPieces.filter(n => n > 0).length > 0
  ? outPieces.filter(n => n > 0).join(', ')
  : '---'}

                    </div>

                  </div>

                  {/* COMPLETED */}
                  <div className="text-center border-t pt-3">

                    <div className="flex justify-between">

                    <p className="text-[12px] font-bold text-sky-400 uppercase">
                      Ok Pcs : <span className="text-[12px] font-bold truncate"> {outPieces.length}</span>
                    </p>


                    {isSaved(desc) && (
  <button
    onClick={async () => {

      const confirmClear =
        window.confirm(
          `${desc} data clear panna confirm ah?`
        );

      if (!confirmClear) return;

      try {

        const res = await fetch(
          "https://hfapi.herofashion.com/bit_checking/delete_single_checking/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              plan_no: qrData.plan_no,
              descriptions: desc,
              scaner_id: qrData.id
            })
          }
        );

        const data = await res.json();

        if (data.status) {

          // remove saved state
          setSavedMap((prev) => {

            const list =
              prev[qrData.plan_no] || [];

            return {
              ...prev,
              [qrData.plan_no]:
                list.filter(d => d !== desc)
            };

          });

          // clear checked data
          setCheckedData((prev) => ({
            ...prev,
            [desc]: []
          }));

          alert("Cleared Successfully");

        } else {

          alert(data.message || "Clear Failed");

        }

      } catch (err) {

        console.error(err);
        alert("Server Error");

      }

    }}
    className="ml-2 px-3 py-1 text-[10px] font-bold rounded-full bg-red-500 hover:bg-red-600 text-white transition"
  >
    CLEAR
  </button>
)}


</div>

                  </div>


                  

                </div>

              </div>

            );

          })}
        </div>

        {/* BOTTOM ACTION BAR - Sticky on Mobile bottom if needed */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Progress</span>
            <span className="text-2xl font-black">{totalUniqueList.length} <span className="text-xs text-slate-500 font-bold">/ {qrData.total} PCS</span></span>
          </div>
          {/* <div className="flex-1 max-w-md w-full overflow-hidden">
            <div className="flex gap-2 text-[10px] font-mono text-blue-300 overflow-x-auto no-scrollbar py-2">
              {totalUniqueList.map(n => <span key={n} className="bg-slate-800 px-2 py-1 rounded">{n}</span>)}
            </div>
          </div> */}

          <div className="flex-1 max-w-md w-full">
            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-2 text-[10px] font-mono text-blue-300 py-2">
              {totalUniqueList
  .filter(n => n > 0)
  .map((n) => (
                <span
                  key={n}
                  className="bg-slate-800 px-2 py-1 rounded text-center"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default QCSystemResponsive;