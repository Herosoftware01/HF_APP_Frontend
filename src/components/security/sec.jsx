import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Shield,
  Filter,
  Download,
  RotateCcw,
  ChevronLeft,
  Search,
} from 'lucide-react';

const Sec = () => {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    personCode: '',
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const formatLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const setMonthRange = (offset) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);

    setFilters((prev) => ({
      ...prev,
      dateFrom: formatLocal(firstDay),
      dateTo: formatLocal(lastDay),
      personCode: '', // Reset person when changing month
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://hfapi.herofashion.com//reports/security_list/'
        );
        const data = await response.json();
        setAllData(data);
        setMonthRange(0);
      } catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. First, find personnel available in the selected date range
  const availablePersonnel = useMemo(() => {
    const filteredByDate = allData.filter((item) => {
      const itemDate = item.date;
      return (
        (!filters.dateFrom || itemDate >= filters.dateFrom) &&
        (!filters.dateTo || itemDate <= filters.dateTo)
      );
    });

    const unique = [
      ...new Map(filteredByDate.map((m) => [m.code, m])).values(),
    ];
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [allData, filters.dateFrom, filters.dateTo]);

  // 2. Then apply the full filter for the table
  const filteredData = useMemo(() => {
    return allData.filter((item) => {
      const itemDate = item.date;
      const matchesDate =
        (!filters.dateFrom || itemDate >= filters.dateFrom) &&
        (!filters.dateTo || itemDate <= filters.dateTo);
      const matchesPerson =
        !filters.personCode || String(item.code) === filters.personCode;
      return matchesDate && matchesPerson;
    });
  }, [allData, filters]);

  const groupedData = useMemo(() => {
    const groups = {};
    filteredData.forEach((item) => {
      const key = `${item.date}_${item.code}`;
      if (!groups[key]) groups[key] = { ...item, records: [] };
      groups[key].records.push(item);
    });
    return Object.values(groups);
  }, [filteredData]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(
      wb,
      `Attendance_${filters.dateFrom}_to_${filters.dateTo}.xlsx`
    );
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 h-screen flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
              Security Attendance
            </h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hidden md:block">
              Real-time Monitoring Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full shadow-sm">
            {filteredData.length} Records Found
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden p-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`${isMobileFilterOpen ? 'grid' : 'hidden'} md:grid bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-4 grid-cols-1 md:grid-cols-4 gap-4 shrink-0 transition-all`}
      >
        <div className="relative">
          <label className="text-[11px] font-bold text-indigo-600 uppercase mb-1 block">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters({
                ...filters,
                dateFrom: e.target.value,
                personCode: '',
              })
            }
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-indigo-600 uppercase mb-1 block">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters({ ...filters, dateTo: e.target.value, personCode: '' })
            }
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-indigo-600 uppercase mb-1 block">
            Personnel{' '}
            <span className="text-slate-400">
              ({availablePersonnel.length} on selected dates)
            </span>
          </label>
          <select
            value={filters.personCode}
            onChange={(e) =>
              setFilters({ ...filters, personCode: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
          >
            <option value="">Search/Select Personnel</option>
            {availablePersonnel.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              const nextOffset = monthOffset - 1;
              setMonthOffset(nextOffset);
              setMonthRange(nextOffset);
            }}
            className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 font-bold py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={() => {
              setMonthOffset(0);
              setMonthRange(0);
              setFilters((f) => ({ ...f, personCode: '' }));
            }}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={exportToExcel}
            className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 flex justify-center items-center gap-2 text-sm shadow-sm transition-colors"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="hidden md:block overflow-y-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Personnel Details</th>
                <th className="p-4 text-center font-bold">Punch In</th>
                <th className="p-4 text-center font-bold">Punch Out</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {groupedData.length > 0 ? (
                groupedData.map((group) => (
                  <React.Fragment key={`${group.date}-${group.code}`}>
                    {group.records.map((rec, i) => (
                      <tr
                        key={i}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        {i === 0 && (
                          <>
                            <td
                              rowSpan={group.records.length}
                              className="p-4 font-semibold text-slate-600 bg-white border-r border-gray-50 align-top group-hover:bg-indigo-50/10"
                            >
                              {group.date}
                            </td>
                            <td
                              rowSpan={group.records.length}
                              className="p-4 bg-white border-r border-gray-50 align-top group-hover:bg-indigo-50/10"
                            >
                              <div className="font-bold text-gray-800 uppercase text-xs">
                                {group.name}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-50 inline-block px-1.5 py-0.5 rounded mt-1">
                                CODE: {group.code}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="p-4 text-center">
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                            {rec.intime?.substring(0, 5) || '--:--'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`font-mono font-bold px-3 py-1 rounded-md border ${rec.outtime ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}
                          >
                            {rec.outtime?.substring(0, 5) || '--:--'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Search size={48} className="mb-2" />
                      <p className="font-medium">
                        No attendance records found for these filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View remains similar but uses the dynamic grouped data */}
        <div className="md:hidden overflow-y-auto h-full p-4 bg-slate-50 space-y-4">
          {groupedData.map((group) => (
            <div
              key={`${group.date}-${group.code}`}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="font-bold text-gray-800 text-xs uppercase">
                    {group.name}
                  </div>
                  <div className="text-[10px] font-mono text-indigo-500 font-bold">
                    ID: {group.code}
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded shadow-sm">
                  {group.date}
                </span>
              </div>
              <div className="space-y-2">
                {group.records.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        In
                      </span>
                      <span className="font-mono font-bold text-emerald-600">
                        {r.intime?.substring(0, 5) || '--:--'}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Out
                      </span>
                      <span className="font-mono font-bold text-rose-600">
                        {r.outtime?.substring(0, 5) || '--:--'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sec;
