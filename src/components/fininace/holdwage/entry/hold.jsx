import React, { useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useNavigate } from "react-router-dom"; // Add this

const BASE = "https://hfapi.herofashion.com/reports";

const Hold = () => {
  const [empList, setEmpList] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [filteredHold, setFilteredHold] = useState([]);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [savedCodes, setSavedCodes] = useState(new Set()); // Track saved codes in current session
  const [paidAadharSet, setPaidAadharSet] = useState(new Set());

  const [paidAmt, setPaidAmt] = useState("");
  const [remarks, setRemarks] = useState("");
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();
  const [holdAadharSet, setHoldAadharSet] = useState(new Set());

  

  // Modern Toast Configuration
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  useEffect(() => {
  fetch(`${BASE}/holdwagepaid/`)
    .then(res => res.json())
    .then(data => {
      const set = new Set(
        data.map(item => String(item.aadhar_no))
      );
      setPaidAadharSet(set);
    })
    .catch(err => console.error("Error loading paid data:", err));
}, []);

  useEffect(() => {
  fetch(`${BASE}/report/`) // get all hold records
    .then(res => res.json())
    .then(data => {
      const aadharSet = new Set(
        data.map(item => item.accountdetails1) // 👈 Aadhaar field in holdwage
      );
      setHoldAadharSet(aadharSet);
    })
    .catch(err => console.error("Error loading hold data:", err));
}, []);


  // Load Employees
  useEffect(() => {
  fetch(`${BASE}/empwisesal/`)
    .then((res) => res.json())
    .then((data) => {
      const filtered = data.filter(emp => {
        const id = String(emp.accountdetails1 || "");
        return holdAadharSet.has(id) && !paidAadharSet.has(id);
      });

      setEmpList(
        filtered.map((emp) => ({
          value: emp.code,
          label: `${emp.code} - ${emp.name}`,
          ...emp,
        }))
      );
    })
    .catch((err) => console.error("Error loading employees:", err));
}, [holdAadharSet, paidAadharSet]);

  
  // Load HOLD DATA
  useEffect(() => {
    if (!selectedEmp) {
      setFilteredHold([]);
      setIsAlreadySaved(false);
      return;
    }
    

    // Check if this specific employee was already handled in this session
    if (savedCodes.has(selectedEmp.code)) {
        setIsAlreadySaved(true);
    } else {
        setIsAlreadySaved(false);
    }

    fetch(`${BASE}/report/?code=${selectedEmp.code}`)
      .then((res) => res.json())
      .then((data) => {
        setFilteredHold(data || []);
      })
      .catch(() => setFilteredHold([]));
  }, [selectedEmp, savedCodes]);

  const totalBank = filteredHold.reduce((sum, r) => sum + parseFloat(r.holdamount || 0), 0);
  const totalCash = filteredHold.reduce((sum, r) => sum + parseFloat(r.chold || 0), 0);
  const grandTotal = totalBank + totalCash;

  const handleReset = () => {
    setSelectedEmp(null);
    setFilteredHold([]);
    setPaidAmt("");
    setRemarks("");
    setIsAlreadySaved(false);
  };

 const handleSave = async () => {
  const inputAmount = parseFloat(paidAmt);

  if (!selectedEmp || !paidAmt) {
    Toast.fire({ icon: 'info', title: 'Missing Information', text: 'Please enter a payment amount first.' });
    return;
  }

  Swal.fire({
    title: 'Processing Payment...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); },
  });

  const payload = {
    dt: date,
    aadhar_no: String(selectedEmp.accountdetails1 || ""),
    code: Number(selectedEmp.code),
    emp_name: selectedEmp.name,
    t_period: filteredHold[0]?.period || "",
    paid_amt: Number(inputAmount),
    remarks: remarks || "",
  };

  try {
    const res = await fetch(`${BASE}/holdwagepaid/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // ✅ STEP 1: Update the Paid Set locally immediately
      // This tells the app "This person is now paid"
      const currentAadhar = String(selectedEmp.accountdetails1);
      setPaidAadharSet(prev => new Set(prev).add(currentAadhar));

      // ✅ STEP 2: Clear UI States
      setSelectedEmp(null);
      setFilteredHold([]);
      setPaidAmt("");
      setRemarks("");

      Swal.fire({
        icon: 'success',
        title: 'Transaction Complete',
        text: `Successfully processed payment for ${payload.emp_name}`,
        confirmButtonColor: '#6366f1',
      });
    } else {
      throw new Error("API_ERROR");
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Payment Failed' });
  }
};

  const isInvalidAmount = parseFloat(paidAmt) > grandTotal;
  const isSaveDisabled = isAlreadySaved || !selectedEmp || !paidAmt || isInvalidAmount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Hold Wage Portal</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Payroll Administration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
             <span className="px-4 py-1.5 text-sm font-semibold text-slate-600">
               {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
             </span>
             <button 
              onClick={handleReset}
              className="bg-white text-red-500 hover:bg-red-50 px-4 py-1.5  cursor-pointer rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 border border-slate-200"
             >
               Reset
             </button>
             <button onClick={() => navigate(-1)} className="bg-white text-slate-600 cursor-pointer hover:bg-slate-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 border border-slate-200">
                  ← Back
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ASIDE: SEARCH & PROFILE */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Select Associate</label>
            <Select
              options={empList}
              value={selectedEmp}
              onChange={setSelectedEmp}
              placeholder="Search by name or code..."
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  padding: '4px',
                  borderColor: '#E2E8F0',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#6366F1' }
                })
              }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-2 bg-indigo-600"></div>
            <div className="p-6 text-center">
              {selectedEmp ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="relative inline-block mb-4">
                    <img
                      src={selectedEmp.photo}
                      className="w-28 h-28 rounded-full border-4 border-indigo-50 shadow-inner mx-auto"
                      alt="Profile"
                    />
                    <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedEmp.name}</h2>
                  <p className="text-indigo-600 font-mono text-sm mb-6">{selectedEmp.code}</p>
                  
                  <div className="grid grid-cols-1 gap-3 text-left">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[15px] text-slate-400 font-bold uppercase">Department</p>
                      <p className="text-md font-semibold">{selectedEmp.dept}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[15px] text-slate-400 font-bold uppercase">AADHAR ID</p>
                      <p className="text-md font-semibold text-slate-500">{selectedEmp.accountdetails1}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">Please select an employee<br/>to view details</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* SECTION: DATA & PAYMENT */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {filteredHold.length > 0 ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Accumulated Holdings</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">
                    {filteredHold.length} Records
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Period</th>
                        <th className="px-6 py-4">Bank Amt</th>
                        <th className="px-6 py-4">Cash Amt</th>
                        <th className="px-6 py-4 text-right">Row Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredHold.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-sm">{row.period}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">₹{row.holdamount}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">₹{row.chold}</td>
                          <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">₹{row.tot}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50/30 font-bold border-t border-indigo-100">
                        <td colSpan="3" className="px-6 py-4 text-indigo-900 text-sm text-right">Total Outstanding Balance:</td>
                        <td className="px-6 py-4 text-right text-indigo-600 text-lg">₹{grandTotal.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Payment Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={paidAmt}
                        onChange={(e) => setPaidAmt(e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 transition-all outline-none font-bold text-lg ${
                          isInvalidAmount 
                          ? 'border-red-200 bg-red-50 text-red-600' 
                          : 'border-slate-100 bg-slate-50 focus:border-indigo-400'
                        }`}
                        placeholder="0.00"
                        disabled={isAlreadySaved}
                      />
                    </div>
                    {isInvalidAmount && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">Amount exceeds grand total</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Payment Remarks</label>
                    <textarea
                      rows="1"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-400 outline-none resize-none"
                      placeholder="Add a note..."
                      disabled={isAlreadySaved}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 justify-between border-t border-slate-100 pt-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">Projected Balance</p>
                    <p className={`text-2xl font-black ${(grandTotal - (parseFloat(paidAmt) || 0)) < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                      ₹{(grandTotal - (parseFloat(paidAmt) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {isAlreadySaved ? (
                    <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-6 py-4 rounded-2xl border border-amber-200">
                      <span className="text-xl">🔒</span>
                      <p className="text-sm font-bold">Transaction Recorded. Choose another employee.</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                        isSaveDisabled 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      Process Payment
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">No Records Found</h3>
              <p className="text-slate-400 max-w-xs mx-auto">Select an employee from the left panel to load their history.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Hold;