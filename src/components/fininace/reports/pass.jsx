import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  ArrowLeft, 
  FileSpreadsheet, 
  FileDown, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  RotateCcw
} from 'lucide-react';

const API_BASE_URL = "https://hfapi.herofashion.com/reports/pass_age/";

const Pass = () => {
  const [data, setData] = useState({ 
    results: [], 
    stats: {}, 
    modules_list: [], //
    suppliers_list: [], 
    incharges_list: [] 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    page: 1,
    module: '',
    employees: 'ALL',
    supplier: 'ALL',
    payment_status: 'ALL',
    bill_from: '',
    bill_to: '',
    pay_from: '',
    pay_to: '',
    risk_category: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'ALL') params.append(key, value);
      });

      const response = await axios.get(`${API_BASE_URL}?${params.toString()}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to connect to the payment server.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const toggleRisk = (category) => {
    setFilters(prev => ({
      ...prev,
      risk_category: prev.risk_category === category ? '' : category,
      page: 1
    }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      module: '',
      employees: 'ALL',
      supplier: 'ALL',
      payment_status: 'ALL',
      bill_from: '',
      bill_to: '',
      pay_from: '',
      pay_to: '',
      risk_category: ''
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Aging Report");
    XLSX.writeFile(wb, `Aging_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';
  const fmtMoney = (m) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(m);

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 flex-none px-6 py-3 shadow-sm z-30">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-200 shadow-lg">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Payment Dashboard</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Finance Operations</p>
            </div>
          </div>
          <button className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-semibold transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </nav>

      {/* Advanced Filter Bar */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-20 flex-none">
        <div className="max-w-8xl mx-auto flex flex-wrap items-end gap-3">
          
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                <select 
                    name="module" 
                    value={filters.module} 
                    onChange={handleFilterChange} 
                    className="border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-slate-50 focus:ring-2 ring-indigo-500/20 outline-none w-32"
                >
                    <option value="">All Types</option>
                    {/* This now connects to the database values */}
                    {data.modules_list?.map(m => (
                    <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Supplier</label>
            <select name="supplier" value={filters.supplier} onChange={handleFilterChange} className="border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-slate-50 focus:ring-2 ring-indigo-500/20 outline-none w-40">
              <option value="ALL">All Suppliers</option>
              {data.suppliers_list?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Incharge</label>
            <select name="employees" value={filters.employees} onChange={handleFilterChange} className="border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-slate-50 focus:ring-2 ring-indigo-500/20 outline-none w-40">
              <option value="ALL">All Incharges</option>
              {data.incharges_list?.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
            <select name="payment_status" value={filters.payment_status} onChange={handleFilterChange} className="border border-slate-200 rounded-md px-2 py-1.5 text-xs bg-slate-50 focus:ring-2 ring-indigo-500/20 outline-none w-28">
              <option value="ALL">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Date Ranges */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Bill:</label>
            <input type="date" name="bill_from" value={filters.bill_from} onChange={handleFilterChange} className="bg-transparent text-xs outline-none" />
            <span className="text-slate-300">-</span>
            <input type="date" name="bill_to" value={filters.bill_to} onChange={handleFilterChange} className="bg-transparent text-xs outline-none" />
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-md border border-indigo-100">
            <label className="text-[10px] font-bold text-indigo-400 uppercase">Paid:</label>
            <input type="date" name="pay_from" value={filters.pay_from} onChange={handleFilterChange} className="bg-transparent text-xs outline-none" />
            <span className="text-slate-300">-</span>
            <input type="date" name="pay_to" value={filters.pay_to} onChange={handleFilterChange} className="bg-transparent text-xs outline-none" />
          </div>

          <button onClick={resetFilters} className="p-2 text-rose-300 hover:text-rose-500 transition-colors cursor-pointer" title="Reset Filters">
          Reset
          </button>
          
          <button onClick={exportToExcel} className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-md flex items-center gap-2 transition-all shadow-md active:scale-95 uppercase tracking-wider">
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex-none">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Volume</p>
              <h3 className="text-2xl font-black text-slate-800">{data.total_count || 0}</h3>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><FileDown size={24}/></div>
          </div>

          <div onClick={() => toggleRisk('Normal')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filters.risk_category === 'Normal' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-emerald-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-bold uppercase ${filters.risk_category === 'Normal' ? 'text-emerald-100' : 'text-slate-400'}`}>Normal (≤30d)</p>
                <h3 className="text-2xl font-black">{data.stats?.normal || 0}</h3>
              </div>
              <TrendingUp size={20} className={filters.risk_category === 'Normal' ? 'text-emerald-200' : 'text-emerald-500'}/>
            </div>
          </div>

          <div onClick={() => toggleRisk('Risk')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filters.risk_category === 'Risk' ? 'bg-amber-500 border-amber-500 text-white shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-amber-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-bold uppercase ${filters.risk_category === 'Risk' ? 'text-amber-100' : 'text-slate-400'}`}>Risk (31-45d)</p>
                <h3 className="text-2xl font-black">{data.stats?.risk || 0}</h3>
              </div>
              <AlertTriangle size={20} className={filters.risk_category === 'Risk' ? 'text-amber-100' : 'text-amber-500'}/>
            </div>
          </div>

          <div onClick={() => toggleRisk('High Risk')} className={`cursor-pointer p-4 rounded-xl border transition-all ${filters.risk_category === 'High Risk' ? 'bg-rose-600 border-rose-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 hover:border-rose-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-[10px] font-bold uppercase ${filters.risk_category === 'High Risk' ? 'text-rose-100' : 'text-slate-400'}`}>High Risk (&gt;45d)</p>
                <h3 className="text-2xl font-black">{data.stats?.high_risk || 0}</h3>
              </div>
              <AlertOctagon size={20} className={filters.risk_category === 'High Risk' ? 'text-rose-100' : 'text-rose-500'}/>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                <tr>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Sl</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Bill Date</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Paid Date</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase text-center">Aging</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase text-center">Type</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Supplier</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Incharge</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase">Bill No</th>
                  <th className="p-3 text-[10px] font-bold text-slate-500 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {error ? (
                  <tr><td colSpan="9" className="p-10 text-center text-rose-500 font-medium">{error}</td></tr>
                ) : data.results.length === 0 && !loading ? (
                  <tr><td colSpan="9" className="p-10 text-center text-slate-400">No records found.</td></tr>
                ) : (
                  data.results.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3 text-xs font-mono text-slate-400">{(data.start_index || 1) + idx}</td>
                      <td className="p-3 text-xs font-medium text-slate-600">{fmtDate(item.billdate)}</td>
                      <td className="p-3 text-xs font-medium text-slate-600">{fmtDate(item.paymentdate)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.calculated_aging <= 30 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          item.calculated_aging <= 45 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {item.calculated_aging} Days
                        </span>
                      </td>
                      <td className="p-3 text-xs font-bold text-slate-700">{item.module1}</td>
                      <td className="p-3 text-xs font-bold text-slate-700">{item.paymentstatus}</td>
                      <td className="p-3 text-xs font-bold text-slate-800 truncate max-w-[200px]">{item.suppliers}</td>
                      <td className="p-3 text-xs text-slate-600">{item.employees}</td>
                      <td className="p-3 text-xs font-mono text-indigo-600 font-bold uppercase">{item.billno}</td>
                      <td className="p-3 text-xs font-black text-slate-900 text-right">{fmtMoney(item.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium italic">
              Showing {data.start_index} to {data.end_index} of {data.total_count} records
            </span>
            <div className="flex gap-2">
              <button 
                disabled={!data.has_previous}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="p-1 px-3 border rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center px-4 text-xs font-bold text-indigo-600 bg-white border border-indigo-100 rounded-md shadow-sm">
                Page {data.page} / {data.total_pages}
              </div>
              <button 
                disabled={!data.has_next}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="p-1 px-3 border rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pass;