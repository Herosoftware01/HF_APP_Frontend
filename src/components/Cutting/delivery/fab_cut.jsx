import React, { useState, useEffect, useCallback, useRef } from 'react';

const Fab_cut = () => {
  const today = new Date().toISOString().split('T')[0];

  const getLastWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - dayOfWeek - 6);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    return {
      from: lastMonday.toISOString().split('T')[0],
      to: lastSunday.toISOString().split('T')[0],
    };
  };

  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('custom'); // 'today' | 'lastWeek' | 'custom'
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Separate refs for independent scrolling
  const fabSliderRef = useRef(null);
  const cutSliderRef = useRef(null);
  const otherSliderRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://hfapi.herofashion.com/advance/fab_cut_report/?from=${fromDate}&to=${toDate}`
      );
      const result = await response.json();
      setData(result);
      setActiveCardIndex(0);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // --- Data processing ---

  // Group by date for weekly card view
  const groupedByDate = data.reduce((acc, item) => {
    const key = item.date || 'Unknown Date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const dateKeys = Object.keys(groupedByDate).sort();

  // For table view: group by dept
  const groupedByDept = data.reduce((acc, item) => {
    if (!acc[item.dept]) acc[item.dept] = [];
    acc[item.dept].push(item);
    return acc;
  }, {});

  const isWeeklyView = activeFilter === 'lastWeek';
  const hasData = data.length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Unknown Date') return dateStr;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const scrollToCard = (index) => {
    setActiveCardIndex(index);
    // Reset horizontal scroll of the item sliders when switching days
    if (fabSliderRef.current) fabSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    if (cutSliderRef.current) cutSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    if (otherSliderRef.current) otherSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const handlePrev = () => scrollToCard(Math.max(0, activeCardIndex - 1));
  const handleNext = () => scrollToCard(Math.min(dateKeys.length - 1, activeCardIndex + 1));

  // Custom arrow navigation for the individual cards slider
  const scrollItems = (direction, ref) => {
    if (ref && ref.current) {
      const scrollAmount = 340; // Approx card width + gap
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Extract card UI into a reusable function to avoid code duplication
  const renderCard = (item, idx) => (
    <div
      key={idx}
      className="snap-center flex-shrink-0 w-[280px] sm:w-[320px] h-[420px]"
      style={{ scrollSnapAlign: 'center' }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
        {/* Decorative Top Header - Auto Colors for Fab vs Cut */}
        <div className={`h-36 p-5 flex flex-col justify-between relative overflow-hidden ${
          item.dept?.toUpperCase() === 'FAB' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
          item.dept?.toUpperCase() === 'CUT' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
          'bg-gradient-to-br from-violet-500 to-purple-600'
        }`}>
          {/* Abstract Pattern Overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-medium border border-white/30 shadow-sm">
              {formatDate(item.date)}
            </span>
            <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Nos: {item.nos || '-'}
            </span>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-white font-black text-3xl tracking-wider drop-shadow-md">
              {item.dept || 'DEPT'}
            </h3>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col bg-white">
          <div className="mb-4">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Transaction</p>
            <p className="text-slate-800 font-semibold text-base leading-snug line-clamp-3" title={item.trn1}>
              {item.trn1 || '-'}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center group-hover:border-indigo-100 transition-colors">
              <span className="text-2xl font-black text-indigo-600">{item.pc || 0}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Pieces</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center group-hover:border-indigo-100 transition-colors">
              <span className="text-xl font-bold text-slate-700">{item.wgt || 0}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Weight</span>
            </div>
            <div className="col-span-2 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center group-hover:border-indigo-100 transition-colors">
               <span className="text-xl font-bold text-slate-700">{item.mtr || 0}</span>
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Meters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Get active items and separate them by department
  const activeItems = groupedByDate[dateKeys[activeCardIndex]] || [];
  const fabItems = activeItems.filter(item => item.dept?.toUpperCase() === 'FAB');
  const cutItems = activeItems.filter(item => item.dept?.toUpperCase() === 'CUT');
  const otherItems = activeItems.filter(item => {
    const dept = item.dept?.toUpperCase();
    return dept !== 'FAB' && dept !== 'CUT';
  });

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header & Controls */}
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
            {/* Quick Filter Pills */}
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

            {/* Date Pickers */}
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

        {/* ─── WEEKLY CARD SLIDER VIEW ─── */}
        {isWeeklyView ? (
          <div>
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="text-sm text-slate-500 font-medium">Fetching report data...</span>
              </div>
            ) : !hasData ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-slate-500 font-medium">No data found for last week.</span>
              </div>
            ) : (
              <>
                {/* Date Tab Strip */}
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={handlePrev}
                    disabled={activeCardIndex === 0}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="flex-1 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2 min-w-max">
                      {dateKeys.map((dateKey, i) => (
                        <button
                          key={dateKey}
                          onClick={() => scrollToCard(i)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                            activeCardIndex === i
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {formatDate(dateKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={activeCardIndex === dateKeys.length - 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* ─── SEPARATED SLIDERS FOR FAB AND CUT ─── */}
                <div className="space-y-10">
                  
                  {/* FAB Department Section */}
                  {fabItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <div className="w-3 h-8 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-800 tracking-wide">FAB Records</h2>
                        <span className="ml-2 bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{fabItems.length}</span>
                      </div>
                      
                      <div className="relative group/slider">
                        <button
                          onClick={() => scrollItems('left', fabSliderRef)}
                          className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div ref={fabSliderRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2 hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                          {fabItems.map((item, idx) => renderCard(item, idx))}
                        </div>

                        <button
                          onClick={() => scrollItems('right', fabSliderRef)}
                          className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CUT Department Section */}
                  {cutItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <div className="w-3 h-8 bg-teal-500 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-800 tracking-wide">CUT Records</h2>
                        <span className="ml-2 bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{cutItems.length}</span>
                      </div>
                      
                      <div className="relative group/slider">
                        <button
                          onClick={() => scrollItems('left', cutSliderRef)}
                          className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div ref={cutSliderRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2 hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                          {cutItems.map((item, idx) => renderCard(item, idx))}
                        </div>

                        <button
                          onClick={() => scrollItems('right', cutSliderRef)}
                          className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Other Departments Section (Fallback) */}
                  {otherItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <div className="w-3 h-8 bg-purple-500 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-800 tracking-wide">Other Records</h2>
                        <span className="ml-2 bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{otherItems.length}</span>
                      </div>
                      
                      <div className="relative group/slider">
                        <button
                          onClick={() => scrollItems('left', otherSliderRef)}
                          className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div ref={otherSliderRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2 hide-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                          {otherItems.map((item, idx) => renderCard(item, idx))}
                        </div>

                        <button
                          onClick={() => scrollItems('right', otherSliderRef)}
                          className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 opacity-0 group-hover/slider:opacity-100 transition-opacity focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Empty state for the selected day if no items at all */}
                  {activeItems.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 font-medium">
                      No records available for {formatDate(dateKeys[activeCardIndex])}.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* ─── TABLE VIEW (Today / Custom) ─── */
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
                          <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                          <span className="text-sm text-slate-500 font-medium">Fetching report data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : hasData ? (
                    Object.keys(groupedByDept).map((dept) =>
                      groupedByDept[dept].map((row, index) => (
                        <tr key={row.sl || index} className="hover:bg-slate-50 transition-colors group">
                          {index === 0 && (
                            <td
                              rowSpan={groupedByDept[dept].length}
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
                      ))
                    )
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