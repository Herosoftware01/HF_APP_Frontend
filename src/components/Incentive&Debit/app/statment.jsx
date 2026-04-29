import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Icons
const IconSearch = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconPrint = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const IconReset = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;

const Statement = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // API-side filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Client-side search
  const [searchNameCode, setSearchNameCode] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [searchJobNo, setSearchJobNo] = useState("");

  const formatIndianDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = [];
    if (fromDate) query.push(`from_date=${fromDate}`);
    if (toDate) query.push(`to_date=${toDate}`);
    if (statusFilter) query.push(`status=${statusFilter}`);

    const url = "https://app.herofashion.com/incentive/api/incdeb-status/" + (query.length ? `?${query.join("&")}` : "");

    try {
      const res = await fetch(url);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "https://roll.herofashion.com/home1";
    }
  };

  const filteredRows = useMemo(() => {
    const q1 = searchNameCode.toLowerCase().trim();
    const q2 = searchDept.toLowerCase().trim();
    const q3 = searchJobNo.toLowerCase().trim();
    const statusNorm = statusFilter.toLowerCase().trim();
    const typeNorm = typeFilter.toLowerCase().trim();

    const filtered = rows.filter((r) => {
      const name = String(r.name || "").toLowerCase();
      const code = String(r.code || "").toLowerCase();
      const dept = String(r.dept_unit || "").toLowerCase();
      const purpose = String(r.purpose || "").toLowerCase();
      const jobno = String(r.jobno || "").toLowerCase();
      const rowStatus = String(r.status || "").toLowerCase().trim();
      const rowType = String(r.req_type || "").toLowerCase().trim();

      const matchesNameCode = !q1 || name.includes(q1) || code.includes(q1);
      const matchesDeptPurpose = !q2 || dept.includes(q2) || purpose.includes(q2);
      const matchesJobNo = !q3 || jobno.includes(q3);
      const matchesStatus = !statusNorm || rowStatus.includes(statusNorm);
      const matchesType = !typeNorm || rowType.includes(typeNorm);

      return matchesNameCode && matchesDeptPurpose && matchesJobNo && matchesStatus && matchesType;
    });

    return [...filtered].reverse();
  }, [rows, searchNameCode, searchDept, searchJobNo, statusFilter, typeFilter]);

  const getDynamicTitle = () => {
    if (typeFilter === "debit") return "Debit Status";
    if (typeFilter === "incentive") return "Incentive Status";
    return "Incentive & Debit Report";
  };

  const clearFilters = () => {
    setFromDate(""); setToDate(""); setStatusFilter(""); setTypeFilter("");
    setSearchNameCode(""); setSearchDept(""); setSearchJobNo("");
  };

  const handlePrint = () => {
    const table = document.getElementById("statementTable");
    if (!table) return;
    const title = getDynamicTitle();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px;}</style></head><body><h1>${title}</h1>${table.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : "";
    let classes = "bg-slate-100 text-slate-600 border-slate-300";
    if (s.includes("approve")) classes = "bg-emerald-100 text-emerald-800 border-emerald-300";
    else if (s.includes("pending")) classes = "bg-amber-100 text-amber-800 border-amber-300";
    else if (s.includes("reject")) classes = "bg-rose-100 text-rose-800 border-rose-300";

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col bg-slate-100 font-sans text-slate-800">
      
      {/* HEADER */}
      <header className="bg-[#8498d6] text-white shadow-md sticky top-0 z-30">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base md:text-lg font-bold uppercase tracking-wider">{getDynamicTitle()}</h1>
            <p className="text-sm text-indigo-100">{filteredRows.length} Records Found</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 bg-indigo-700 rounded md:px-4 md:py-2 text-sm flex items-center gap-2 font-bold uppercase"><IconPrint /> <span className="hidden md:inline">Print</span></button>
            <button onClick={clearFilters} className="p-2 bg-rose-600 rounded md:px-4 md:py-2 text-sm flex items-center gap-2 font-bold uppercase"><IconReset /> <span className="hidden md:inline">Reset</span></button>
            <button onClick={handleBack} className="p-2 bg-gray-500 rounded md:px-4 md:py-2 text-sm flex items-center gap-2 font-bold uppercase"><IconArrowLeft /> <span className="hidden md:inline">Back</span></button>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">From</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 px-2 border rounded text-sm outline-none w-full" />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">To</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 px-2 border rounded text-sm outline-none w-full" />
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 px-2 border rounded text-sm outline-none w-full">
                    <option value="">All Type</option>
                    <option value="incentive">Incentive</option>
                    <option value="debit">Debit</option>
                </select>
            </div>
            <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-2 border rounded text-sm outline-none w-full">
                    <option value="">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Search User</label>
                <input type="text" placeholder="Name/Code" value={searchNameCode} onChange={(e) => setSearchNameCode(e.target.value)} className="h-9 px-2 border rounded text-sm outline-none w-full" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dept/Purpose</label>
                <input type="text" placeholder="Dept..." value={searchDept} onChange={(e) => setSearchDept(e.target.value)} className="h-9 px-2 border rounded text-sm outline-none w-full" />
            </div>
            <div className="flex flex-col col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Job No</label>
                <input type="text" placeholder="Job No..." value={searchJobNo} onChange={(e) => setSearchJobNo(e.target.value)} className="h-9 px-2 border-indigo-200 bg-indigo-50 rounded text-sm outline-none w-full font-bold" />
            </div>
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="flex-1 p-4">
        {loading ? (
            <div className="text-center py-20 text-slate-500 animate-pulse font-bold">Loading Data...</div>
        ) : filteredRows.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic bg-white rounded border">No records found.</div>
        ) : (
          <>
            {/* MOBILE CARD VIEW (Shows on small screens) */}
            <div className="block lg:hidden space-y-4">
              {filteredRows.map((r) => (
                <div key={r.req_id} className="bg-white p-4 rounded-lg border-l-4 border-[#8498d6] shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px]  text-slate-400">#{r.req_id}</span>
                    {getStatusBadge(r.status)}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800">{r.name} <span className="text-sm font-normal text-slate-500">({r.code})</span></h3>
                    <span className={`text-sm font-black ${r.req_type?.toLowerCase() === 'incentive' ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{parseFloat(r.amt || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm border-t pt-2 mt-2">
                    <div><p className="text-slate-400 uppercase text-[9px]">Date</p><p className="font-medium">{formatIndianDate(r.req_dt)}</p></div>
                    <div><p className="text-slate-400 uppercase text-[9px]">Job No</p><p className="font-bold text-indigo-600">{r.jobno || "-"}</p></div>
                    <div><p className="text-slate-400 uppercase text-[9px]">Type</p><p className="capitalize font-semibold">{r.req_type}</p></div>
                    <div><p className="text-slate-400 uppercase text-[9px]">Dept</p><p className="truncate">{r.dept_unit}</p></div>
                    <div className="col-span-2"><p className="text-slate-400 uppercase text-[9px]">Purpose</p><p className="italic text-slate-600">{r.purpose || "-"}</p></div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (Hidden on small screens) */}
            <div className="hidden lg:block h-full bg-white border border-slate-300 rounded overflow-auto shadow-lg">
              <table id="statementTable" className="w-full border-collapse text-left">
                <thead className="bg-slate-800 text-slate-200 sticky top-0">
                  <tr>
                    {["ID", "Date", "Type", "Code", "Name", "Dept", "Category", "Purpose", "Job No", "Amount", "Reason", "Approve Dt", "Status"].map((h) => (
                      <th key={h} className="px-3 py-3 text-[11px] font-bold uppercase border-b border-slate-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-calibri">
                  {filteredRows.map((r, i) => (
                    <tr key={r.req_id} className={`hover:bg-indigo-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="px-3 py-2 text-sm text-slate-400 ">{r.req_id}</td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">{formatIndianDate(r.req_dt)}</td>
                      <td className="px-3 py-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${r.req_type?.toLowerCase() === 'incentive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{r.req_type}</span>
                      </td>
                      <td className="px-3 py-2 text-sm ">{r.code}</td>
                      <td className="px-3 py-2 text-sm font-bold text-slate-800">{r.name}</td>
                      <td className="px-3 py-2 text-sm">{r.dept_unit}</td>
                      <td className="px-3 py-2 text-sm truncate max-w-[100px]">{r.design_category}</td>
                      <td className="px-3 py-2 text-sm truncate max-w-[150px]">{r.purpose || "-"}</td>
                      <td className="px-3 py-2 text-sm text-indigo-600 font-bold">{r.jobno || "-"}</td>
                      <td className="px-3 py-2 text-sm font-bold ">₹{parseFloat(r.amt || 0).toLocaleString("en-IN")}</td>
                      <td className="px-3 py-2 text-sm truncate max-w-[150px]">{r.reason || "-"}</td>
                      <td className="px-3 py-2 text-sm whitespace-nowrap">{formatIndianDate(r.status_dt)}</td>
                      <td className="px-3 py-2 text-sm text-center">{getStatusBadge(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statement;