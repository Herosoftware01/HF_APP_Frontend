import React, { useEffect, useState, useMemo } from 'react';

const API_BASE_URL = `https://app.herofashion.com/attendance/mistake_summary/`;

const Mistake = () => {
  const [fullData, setFullData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ JobNo: '', lotno: '', TopBottom_des: '' });

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE_URL)
      .then(res => res.json())
      .then(result => {
        setFullData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  const filteredData = useMemo(() => {
    return fullData.filter(item => {
      return (
        (filters.JobNo === '' || String(item.JobNo) === filters.JobNo) &&
        (filters.lotno === '' || String(item.lotno) === filters.lotno) &&
        (filters.TopBottom_des === '' || item.TopBottom_des === filters.TopBottom_des)
      );
    });
  }, [fullData, filters]);

  const getOptions = (key) => [...new Set(fullData.map(item => item[key]))].filter(Boolean).sort();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getRowSpan = (data, key, index) => {
    if (index > 0 && data[index][key] === data[index - 1][key]) return 0;
    let span = 1;
    for (let i = index + 1; i < data.length; i++) {
      if (data[i][key] === data[index][key]) span++;
      else break;
    }
    return span;
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      
      {/* 1. Header Section */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row flex-none justify-between items-start sm:items-center gap-4 sm:gap-0 shadow-sm z-10">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Mistake Summary
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
           <button 
            onClick={() => setFilters({ JobNo: '', lotno: '', TopBottom_des: '' })}
            className="px-3 md:px-4 py-1.5 text-[11px] md:text-xs font-bold text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg hover:bg-red-50 transition-all whitespace-nowrap"
          >
            CLEAR FILTERS
          </button>
          <a href='r_home' className='bg-blue-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-100 transition-all whitespace-nowrap flex items-center'>
            Back
          </a>
        </div>
      </header>

      {/* 2. Filters Bar */}
      <div className="bg-white border-b border-slate-200 p-4 flex-none grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-4 shadow-sm">
        {['JobNo', 'TopBottom_des',  'lotno'].map((field) => (
          <div key={field} className="relative mt-1 sm:mt-0">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
              {field === 'lotno' ? 'Lot Number' : field === 'TopBottom_des' ? 'Position' : 'Job Number'}
            </label>
            <select
              name={field}
              value={filters[field]}
              onChange={handleFilterChange}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="">All {field.replace('_des', '')}</option>
              {getOptions(field).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* 3. Table Container */}
      <main className="grow overflow-hidden p-2 md:p-4 bg-slate-100">
        {/* Inner wrapper allows both vertical and horizontal scroll while keeping rounded corners */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 h-full overflow-auto relative">
          {/* min-w-[900px] forces horizontal scroll on small screens to prevent text squishing */}
          <table className="w-full min-w-225 border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-800">
                {[ 'Job No','Position', 'Qrid', 'Ratio' , 'Lot No', 'Operator Name', 'Color Combo', 'Mist PC', 'Individual Parts'].map((header) => (
                  <th key={header} className="px-4 md:px-6 py-3 text-left text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                    <td colSpan="9" className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-slate-500 font-medium">Loading production data...</p>
                    </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const tbSpan = getRowSpan(filteredData, 'TopBottom_des', index);
                  const jbSpan = getRowSpan(filteredData, 'JobNo', index);

                  return (
                    <tr key={index} className="hover:bg-blue-50/40 transition-colors group">
                      {jbSpan > 0 && (
                        <td rowSpan={jbSpan} className="px-4 md:px-6 py-4 align-middle font-bold text-slate-800 bg-white border-r border-slate-300 whitespace-nowrap">
                          {item.JobNo}
                        </td>
                      )}
                      {tbSpan > 0 && (
                        <td rowSpan={tbSpan} className="px-4 md:px-6 py-4 align-middle font-bold text-blue-700 bg-white border-r border-slate-300 sticky left-0 z-10 whitespace-nowrap">
                          <span className="bg-blue-50 px-2 py-1 rounded text-xs uppercase tracking-tight">{item.TopBottom_des}</span>
                        </td>
                      )}
                      
                      <td className="px-4 md:px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{item.qrid}</td>
                      <td className="px-4 md:px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{item.rotiono}</td>
                      <td className="px-4 md:px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{item.lotno}</td>
                      <td className="px-4 md:px-6 py-4 text-slate-800 font-medium text-sm whitespace-nowrap">{item.Name}</td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                          {item.clrcombo}
                        </code>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${item.mistpc > 5 ? 'text-red-600' : 'text-slate-900'}`}>
                          {item.mistpc} <span className="text-[10px] text-slate-400 font-normal ml-1">PCS</span>
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-slate-500 text-xs italic">{item.Indparts}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-24 text-center text-slate-400 italic">
                    No results found for the current filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 4. Footer Summary */}
      <footer className="bg-white border-t border-slate-200 px-4 md:px-6 py-3 flex-none flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 text-xs text-slate-500 font-medium">
        <div>Showing {filteredData.length} records</div>
        <div className="flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> High Mistake (&gt;5)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full"></span> Standard</span>
        </div>
      </footer>
    </div>
  );
};

export default Mistake;