import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  PieChart,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Filter,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bill = () => {
  // Data States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  // Sorting State (Sent to Backend)
  const [sortConfig, setSortConfig] = useState({
    key: 'aging',
    direction: 'desc',
  });

  // Filter States (Keys match your original Django form names)
  const [filters, setFilters] = useState({
    module: 'ALL',
    employees: 'ALL',
    supplier: 'ALL',
    company: 'ALL',
    from_date: '',
    to_date: '',
    edate_from: '',
    edate_to: '',
  });

  // 1. Optimized Fetch Function (Backend Filtering & Sorting)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Only append filters that are not default "ALL" or empty
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'ALL' && value !== '') {
          params.append(key, value);
        }
      });

      // Backend Sorting: Use '-' prefix for descending (standard Django REST practice)
      const sortValue =
        sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key;
      params.append('ordering', sortValue);

      const response = await fetch(
        `https://hfapi.herofashion.com/reports/bill_age/?${params.toString()}`
      );
      const result = await response.json();

      setData(result.results || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig]);

  // Trigger fetch on filter or sort change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Summary Stats (Calculated from current result set)
  const stats = useMemo(() => {
    return data.reduce(
      (acc, curr) => {
        const age = curr.aging || 0;
        if (age < 3) acc.normal++;
        else if (age === 3) acc.risk++;
        else acc.highRisk++;
        return acc;
      },
      { normal: 0, risk: 0, highRisk: 0 }
    );
  }, [data]);

  // 3. Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const resetFilters = () => {
    setFilters({
      module: 'ALL',
      employees: 'ALL',
      supplier: 'ALL',
      company: 'ALL',
      from_date: '',
      to_date: '',
      edate_from: '',
      edate_to: '',
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AgingReport');
    XLSX.writeFile(
      wb,
      `Aging_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // 4. UI Helpers
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '-');
  const fmtCurr = (a) =>
    a
      ? '₹' +
        parseFloat(a).toLocaleString('en-IN', { minimumFractionDigits: 2 })
      : '-';

  const getAgingBadge = (days) => {
    if (days === null || days === undefined)
      return <span className="text-slate-400">-</span>;
    let color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (days === 3) color = 'bg-amber-100 text-amber-800 border-amber-200';
    if (days > 3) color = 'bg-rose-100 text-rose-800 border-rose-200';
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border w-20 text-center ${color}`}
      >
        {days} Days
      </span>
    );
  };

  // Dynamic dropdown options extracted from current data
  const uniqueItems = (key) =>
    [...new Set(data.map((item) => item[key]))].filter(Boolean).sort();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 z-30 flex-none shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <PieChart className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                  Bill Aging Dashboard
                </h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                  Performance Optimized
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-500 cursor-pointer hover:text-indigo-600 font-medium text-sm transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* DESKTOP FILTERS */}
      <div className="hidden lg:block bg-white border-b border-slate-200 shadow-sm z-20 flex-none">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-end gap-3 flex-wrap">
            {/* Bill Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                Bill Type
              </label>
              <select
                name="module"
                value={filters.module}
                onChange={handleFilterChange}
                className="w-32 text-sm border-slate-300 rounded-md bg-slate-50 focus:ring-indigo-500"
              >
                <option value="ALL">All Types</option>
                {uniqueItems('module').map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Incharge */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                Incharge
              </label>
              <select
                name="employees"
                value={filters.employees}
                onChange={handleFilterChange}
                className="w-32 text-sm border-slate-300 rounded-md bg-slate-50 focus:ring-indigo-500"
              >
                <option value="ALL">All Staff</option>
                {uniqueItems('employee').map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                Supplier
              </label>
              <select
                name="supplier"
                value={filters.supplier}
                onChange={handleFilterChange}
                className="w-40 text-sm border-slate-300 rounded-md bg-slate-50 focus:ring-indigo-500"
              >
                <option value="ALL">All Suppliers</option>
                {uniqueItems('supplier').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Bill Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                Bill Date
              </label>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-300">
                <input
                  type="date"
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  className="border-0 bg-transparent text-xs p-1 w-[110px] focus:ring-0"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  className="border-0 bg-transparent text-xs p-1 w-[110px] focus:ring-0"
                />
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
        {/* STATS CARDS */}
        <div className="flex-none grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Records
              </p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {data.length}
              </h3>
              <p className="text-xs text-indigo-500 mt-1 font-semibold">
                Active Bills
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-500">
                Risk Assessment
              </p>
              <span className="text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                {new Date().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {stats.normal}
                </p>
                <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">
                  Normal
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-amber-700">{stats.risk}</p>
                <p className="text-[9px] uppercase font-bold text-amber-600 tracking-wider">
                  Risk
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg text-center">
                <p className="text-lg font-bold text-rose-700">
                  {stats.highRisk}
                </p>
                <p className="text-[9px] uppercase font-bold text-rose-600 tracking-wider">
                  High Risk
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="hidden lg:flex flex-col min-h-0 bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden mb-6 relative">
          <div className="flex-none px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Aging Report Details
            </h2>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
          </div>

          <div className="flex-1 overflow-auto relative">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300 w-16 text-center">
                    SL
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300">
                    Bill Date
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300">
                    Entry Date
                  </th>

                  {/* Backend Sortable Column */}
                  <th
                    onClick={() => toggleSort('aging')}
                    className="px-4 py-3 text-xs font-bold text-indigo-600 uppercase border border-slate-300 text-center cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      Aging
                      {sortConfig.key === 'aging' ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300">
                    Incharge
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300">
                    Bill No
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase border border-slate-300 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading && (
                  <tr className="absolute inset-x-0 top-12 bottom-0 bg-white/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <td colSpan="10" className="border-none">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <span className="text-sm font-semibold text-slate-500">
                          Syncing with server...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {data.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-20 text-slate-400"
                    >
                      No records found for current filters.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-500 font-mono border border-slate-300 text-center">
                        {item.no}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 border border-slate-300">
                        {fmtDate(item.billdate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 border border-slate-300">
                        {fmtDate(item.edate)}
                      </td>
                      <td className="px-4 py-3 border border-slate-300 text-center">
                        {getAgingBadge(item.aging)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium border border-slate-300">
                        {item.module}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium border border-slate-300">
                        {item.supplier}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 border border-slate-300">
                        {item.employee}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono border border-slate-300">
                        {item.billno || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right font-mono border border-slate-300">
                        {fmtCurr(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
          {data.map((item, idx) => {
            const age = item.aging || 0;
            let colorClass =
              age < 3
                ? 'bg-emerald-500'
                : age === 3
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorClass}`}
                ></div>
                <div className="p-4 pl-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          #{item.no}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.module}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 truncate">
                        {item.supplier}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-bold text-slate-900 leading-none">
                        {fmtCurr(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Amount
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                        Bill No
                      </span>
                      <span className="text-slate-700 font-medium truncate block">
                        {item.billno || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                        Aging
                      </span>
                      <span className="text-slate-700 font-bold block">
                        {item.aging} Days
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                        Bill Date
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {fmtDate(item.billdate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">
                        Incharge
                      </span>
                      <span className="text-slate-700 font-medium truncate block">
                        {item.employee}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MOBILE FILTER TRIGGER */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* MOBILE FILTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Quick Filters</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Bill Type
                </label>
                <select
                  name="module"
                  value={filters.module}
                  onChange={handleFilterChange}
                  className="w-full border-slate-200 rounded-xl bg-slate-50 p-3"
                >
                  <option value="ALL">All Types</option>
                  {uniqueItems('module').map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Supplier
                </label>
                <select
                  name="supplier"
                  value={filters.supplier}
                  onChange={handleFilterChange}
                  className="w-full border-slate-200 rounded-xl bg-slate-50 p-3"
                >
                  <option value="ALL">All Suppliers</option>
                  {uniqueItems('supplier').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold"
            >
              Update View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill;
