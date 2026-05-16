import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Approve = () => {
  const [requests, setRequests] = useState([]);
  const [photos, setPhotos] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [tempAmount, setTempAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incentive' | 'debit'
  const [processingId, setProcessingId] = useState(null); // Track API actions for loaders

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/home';
    }
  };

  const fetchAllData = async () => {
    try {
      const [incdebRes, staffRes, empRes] = await Promise.all([
        fetch('https://app.herofashion.com/incentive/api/incdeb/'),
        fetch('https://app.herofashion.com/incentive/api/staff/'),
        fetch('https://app.herofashion.com/incentive/api/emp/'),
      ]);

      const incdebData = await incdebRes.json();
      const staffData = await staffRes.json();
      const empData = await empRes.json();

      const photoMap = {};
      [...staffData, ...empData].forEach((item) => {
        if (item.code) photoMap[item.code] = item.photo;
      });

      setPhotos(photoMap);
      setRequests(incdebData.filter((item) => item.status === 'Pending'));
    } catch (error) {
      toast.error('Failed to load request data');
    }
  };

  const startEditing = (id, currentAmount) => {
    setEditingId(id);
    setTempAmount(currentAmount);
  };

  const saveEditedAmount = async (id) => {
    if (!tempAmount || isNaN(tempAmount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    setProcessingId(id);
    try {
      const requestToUpdate = requests.find((req) => req.req_id === id);

      const res = await fetch(
        `https://app.herofashion.com/incentive/api/incdeb/${id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...requestToUpdate,
            amt: parseInt(tempAmount, 10),
          }),
        }
      );

      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req.req_id === id ? { ...req, amt: parseInt(tempAmount, 10) } : req
          )
        );
        setEditingId(null);
        toast.success('Amount updated successfully');
      } else {
        toast.error('Failed to save amount to server');
      }
    } catch (error) {
      toast.error('Error connecting to server');
    } finally {
      setProcessingId(null);
    }
  };

  const updateRequestStatus = async (req_id, newStatus, finalAmount) => {
    setProcessingId(req_id);
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `https://app.herofashion.com/incentive/api/incdeb/${req_id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            status_dt: currentDate,
            amt: parseInt(finalAmount, 10),
          }),
        }
      );

      if (res.ok) {
        setRequests((prev) => prev.filter((item) => item.req_id !== req_id));
        newStatus === 'Approved'
          ? toast.success('Request Approved')
          : toast.warn('Request Rejected');
      } else {
        toast.error('Server rejected the action');
      }
    } catch (error) {
      toast.error('Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatIndianDate = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime())
      ? dateValue
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Modern Client-side Filter Logic
  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeFilter === 'all' || 
      item.req_type?.toLowerCase() === activeFilter;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 font-sans text-slate-900 antialiased">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Approvals Portal
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Manage pending staff incentive and debit claims
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Counter: <span className="text-indigo-600 text-sm font-black ml-1">{requests.length}</span>
              </p>
            </div>
            
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 cursor-pointer text-white rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </button>
          </div>
        </header>

        {/* Search, Filter, and Utility Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['all', 'incentive', 'debit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex-1 sm:flex-none ${
                  activeFilter === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}s
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mobile View Grid Card */}
        <div className="grid gap-4 md:hidden">
          {filteredRequests.map((item) => (
            <div
              key={item.req_id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.req_type === 'incentive' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={photos[item.code] || '/default-user.png'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                    alt="Profile"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 leading-snug">{item.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                      {item.code} • <span className="text-slate-500">{item.dept_unit}</span>
                    </p>
                  </div>
                </div>

                {/* Info Container */}
                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Amount</p>
                    {editingId === item.req_id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          className="w-20 border border-indigo-200 rounded px-1.5 py-0.5 font-bold text-indigo-600 bg-white text-sm"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => saveEditedAmount(item.req_id)} className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700">✓</button>
                        <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 p-1 rounded hover:bg-slate-300">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-800 text-base">₹{item.amt}</span>
                        <button onClick={() => startEditing(item.req_id, item.amt)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide ${
                      item.req_type === 'incentive' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.req_type}
                    </span>
                  </div>
                </div>

                {/* Purpose / Reason Details */}
                <div className="text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block tracking-tight">{item.purpose || 'No Purpose Specified'}</span>
                  <p className="text-slate-600 font-medium leading-relaxed">{item.reason}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-2">Date: {formatIndianDate(item.req_dt)}</p>
                </div>

                {/* Dynamic Actions Row */}
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={processingId !== null}
                    onClick={() => updateRequestStatus(item.req_id, 'Approved', item.amt)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
                  >
                    {processingId === item.req_id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    disabled={processingId !== null}
                    onClick={() => updateRequestStatus(item.req_id, 'Rejected', item.amt)}
                    className="flex-1 bg-white border border-slate-200 hover:bg-rose-50/50 disabled:opacity-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View Table View */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80">
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[25%]">Employee Details</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-[12%]">Department</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-[12%]">Type</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[15%]">Amount</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[23%]">Purpose / Reason</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[13%]">Request Date</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((item) => (
                <tr key={item.req_id} className="group hover:bg-slate-50/40 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={photos[item.code] || '/default-user.png'}
                        className="w-18 h-18 rounded-xl border border-slate-100 shadow-xs shrink-0"
                        alt="Profile"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 text-sm tracking-tight leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-400">{item.code}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-5 text-center">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/20">
                      {item.dept_unit}
                    </span>
                  </td>

                  <td className="p-5 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                      item.req_type === 'incentive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                    }`}>
                      {item.req_type}
                    </span>
                  </td>

                  <td className="p-5">
                    {editingId === item.req_id ? (
                      <div className="flex items-center gap-1.5 bg-white border border-indigo-300 p-1 rounded-xl max-w-35 shadow-xs">
                        <input
                          type="number"
                          className="w-full outline-none px-2 font-bold text-indigo-600 bg-transparent text-sm"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditedAmount(item.req_id)}
                          className="bg-emerald-600 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs hover:bg-emerald-700 shrink-0"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-slate-100 text-slate-500 w-6 h-6 rounded-lg flex items-center justify-center text-xs hover:bg-slate-200 shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-black text-slate-800 text-base">
                        <span>₹{item.amt}</span>
                        <button
                          onClick={() => startEditing(item.req_id, item.amt)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="p-5">
                    <div className="max-w-70">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">
                        {item.purpose || 'General Request'}
                      </span>
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed truncate group-hover:text-clip group-hover:whitespace-normal">
                        {item.reason}
                      </p>
                    </div>
                  </td>

                  <td className="p-5 text-xs font-bold text-slate-500">
                    {formatIndianDate(item.req_dt)}
                  </td>

                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        disabled={processingId !== null}
                        onClick={() => updateRequestStatus(item.req_id, 'Approved', item.amt)}
                        className="px-5 py-3 cursor-pointer bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-emerald-100 active:scale-95"
                      >
                        {processingId === item.req_id ? '...' : 'Approve'}
                      </button>
                      <button
                        disabled={processingId !== null}
                        onClick={() => updateRequestStatus(item.req_id, 'Rejected', item.amt)}
                        className="px-5 py-3 cursor-pointer bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Empty States (Handles clean initial and dynamic searches) */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">No requests found</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
                {requests.length === 0 
                  ? "Excellent work! All pending action pipelines are empty." 
                  : "We couldn't find any results matching your filters or search terms."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approve;