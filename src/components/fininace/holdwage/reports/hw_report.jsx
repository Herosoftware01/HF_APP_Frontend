import React, { useEffect, useState, useCallback } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from 'react-router-dom';

const HwReport = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('https://hfapi.herofashion.com/reports/report/')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Search Filtering
  useEffect(() => {
    const filtered = data.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.accountdetails1?.toString().includes(searchTerm) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) return;

    const formattedData = filteredData.map((item) => ({
      "S.No": item.rownum,
      "Aadhaar No": item.accountdetails1,
      "Code": item.code,
      "Name": item.name,
      "Period": item.period,
      "Hold Amount": Number(item.holdamount),
      "Current Hold": Number(item.chold),
      "Total": Number(item.tot),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hold Wage Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Hold_Wage_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hold Wage Report
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and track held employee wages and account details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={exportToExcel}
              disabled={loading || filteredData.length === 0}
              className="inline-flex items-center bg-white border border-slate-300 cursor-pointer text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Excel
            </button>
            <button 
              onClick={fetchData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              Refresh Data
            </button>
            <button onClick={() => navigate(-1)} className="bg-white cursor-pointer text-slate-600 hover:bg-slate-50 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 border border-slate-200">
                  ← Back
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
          
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                🔍
              </span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, code" 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-80 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {filteredData.length} Records Found
              </span>
            </div>
          </div>

          {/* Table Area with Fixed Header */}
          <div className="flex-1 overflow-auto relative custom-scrollbar">
            <table className="min-w-full table-auto border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
                <tr className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">S.No</th>
                  <th className="px-6 py-3">Aadhaar No</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3 text-right">Hold Amt</th>
                  <th className="px-6 py-3  text-right">Current</th>
                  <th className="px-6 py-3  text-right">Total</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="8" className="px-6 py-4 border-b h-12 bg-slate-50/50"></td>
                    </tr>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4 text-xs text-slate-500">{item.rownum}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.accountdetails1}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.period}</td>
                      <td className="px-6 py-4 text-sm text-right tabular-nums text-slate-600">
                        ₹{Number(item.holdamount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right tabular-nums text-slate-600">
                        ₹{Number(item.chold).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right tabular-nums font-bold text-indigo-700">
                        ₹{Number(item.tot).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl mb-2">📂</span>
                        <p className="text-sm">No records found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Status Footer */}
          <footer className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center shrink-0">
             <span className="text-[10px] font-medium text-slate-400 uppercase">
                Internal Payroll System
             </span>
             <span className="text-[10px] font-medium text-slate-400 italic">
                Last updated: {new Date().toLocaleTimeString()}
             </span>
          </footer>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default HwReport;