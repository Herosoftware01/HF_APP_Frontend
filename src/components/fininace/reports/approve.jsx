import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  CheckCircle, 
  ArrowLeft, 
  Filter, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MDApprovalDashboard = () => {
  // State Management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    total_records: 0,
    page: 1,
    num_pages: 1,
    has_next: false,
    has_previous: false
  });

  // Updated Filters State
  const [filters, setFilters] = useState({
    module: 'ALL',
    supplier: 'ALL',
    company: 'ALL',   // Added
    employees: 'ALL',
    mdapproval: '',
    from_date: '',
    to_date: ''
  });

  // Updated Unique Filter Options
  const [filterOptions, setFilterOptions] = useState({
    modules: [],
    suppliers: [],
    employees: [], // Added
    companies: []  // Added
  });

  const API_ENDPOINT = "https://hfapi.herofashion.com/reports/bill_mdapprove/";

  const fetchData = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        module: filters.module,
        supplier: filters.supplier,
        company: filters.company,   // Added to API params
        employees: filters.employees,
        mdapproval: filters.mdapproval,
        from_date: filters.from_date,
        to_date: filters.to_date
      };

      const response = await axios.get(API_ENDPOINT, { params });
      
      const results = response.data.results || [];
      setData(results);
      setMeta({
        total_records: response.data.total_records || 0,
        page: response.data.page || 1,
        num_pages: response.data.num_pages || 1,
        has_next: response.data.has_next,
        has_previous: response.data.has_previous
      });

      // Dynamically extract unique values for dropdowns from the current result set
      if (results.length > 0) {
        setFilterOptions({
          modules: [...new Set(results.map(i => i.module1).filter(Boolean))],
          suppliers: [...new Set(results.map(i => i.supplier).filter(Boolean))].sort(),
          employees: [...new Set(results.map(i => i.employees).filter(Boolean))].sort(),
          companies: [...new Set(results.map(i => i.company).filter(Boolean))].sort(),
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const resetFilters = () => {
    setFilters({
      module: 'ALL',
      supplier: 'ALL',
      incharge: 'ALL',
      company: 'ALL',
      employees: 'ALL',
      mdapproval: '',
      from_date: '',
      to_date: ''
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approval Report");
    XLSX.writeFile(wb, "MD_Approval_Report.xlsx");
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';
  const fmtMoney = (m) => m ? '₹ ' + parseFloat(m).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      <nav className="bg-white border-b border-slate-200 z-30 flex-none print:hidden">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">MD Approval</h1>
                <p className="text-xs text-slate-500 font-medium">Financial Overview & Status</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Updated Filter Bar */}
      <div className="hidden lg:block bg-white border-b border-slate-200 shadow-sm z-20 flex-none print:hidden">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-end gap-3 flex-wrap">
            
            {/* Bill Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Bill Type</label>
              <select id="module" value={filters.module} onChange={handleFilterChange} className="w-32 text-sm border-slate-300 rounded-md bg-slate-50 p-1.5 outline-indigo-500">
                <option value="ALL">All Types</option>
                {filterOptions.modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Supplier</label>
              <select id="supplier" value={filters.supplier} onChange={handleFilterChange} className="w-40 text-sm border-slate-300 rounded-md bg-slate-50 p-1.5 outline-indigo-500">
                <option value="ALL">All Suppliers</option>
                {filterOptions.suppliers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Incharge Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Incharge</label>
              <select id="incharge" value={filters.employees} onChange={handleFilterChange} className="w-36 text-sm border-slate-300 rounded-md bg-slate-50 p-1.5 outline-indigo-500">
                <option value="ALL">All Incharge</option>
                {filterOptions.employees.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* Company Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Company</label>
              <select id="company" value={filters.company} onChange={handleFilterChange} className="w-36 text-sm border-slate-300 rounded-md bg-slate-50 p-1.5 outline-indigo-500">
                <option value="ALL">All Company</option>
                {filterOptions.companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* MD Approval Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">MD Status</label>
              <select id="mdapproval" value={filters.mdapproval} onChange={handleFilterChange} className="w-28 text-sm border-slate-300 rounded-md bg-slate-50 p-1.5 outline-indigo-500">
                <option value="">All Status</option>
                <option value="Yes">Approved</option>
                <option value="No">Not Approved</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-300">
              <input type="date" id="from_date" value={filters.from_date} onChange={handleFilterChange} className="bg-transparent text-xs font-medium text-slate-700 p-1" />
              <span className="text-slate-400 text-xs">to</span>
              <input type="date" id="to_date" value={filters.to_date} onChange={handleFilterChange} className="bg-transparent text-xs font-medium text-slate-700 p-1" />
            </div>

            <button onClick={resetFilters} className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 flex items-center gap-1">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (Table) */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-8xl mx-auto overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Stats */}
        <div className="flex-none p-4 sm:px-6 lg:px-8 z-10 bg-slate-100 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Bills</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{meta.total_records}</h3>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <Filter size={24} />
              </div>
            </div>
            
            <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Calendar size={20} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Report Date</p>
                  <p className="text-base font-bold text-slate-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <FileSpreadsheet size={18} /> Export Excel
                </button>
                <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                  <Printer size={18} /> Print
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 overflow-hidden">
          <div className="h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-300">
                  <tr>
                    {["SL", "Bill Date", "Type", "Supplier", "Incharge","Company", "Bill No", "Status", "Amount"].map((header) => (
                      <th key={header} className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200 last:border-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length > 0 ? data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors text-sm">
                      <td className="px-4 py-3 text-slate-500">{item.no}</td>
                      <td className="px-4 py-3">{fmtDate(item.billdate)}</td>
                      <td className="px-4 py-3 truncate max-w-[100px]">{item.module1}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.supplier}</td>
                      <td className="px-4 py-3">{item.employees || '-'}</td>
                      <td className="px-4 py-3">{item.company || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.billno}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.md_status === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.md_status?.toUpperCase() || 'NO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700 font-mono">{fmtMoney(item.amount)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="9" className="text-center py-20 text-slate-400">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex-none border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between print:hidden">
              <div className="text-sm text-slate-500 font-medium">Page {meta.page} of {meta.num_pages}</div>
              <div className="flex items-center gap-2">
                <button disabled={!meta.has_previous} onClick={() => fetchData(meta.page - 1)} className={`p-2 border rounded-md ${!meta.has_previous ? 'bg-slate-100 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600'}`}>
                  <ChevronLeft size={20} />
                </button>
                <button disabled={!meta.has_next} onClick={() => fetchData(meta.page + 1)} className={`p-2 border rounded-md ${!meta.has_next ? 'bg-slate-100 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600'}`}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          table { border: 1px solid #000 !important; width: 100% !important; }
          th, td { border: 1px solid #ddd !important; font-size: 8px !important; padding: 4px !important; }
        }
      `}} />
    </div>
  );
};

export default MDApprovalDashboard;