import React, { useState, useEffect, useCallback, useRef } from 'react';

const Fab_cut = () => {
  const getLocalYYYYMMDD = (dateObj = new Date()) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = getLocalYYYYMMDD();

  const getLastWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const lastMonday = new Date(now);
    
    lastMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    
    return {
      from: getLocalYYYYMMDD(lastMonday),
      to: getLocalYYYYMMDD(lastSunday),
    };
  };

  const generateDateRange = (from, to) => {
    const dates = [];
    const [fYear, fMonth, fDay] = from.split('-').map(Number);
    const [tYear, tMonth, tDay] = to.split('-').map(Number);
    
    let current = new Date(fYear, fMonth - 1, fDay);
    const end = new Date(tYear, tMonth - 1, tDay);
    
    while (current <= end) {
      dates.push(getLocalYYYYMMDD(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getItemDate = (item) => {
    const rawDate = item.date || item.dt || item.trans_date || item.voucher_date ||
      item.posting_date || item.entry_date || item.tdate || item.trn_date;
      
    if (!rawDate) return null;

    if (typeof rawDate === 'string' && (rawDate.includes('T') || rawDate.includes(':'))) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) return getLocalYYYYMMDD(d);
    }

    let dateStr = String(rawDate).split(' ')[0].split('T')[0];

    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  // ── FIX: Aggregate identical transactions so they don't duplicate visually ──
  const aggregateItems = (itemList) => {
    const result = [];
    itemList.forEach((item) => {
      const trnName = item.trn1 || '—';
      const existing = result.find((i) => i.trn1 === trnName);
      
      if (existing) {
        existing.nos += Number(item.nos) || 0;
        existing.pc += Number(item.pc) || 0;
        existing.mtr += Number(item.mtr) || 0;
        existing.wgt += Number(item.wgt) || 0;
      } else {
        result.push({
          ...item,
          trn1: trnName,
          nos: Number(item.nos) || 0,
          pc: Number(item.pc) || 0,
          mtr: Number(item.mtr) || 0,
          wgt: Number(item.wgt) || 0,
        });
      }
    });
    
    // Format numbers safely to avoid long decimals (e.g., 0.30000000004)
    return result.map((item) => ({
      ...item,
      nos: Number.isInteger(item.nos) ? item.nos : Number(item.nos.toFixed(3)),
      pc: Number.isInteger(item.pc) ? item.pc : Number(item.pc.toFixed(3)),
      mtr: Number.isInteger(item.mtr) ? item.mtr : Number(item.mtr.toFixed(3)),
      wgt: Number.isInteger(item.wgt) ? item.wgt : Number(item.wgt.toFixed(3)),
    }));
  };

  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('custom');

  const fabSliderRef = useRef(null);
  const cutSliderRef = useRef(null);
  const otherSliderRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://hfapi.herofashion.com/advance/fab_cut_report/?from_date=${fromDate}&to_date=${toDate}`
      );
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTodayFilter = () => {
    setActiveFilter('today');
    setFromDate(today);
    setToDate(today);
  };

  const handleLastWeekFilter = () => {
    const { from, to } = getLastWeekRange();
    setActiveFilter('lastWeek');
    setFromDate(from);
    setToDate(to);
  };

  const handleClear = () => {
    setActiveFilter('custom');
    setFromDate(today);
    setToDate(today);
  };

  const groupedByDate = data.reduce((acc, item) => {
    const key = getItemDate(item) || 'no-date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const groupedByDept = data.reduce((acc, item) => {
    if (!acc[item.dept]) acc[item.dept] = [];
    acc[item.dept].push(item);
    return acc;
  }, {});

  const isWeeklyView = activeFilter === 'lastWeek';
  const hasData = data.length > 0;
  
  const isRangeView = isWeeklyView || (fromDate !== toDate && activeFilter === 'custom');
  const allRangeDates = generateDateRange(fromDate, toDate);
  
  let dateKeys = isRangeView ? [...allRangeDates] : Object.keys(groupedByDate).sort();

  if (isRangeView) {
    Object.keys(groupedByDate).forEach(key => {
      if (!dateKeys.includes(key)) {
        dateKeys.push(key);
      }
    });
    dateKeys.sort((a, b) => {
      if (a === 'no-date') return 1;
      if (b === 'no-date') return -1;
      return a.localeCompare(b);
    });
  }

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'no-date') return 'Unknown Date';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const scrollItems = (direction, ref) => {
    if (ref?.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -360 : 360,
        behavior: 'smooth',
      });
    }
  };

  const renderDayCard = (dept, items, dateKey) => {
    const gradient =
      dept === 'FAB'
        ? 'from-blue-500 to-indigo-600'
        : dept === 'CUT'
        ? 'from-emerald-500 to-teal-600'
        : 'from-violet-500 to-purple-600';

    const accentText =
      dept === 'FAB' ? 'text-indigo-600' : dept === 'CUT' ? 'text-teal-600' : 'text-violet-600';

    const accentBg =
      dept === 'FAB' ? 'bg-indigo-50' : dept === 'CUT' ? 'bg-teal-50' : 'bg-violet-50';

    const accentBorder =
      dept === 'FAB' ? 'border-indigo-100' : dept === 'CUT' ? 'border-teal-100' : 'border-violet-100';

    return (
      <div
        key={dateKey}
        className="snap-center flex-shrink-0 w-[300px] sm:w-[330px]"
        style={{ scrollSnapAlign: 'center' }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

          <div className={`bg-gradient-to-br ${gradient} px-5 py-4 flex items-center justify-between relative overflow-hidden`}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '18px 18px',
              }}
            />
            <h3 className="text-white font-black text-3xl tracking-widest drop-shadow-md relative z-10">
              {dept}
            </h3>
            <span className="relative z-10 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {formatDate(dateKey)}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 flex-1">
            {items.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm font-medium">
                No records for this day
              </div>
            ) : (
              /* Use aggregateItems to sum duplicates automatically */
              aggregateItems(items).map((item, idx) => (
                <div key={idx} className="px-4 py-3 hover:bg-slate-50/70 transition-colors">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                    {item.trn1 || '—'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className={`${accentBg} border ${accentBorder} rounded-lg py-2 flex flex-col items-center`}>
                      <span className={`text-sm font-black ${accentText}`}>{item.nos ?? 0}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Nos</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg py-2 flex flex-col items-center">
                      <span className="text-sm font-black text-slate-700">{item.pc ?? 0}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">PCS</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg py-2 flex flex-col items-center">
                      <span className="text-sm font-black text-slate-700">{item.mtr ?? 0}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">MTR</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg py-2 flex flex-col items-center">
                      <span className="text-sm font-black text-slate-700">{item.wgt ?? 0}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">WGT</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const otherDepts = [
    ...new Set(
      data
        .filter((i) => !['FAB', 'CUT'].includes(i.dept?.toUpperCase()))
        .map((i) => i.dept?.toUpperCase())
    ),
  ];

  const renderDeptSlider = (dept, sliderRef) => {
    const barColor =
      dept === 'FAB' ? 'bg-indigo-500' : dept === 'CUT' ? 'bg-teal-500' : 'bg-violet-500';

    return (
      <div key={dept}>
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className={`w-3 h-8 ${barColor} rounded-full`} />
          <h2 className="text-xl font-black text-slate-800 tracking-wide">{dept} Records</h2>
          <span className="ml-1 bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {dateKeys.length} days
          </span>
        </div>

        <div className="relative group/slider">
          <button
            onClick={() => scrollItems('left', sliderRef)}
            className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2 hide-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {dateKeys.map((dateKey) => {
              const dayItems = (groupedByDate[dateKey] || []).filter(
                (i) => i.dept?.toUpperCase() === dept
              );
              return renderDayCard(dept, dayItems, dateKey);
            })}
          </div>

          <button
            onClick={() => scrollItems('right', sliderRef)}
            className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              title="Go Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Fab Cut Report</h1>
              <p className="text-xs text-slate-500 mt-0.5">View and analyze fabric cutting data</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={handleTodayFilter}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeFilter === 'today'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={handleLastWeekFilter}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeFilter === 'lastWeek'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Last Week
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setActiveFilter('custom'); }}
                className="bg-transparent border-none p-1 text-sm outline-none text-slate-700 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setActiveFilter('custom'); }}
                className="bg-transparent border-none p-1 text-sm outline-none text-slate-700 cursor-pointer"
              />
            </div>

            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {isRangeView ? (
          <div>
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Fetching report data...</span>
              </div>
            ) : (
              <div className="space-y-10">
                {renderDeptSlider('FAB', fabSliderRef)}
                {renderDeptSlider('CUT', cutSliderRef)}
                {otherDepts.map((dept) => renderDeptSlider(dept, otherSliderRef))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Dept</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Nos</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Pc</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Wgt</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Mtr</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                          <span className="text-sm text-slate-500 font-medium">Fetching report data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : hasData ? (
                    Object.keys(groupedByDept).map((dept) => {
                      // Apply aggregation here too so the table doesn't get flooded with duplicates!
                      const aggregatedDeptData = aggregateItems(groupedByDept[dept]);
                      return aggregatedDeptData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                          {index === 0 && (
                            <td
                              rowSpan={aggregatedDeptData.length}
                              className="border-b border-r border-slate-200 px-4 py-2 font-bold text-center bg-indigo-50 text-indigo-700 align-middle shadow-inner"
                              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                              <span className="tracking-widest">{dept}</span>
                            </td>
                          )}
                          <td className="px-6 py-3 text-sm text-center text-slate-600">{row.nos}</td>
                          <td className="px-6 py-3 text-sm text-slate-700 font-medium">{row.trn1}</td>
                          <td className="px-6 py-3 text-sm text-center font-semibold text-indigo-600 bg-indigo-50/30 group-hover:bg-indigo-50/60 transition-colors">{row.pc}</td>
                          <td className="px-6 py-3 text-sm text-center text-slate-600">{row.wgt}</td>
                          <td className="px-6 py-3 text-sm text-center text-slate-600">{row.mtr}</td>
                        </tr>
                      ));
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-slate-500 font-medium">No data found for the selected date range.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Fab_cut;