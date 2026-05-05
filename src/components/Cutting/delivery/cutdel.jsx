import React, { useEffect, useState, useMemo } from 'react';
import { Filter, Calendar, Package, RefreshCcw, Tag, Info, ChevronDown, ListFilter } from 'lucide-react';

const Cutdel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter States
  const [filterJobNo, setFilterJobNo] = useState('');
  const [filterPlanNo, setFilterPlanNo] = useState('');
  const [filterLot, setFilterLot] = useState('');
  const [filterTopBottom, setFilterTopBottom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    // Check mobile view
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch("https://hfapi.herofashion.com/reports/cutdel/")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Helper: Format Date
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'null' || dateStr === '-') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Logic: Status Determination
  const getRowStatus = (item) => {
    const hasUnitDel = item.unitdel_dt && item.unitdel_dt !== 'null';
    const hasFileDate = item.fdeldt && item.fdeldt !== 'null';
    const hasAPly = item.aply && item.aply !== 'null' && item.aply !== 0 && item.aply !== '0';

    if (!hasFileDate && !hasAPly && !hasUnitDel) return 'fabric_pending';
    if (!hasFileDate && hasAPly) return 'without_plan';
    return 'normal';
  };

  const rowSpans = (rows, key) => rows.map((r, i) => {
    if (i > 0 && rows[i][key] === rows[i - 1][key]) return 0;
    let c = 1;
    for (let j = i + 1; j < rows.length; j++) { if (rows[j][key] === r[key]) c++; else break; }
    return c;
  });

  const getValidatedValue = (item, field) => {
    const status = getRowStatus(item);
    if (status === 'fabric_pending' && (field === 'fdeldt' || field === 'aply' || field === 'unitdel_dt')) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-md border border-red-200"> FABRIC DELIVERY PENDING</span>;
    }
    if (status === 'without_plan' && field === 'fdeldt') {
      return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200">WITHOUT PLAN</span>;
    }

    const dateFields = ['fdeldt', 'dt', 'cutdt', 'ratio_stick_dt', 'bitcheck_dt', 'mas_bud_dt', 'unitdel_dt'];
    return dateFields.includes(field) ? formatDate(item[field]) : (item[field] || '-');
  };

  /**
   * CASCADING FILTER LOGIC
   */
  const getCascadingValues = (field) => {
    let tempItems = [...data];

    if (field !== 'jobno' && filterJobNo) tempItems = tempItems.filter(i => String(i.jobno) === filterJobNo);
    if (field !== 'planno' && filterPlanNo) tempItems = tempItems.filter(i => String(i.planno) === filterPlanNo);
    if (field !== 'lot' && filterLot) tempItems = tempItems.filter(i => String(i.lot) === filterLot);
    if (field !== 'topbottom_des' && filterTopBottom) tempItems = tempItems.filter(i => String(i.topbottom_des) === filterTopBottom);
    if (field !== 'status' && filterStatus) tempItems = tempItems.filter(i => getRowStatus(i) === filterStatus);

    return [...new Set(tempItems.map(item => item[field]))].filter(Boolean).sort();
  };

  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchJob = !filterJobNo || String(item.jobno) === filterJobNo;
      const matchPlan = !filterPlanNo || String(item.planno) === filterPlanNo;
      const matchLot = !filterLot || String(item.lot) === filterLot;
      const matchTopBottom = !filterTopBottom || String(item.topbottom_des) === filterTopBottom;
      const matchStatus = !filterStatus || getRowStatus(item) === filterStatus;
      return matchJob && matchPlan && matchLot && matchTopBottom && matchStatus;
    });

    return filtered.sort((a, b) => {
      const da = a.dt ? new Date(a.dt) : new Date(0);
      const db = b.dt ? new Date(b.dt) : new Date(0);
      return db - da;
    });
  }, [data, filterJobNo, filterPlanNo, filterLot, filterTopBottom, filterStatus]);

  const js = useMemo(() => rowSpans(processedData, 'jobno'), [processedData]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading Reports...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Cutting Delivery</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1"><Calendar size={12}/> {new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>Production Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
             <div className="px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
                <p className="text-[10px] text-indigo-500 font-bold uppercase leading-none mb-1">Showing</p>
                <p className="text-lg font-black text-indigo-700 leading-none">{processedData.length}</p>
             </div>
             <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Total</p>
                <p className="text-lg font-black text-slate-600 leading-none">{data.length}</p>
             </div>
          </div>
        </div>
      </nav>

      <main className="w-full mx-auto p-4 lg:p-6">
        
        {/* Filter Section */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-2 mb-5 text-slate-700">
            <ListFilter size={18} className="text-indigo-600"/>
            <h2 className="font-bold">Advanced Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              { label: 'Job Number', value: filterJobNo, setter: setFilterJobNo, field: 'jobno', placeholder: 'All Jobs' },
              { label: 'Plan No', value: filterPlanNo, setter: setFilterPlanNo, field: 'planno', placeholder: 'All Plans' },
              { label: 'Lot', value: filterLot, setter: setFilterLot, field: 'lot', placeholder: 'All Lots' },
              { label: 'Category', value: filterTopBottom, setter: setFilterTopBottom, field: 'topbottom_des', placeholder: 'All Categories' }
            ].map((f) => (
              <div key={f.label} className="relative group">
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  {f.label}
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-md appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                  value={f.value} 
                  onChange={e => f.setter(e.target.value)}
                >
                  <option value="">{f.placeholder}</option>
                  {getCascadingValues(f.field).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <ChevronDown className="absolute right-3 bottom-3 text-slate-400 pointer-events-none" size={14} />
              </div>
            ))}

            <div className="relative group">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1 group-focus-within:text-indigo-600">Status</label>
              <select 
                className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2.5 text-md appearance-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold text-indigo-700 cursor-pointer"
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="normal">Normal / Complete</option>
                <option value="without_plan">Without Plan</option>
                <option value="fabric_pending">Fabric Pending</option>
              </select>
              <ChevronDown className="absolute right-3 bottom-3 text-indigo-400 pointer-events-none" size={14} />
            </div>
          </div>

          {(filterJobNo || filterPlanNo || filterLot || filterTopBottom || filterStatus) && (
            <button 
              onClick={() => {
                setFilterJobNo(''); setFilterPlanNo(''); setFilterLot(''); setFilterTopBottom(''); setFilterStatus('');
              }}
              className="mt-6 text-xs text-rose-500 font-bold flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors"
            >
              <RefreshCcw size={14} /> Reset Filter View
            </button>
          )}
        </div>

        {/* Mobile Card View */}
        {isMobile && (
          <div className="space-y-4">
            {processedData.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-md border border-slate-200 text-center">
                <Package size={64} className="mx-auto text-slate-300 mb-4" strokeWidth={1} />
                <p className="text-lg font-medium text-slate-400 mb-2">No records match your filters</p>
                <p className="text-sm text-slate-500">Try adjusting your selection or reset filters</p>
              </div>
            ) : (
              processedData.map((item, idx) => {
                const status = getRowStatus(item);
                return (
                  <div key={idx} className={`bg-white rounded-2xl shadow-md border border-slate-200 p-6 group hover:shadow-lg transition-all ${
                    status === 'fabric_pending' ? 'bg-rose-50/50 border-rose-200' : 
                    status === 'without_plan' ? 'bg-amber-50/50 border-amber-200' : ''
                  }`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="shrink-0 w-12 h-12 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-black text-lg">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="font-black text-lg text-slate-800">{item.jobno}</span>
                          {status === 'fabric_pending' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">PENDING</span>
                          )}
                          {status === 'without_plan' && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md border border-amber-200">NO PLAN</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Plan No</span>
                            <p className="font-bold text-indigo-600 mt-1">{item.planno}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Lot</span>
                            <p className="font-mono font-bold text-slate-700 mt-1 bg-slate-50 px-2 py-1 rounded-lg text-sm">{item.lot}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Category</span>
                            <p className="mt-1 text-slate-600 capitalize">{item.topbottom_des}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">File Date</span>
                            <p className="mt-1 font-medium">{getValidatedValue(item, 'fdeldt')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block mb-1">Plan KG</span>
                        <p className="font-black text-slate-700 text-lg">{item.plan_kg}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block mb-1">T Ply</span>
                        <p className="font-bold text-slate-700 text-center bg-slate-50 px-3 py-1 rounded-lg">{item.tply}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 text-xs uppercase tracking-wider font-bold block mb-2">Description</span>
                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg line-clamp-2">{item.sample_descr}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Desktop Table View */}
        {!isMobile && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(90vh-280px)]">
              <table className="w-full text-left border-collapse relative">
                <thead>
                  <tr className="bg-slate-50 sticky top-0 z-20">
                    <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap  bg-slate-50 sticky left-0 z-30  w-20">SL NO</th>
                    <th className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap sticky left-15 bg-slate-50 z-30   min-w-30">
                      Job No
                    </th>
                    {[
                      'Date', 'Plan No', 'Description', 'Per', 'Category', 'Lot', 'Rls', 
                      'File Date', 'Plan KG', 'MTR', 'Cut Del', 'T Ply', 'A Ply', 
                      'Sticker Dt', 'Bitcheck', 'Mas Bundle', 'Unit Del'
                    ].map((header) => (
                      <th key={header} className="py-4 px-4 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.length === 0 ? (
                    <tr>
                      <td colSpan={19} className="text-center py-32 bg-slate-50/50">
                        <div className="flex flex-col items-center text-slate-300">
                           <Package size={64} strokeWidth={1} />
                           <p className="mt-4 text-lg font-medium text-slate-400">No records match your filters</p>
                           <p className="text-md">Try adjusting your selection or reset filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processedData.map((item, idx) => {
                      const status = getRowStatus(item);
                      return (
                        <tr key={idx} className={`hover:bg-indigo-50/40 transition-colors group ${
                          status === 'fabric_pending' ? 'bg-rose-50/30' : 
                          status === 'without_plan' ? 'bg-amber-50/30' : ''
                        }`}>
                          <td className="py-3.5 px-2 font-black text-slate-700 text-md sticky left-0 bg-white z-10 border-r border-slate-200 w-20 text-center">
                            {idx + 1}
                          </td>
                            {js[idx] > 0 && <td rowSpan={js[idx]} className="p-3 border sticky left-15 border-gray-300 bg-white font-semibold text-slate-800 text-center align-middle">{item.jobno}</td>}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-md border border-gray-300">{formatDate(item.dt)}</td>
                          <td className="py-3.5 px-4 font-bold text-indigo-600 text-md border border-gray-300">{item.planno}</td>
                          <td className="py-3.5 px-4 text-xs max-w-50 truncate font-medium text-slate-600 border border-gray-300" title={item.sample_descr}>
                            {item.sample_descr}
                          </td>
                          <td className="py-3.5 px-4 text-md font-medium text-slate-500 border border-gray-300">{item.per}</td>
                          <td className="py-3.5 px-4 text-md text-slate-500 border border-gray-300">{item.topbottom_des}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-md tracking-tighter bg-slate-50/50 border border-gray-300">{item.lot}</td>
                          <td className="py-3.5 px-4 text-md text-slate-500 border border-gray-300">{item.rls || '-'}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md border border-gray-300">{getValidatedValue(item, 'fdeldt')}</td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-700 text-md border border-gray-300">{item.plan_kg}</td>
                          <td className="py-3.5 px-4 text-right text-md text-slate-600 border border-gray-300">{item.mtr}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md font-medium text-slate-600 border border-gray-300">{formatDate(item.cutdt)}</td>
                          <td className="py-3.5 px-4 text-center font-bold bg-slate-50/80 text-md text-slate-700 border border-gray-300">{item.tply}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md border border-gray-300">{getValidatedValue(item, 'aply')}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md text-slate-400 border border-gray-300">{formatDate(item.ratio_stick_dt)}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md text-slate-400 border border-gray-300">{formatDate(item.bitcheck_dt)}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md text-slate-600 border border-gray-300">{formatDate(item.mas_bud_dt)}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-md font-semibold border border-gray-300">{getValidatedValue(item, 'unitdel_dt')}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
           
            {/* Footer Info */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-rose-200 rounded-full"></div>
                <span>Fabric Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-amber-200 rounded-full"></div>
                <span>Without Plan</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Info size={14} className="text-slate-300"/>
                <span>Scroll right for more details</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cutdel;