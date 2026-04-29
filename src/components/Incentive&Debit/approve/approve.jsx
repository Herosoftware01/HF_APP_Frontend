import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Approve = () => {
  const [requests, setRequests] = useState([]);
  const [photos, setPhotos] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [tempAmount, setTempAmount] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/home";
    }
  };

  const fetchAllData = async () => {
    try {
      const [incdebRes, staffRes, empRes] = await Promise.all([
        fetch("https://app.herofashion.com/incentive/api/incdeb/"),
        fetch("https://app.herofashion.com/incentive/api/staff/"),
        fetch("https://app.herofashion.com/incentive/api/emp/"),
      ]);

      const incdebData = await incdebRes.json();
      const staffData = await staffRes.json();
      const empData = await empRes.json();

      const photoMap = {};
      [...staffData, ...empData].forEach((item) => {
        if (item.code) photoMap[item.code] = item.photo;
      });

      setPhotos(photoMap);
      setRequests(incdebData.filter((item) => item.status === "Pending"));
    } catch (error) {
      toast.error("Failed to load request data");
    }
  };

  const startEditing = (id, currentAmount) => {
    setEditingId(id);
    setTempAmount(currentAmount);
  };

  // UPDATED: Now sends the new amount to the database
  const saveEditedAmount = async (id) => {
    try {
      const requestToUpdate = requests.find((req) => req.req_id === id);
      
      const res = await fetch(`https://app.herofashion.com/incentive/api/incdeb/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestToUpdate, // Keep existing data
          amt: parseInt(tempAmount, 10), // Update with new amount
        }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req.req_id === id ? { ...req, amt: tempAmount } : req
          )
        );
        setEditingId(null);
        toast.success("Amount updated successfully");
      } else {
        toast.error("Failed to save amount to server");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const updateRequestStatus = async (req_id, newStatus, finalAmount) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const res = await fetch(`https://app.herofashion.com/incentive/api/incdeb/${req_id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          status_dt: currentDate,
          amt: parseInt(finalAmount, 10),
        }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((item) => item.req_id !== req_id));
        newStatus === "Approved"
          ? toast.success("Request Approved")
          : toast.warn("Request Rejected");
      }
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      <div className=" mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Approvals Portal</h1>
            <p className="text-slate-500 font-medium">Manage pending incentive and debit claims</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <div className="px-4 py-2">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Pending</p>
                <p className="text-xl font-black text-indigo-600 leading-none">{requests.length}</p>
              </div>
              <div className="h-8  bg-slate-100 mx-2"></div>
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Grid Layout */}
        <div className="grid gap-4 md:hidden">
          {requests.map((item) => (
            <div key={item.req_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.req_type === "incentive" ? "bg-indigo-500" : "bg-rose-500"}`} />
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <img src={photos[item.code] || "/default-user.png"} className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-50" alt="profile" />
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                      {item.code} • {item.dept_unit}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Amount</p>
                    <p className="font-black text-xl text-slate-800">₹{item.amt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-black uppercase ${item.req_type === "incentive" ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"}`}>
                      {item.req_type}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => updateRequestStatus(item.req_id, "Approved", item.amt)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition-colors">
                    Approve
                  </button>
                  <button onClick={() => updateRequestStatus(item.req_id, "Rejected", item.amt)} className="flex-1 bg-white border border-slate-200 text-rose-600 py-3 rounded-xl text-sm font-bold hover:bg-rose-50 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Employee Details</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Department</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Purpose/Reason</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map((item) => (
                <tr key={item.req_id} className="group hover:bg-indigo-50/30 transition-all">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={photos[item.code] || "/default-user.png"} className="w-20 h-20 rounded-2xl border-2 border-white shadow-sm" alt="profile" />
                      <div>
                        <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-700 transition-colors">{item.name}</p>
                        <p className="text-xs font-semibold text-slate-400">{item.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{item.dept_unit}</span>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`text-[11px] px-3 py-1.5 rounded-full font-black uppercase tracking-tight ${item.req_type === "incentive" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"}`}>
                      {item.req_type}
                    </span>
                  </td>
                  <td className="p-6">
                    {editingId === item.req_id ? (
                      <div className="flex items-center gap-2 bg-white border border-indigo-200 p-1 rounded-lg">
                        <input type="number" className="w-20 outline-none px-2 font-bold text-indigo-600" value={tempAmount} onChange={(e) => setTempAmount(e.target.value)} autoFocus />
                        <button onClick={() => saveEditedAmount(item.req_id)} className="bg-green-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-green-700">
                          ✓
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-slate-300">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-black text-slate-800 text-lg">
                        ₹{item.amt}
                        <button onClick={() => startEditing(item.req_id, item.amt)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-400 hover:text-indigo-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <p className="text-[15px] text-slate-500 font-medium max-w-50 leading-relaxed">
                      <span className="block text-[12px] font-bold text-slate-400 uppercase tracking-tighter">{item.purpose}</span>
                      {item.reason}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => updateRequestStatus(item.req_id, "Approved", item.amt)} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-100">
                        Approve
                      </button>
                      <button onClick={() => updateRequestStatus(item.req_id, "Rejected", item.amt)} className="px-6 py-3 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl text-sm font-bold transition-all">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-slate-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">All caught up!</h3>
            <p className="text-slate-400 font-medium">No pending approval requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approve;