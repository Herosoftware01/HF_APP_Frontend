import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Request = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const type = location.state?.type || 'incentive';
  const isIncentive = type === 'incentive';
  
  const theme = {
    primary: isIncentive ? 'emerald' : 'rose',
    bg: isIncentive ? 'bg-emerald-50' : 'bg-rose-50',
    border: isIncentive ? 'border-emerald-200' : 'border-rose-200',
    text: isIncentive ? 'text-emerald-700' : 'text-rose-700',
    button: isIncentive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700',
    ring: isIncentive ? 'focus:ring-emerald-500' : 'focus:ring-rose-500'
  };

  const [activeTab, setActiveTab] = useState('staff');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [imgError, setImgError] = useState(false);

  const [date] = useState(() => new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [jobNo, setJobNo] = useState('');
  const [reason, setReason] = useState('');
  const [purposeList, setPurposeList] = useState([]);

  const amountLabel = isIncentive ? 'Incentive Amount' : 'Debit Amount';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, empRes, purposeRes] = await Promise.all([
          fetch('https://app.herofashion.com/incentive/api/staff/'),
          fetch('https://app.herofashion.com/incentive/api/emp/'),
          fetch('https://app.herofashion.com/incentive/api/incdeb_purpose/'),
        ]);

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffList(staffData.map((rec) => ({
            value: rec.code,
            code: rec.code,
            empName: rec.name,
            label: `${rec.code} - ${rec.name}`,
            photo: rec.photo,
            dept: rec.dept,
            designation: rec.designation,
          })));
        }

        if (empRes.ok) {
          const empData = await empRes.json();
          setEmpList(empData.map((rec) => ({
            value: rec.code,
            code: rec.code,
            empName: rec.name,
            label: `${rec.code} - ${rec.name}`,
            photo: rec.photo,
            dept: rec.dept,
            designation: rec.designation,
          })));
        }

        if (purposeRes.ok) {
          const pData = await purposeRes.json();
          setPurposeList(pData);
        }
      } catch (error) {
        toast.error('Failed to load employee data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedEmp(null);
    setImgError(false);
    setPurpose('');
  }, [activeTab]);

  const employeeOptions = activeTab === 'staff' ? staffList : empList;

  const handleClearFields = () => {
    setSelectedEmp(null);
    setPurpose('');
    setAmount('');
    setJobNo('');
    setReason('');
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const purposeOptions = purposeList
    .filter((p) => p.ste === (activeTab === 'staff' ? 'Staff' : 'Employee') && p.type === (isIncentive ? 'Incentive' : 'Debit'))
    .map((p) => p.purpose);

  const handleSubmit = async () => {
    if (!selectedEmp || !purpose || !amount || !reason) {
      toast.warn('Please fill in all required fields.');
      return;
    }
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const payload = {
      req_type: formattedType,
      code: selectedEmp.code,
      name: selectedEmp.empName,
      dept_unit: selectedEmp.dept,
      design_category: selectedEmp.designation,
      purpose,
      amt: parseInt(amount, 10),
      jobno: jobNo,
      reason,
      req_dt: date,
      status: 'Pending',
    };

    try {
      const res = await fetch('https://app.herofashion.com/incentive/api/incdeb/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} submitted!`);
        handleClearFields();
      } else {
        toast.error('Submission failed.');
      }
    } catch (err) {
      toast.error('Network error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-10 font-sans overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-10 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {type} <span className={theme.text}>Submission</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage internal personnel requests.</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">{formatDate(date)}</span>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Grid: order-1 on Profile ensures it is on top for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Selection & Profile */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-1 lg:sticky lg:top-6">
            {/* Tab Switcher */}
            <div className="bg-slate-200/60 p-1 rounded-2xl flex">
              {['staff', 'employee'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    activeTab === tab ? `bg-white ${theme.text} shadow-md` : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className={`h-32 lg:h-40 ${theme.bg} border-b ${theme.border} flex items-end justify-center`}>
                <div className="relative translate-y-10 lg:translate-y-12">
                   <div className="w-32 h-36 lg:w-40 lg:h-48 rounded-2xl border-4 border-white bg-slate-100 shadow-md overflow-hidden flex items-center justify-center">
                    {selectedEmp && !imgError && selectedEmp.photo ? (
                      <img src={selectedEmp.photo} alt="User" className="w-full h-full" onError={() => setImgError(true)} />
                    ) : (
                      <div className="text-4xl font-bold text-slate-300 uppercase">
                        {selectedEmp?.empName?.charAt(0) || '?'}
                      </div>
                    )}
                   </div>
                </div>
              </div>
              
              <div className="pt-14 lg:pt-16 pb-6 px-6 text-center">
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 truncate">
                  {selectedEmp?.empName || 'Select Personnel'}
                </h3>
                <p className="text-xs font-medium text-slate-500 mb-6">
                  {selectedEmp?.code ? `#${selectedEmp.code}` : 'No code assigned'}
                </p>

                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{selectedEmp?.dept || '—'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Designation</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 truncate">{selectedEmp?.designation || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="lg:col-span-8 order-2 lg:order-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Search Employee</label>
                  <Select
                    options={employeeOptions}
                    value={selectedEmp}
                    onChange={setSelectedEmp}
                    placeholder="Search by code or name..."
                    className="text-sm"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '14px',
                        minHeight: '48px',
                        border: '1px solid #e2e8f0',
                        boxShadow: 'none',
                        '&:hover': { border: '1px solid #cbd5e1' }
                      })
                    }}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Purpose</label>
                  <select
                    className={`w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 ${theme.ring} transition-all appearance-none`}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    <option value="">Select Purpose</option>
                    {purposeOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:col-span-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{amountLabel}</label>
                    <input
                      type="number"
                      className={`w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 ${theme.ring}`}
                      value={amount}
                      placeholder="0.00"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Job No</label>
                    <input
                      type="text"
                      className={`w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 ${theme.ring}`}
                      value={jobNo}
                      placeholder="Opt."
                      onChange={(e) => setJobNo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Reason / Justification</label>
                  <textarea
                    rows="4"
                    className={`w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 ${theme.ring}`}
                    placeholder="Provide a detailed reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubmit}
                  className={`flex-[2] py-3.5 text-sm lg:text-base text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 ${theme.button}`}
                >
                  Confirm Request
                </button>
                <button
                  onClick={handleClearFields}
                  className="flex-1 py-3.5 text-sm bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Request;