import React, { useEffect, useMemo, useState } from 'react';

const Lay = () => {
  const [data, setData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null); // State for Modal

  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const SALARY = 300;

  useEffect(() => {
    Promise.all([
      fetch('https://hfapi.herofashion.com//imp_reports/get_lay_sp_data/').then(
        (res) => res.json()
      ),
      fetch('https://hfapi.herofashion.com//imp_reports/lay_sal/').then((res) =>
        res.json()
      ),
    ])
      .then(([layRes, salRes]) => {
        setData(layRes || []);
        setSalaryData(salRes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getEmployeePnl = (row) => {
    const emp = salaryData.find(
      (s) =>
        s.name?.trim().toLowerCase() === row.emp_name_1?.trim().toLowerCase() ||
        String(s.id) === String(row.emp_name_1)
    );

    if (!emp) return 0;

    const pcs = Number(row.final_plans__pcs || 0);
    const salary = Number(emp.salary || 0);
    const sv = Number(emp.sv || 0);
    const mins = Number(emp.mins || 1);

    const perPcsCost = pcs > 0 ? pcs : 1;

    const pnl = pcs * ((salary * sv) / (11.5 * mins * perPcsCost));

    return pnl.toFixed(2);
  };

  const getEmpCost = (empName, pcs) => {
    const emp = salaryData.find(
      (s) => s.name?.trim().toLowerCase() === empName?.trim().toLowerCase()
    );

    if (!emp) return 0;

    const salary = Number(emp.salary || 0);
    const sv = Number(emp.sv || 0);
    const mins = Number(emp.mins || 1);
    const perPcsCost = pcs || 1;

    const cost = pcs * ((salary * sv) / (11.5 * mins * perPcsCost));

    return cost;
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };

  const filteredAndGrouped = useMemo(() => {
    const groups = {};
    data.forEach((row) => {
      const rowDate = row.date || '';
      const isWithinRange =
        (!startDate || rowDate >= startDate) &&
        (!endDate || rowDate <= endDate);

      if (isWithinRange) {
        const id = row.table_id && row.table_id !== 0 ? row.table_id : '1';
        const tableName = `T${id}`;
        if (!groups[tableName]) groups[tableName] = [];
        groups[tableName].push(row);
      }
    });
    return groups;
  }, [data, startDate, endDate]);

  const calculateTable = (rows) => {
    const totalRolls = rows.length;
    const scanned = rows.filter(
      (r) => Number(r.actual_ply) > 0 || Number(r.req_wgt) > 0
    ).length;
    const unscanned = totalRolls - scanned;
    const totalPly = rows.reduce(
      (sum, r) => sum + Number(r.actual_ply || 0),
      0
    );
    const totalWeight = rows.reduce(
      (sum, r) => sum + Number(r.scl_wgt || 0),
      0
    );
    const totalMtr = rows.reduce((sum, r) => sum + Number(r.req_wgt || 0), 0);
    const totalPcs = rows.reduce(
      (sum, r) => sum + Number(r.final_plans__pcs || 0),
      0
    );
    const balWeight = rows.reduce((sum, r) => sum + Number(r.bal_wgt || 0), 0);
    const endBit = rows.reduce((sum, r) => sum + Number(r.end_bit || 0), 0);
    const usedWeight =
      rows.reduce((sum, r) => sum + Number(r.req_wgt || 0), 0) || 1;

    const scanPercent =
      totalRolls > 0 ? ((scanned / totalRolls) * 100).toFixed(0) : 0;
    const balPercent = ((balWeight / usedWeight) * 100).toFixed(0);
    const bitPercent = ((endBit / usedWeight) * 100).toFixed(0);
    const cost = totalPcs > 0 ? (SALARY / totalPcs).toFixed(2) : 0;

    return {
      totalRolls,
      scanned,
      unscanned,
      totalPly,
      totalPcs,
      totalWeight: totalWeight.toFixed(2),
      totalMtr: totalMtr.toFixed(2),
      balWeight: balWeight.toFixed(2),
      endBit: endBit.toFixed(2),
      scanPercent,
      balPercent,
      bitPercent,
      cost,
    };
  };

  return (
    <div className="min-h-screen bg-slate-100 p-5">
      {loading && <div className="loader"></div>}
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          ← Back Home
        </button>
        <div className="text-slate-500 font-medium">
          {new Date().toDateString()}
        </div>
      </div>

      {/* Header */}
      <div className="bg-linear-to-r from-indigo-700 to-blue-600 text-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lay Spreading Dashboard</h1>
            <p className="text-sm opacity-90">Live Data Overview</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold opacity-70">
                From
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white text-slate-900 rounded px-2 py-1 text-sm outline-none"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold opacity-70">
                To
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white text-slate-900 rounded px-2 py-1 text-sm outline-none"
              />
            </div>
            <button
              onClick={handleClear}
              className="md:mt-4 bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(filteredAndGrouped).map(([table, rows]) => {
          const item = calculateTable(rows);
          return (
            <div
              key={table}
              onClick={() => setSelectedTable({ name: table, data: rows })}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden cursor-pointer hover:ring-4 hover:ring-indigo-200 transition-all"
            >
              <div className="bg-indigo-600 text-white px-5 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{table}</h2>
                <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {rows.length} Rolls
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-700 mb-2 text-sm">
                    QR Scan Totals
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500">PLYS</p>
                      <p className="font-bold text-lg">{item.totalPly}</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500">MTR</p>
                      <p className="font-bold text-lg">{item.totalMtr}</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <p className="text-[10px] text-slate-500">PCS</p>
                      <p className="font-bold text-lg">{item.totalPcs}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-semibold">
                      Salary
                    </p>
                    <p className="font-bold text-xl">{SALARY}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700 font-semibold">
                      Cost / PCS
                    </p>
                    <p className="font-bold text-xl">{item.cost}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-sm border border-slate-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Total Rolls</span>
                    <span className="font-bold">{item.totalRolls}</span>
                  </div>
                  {/* <div className="flex justify-between mb-2"><span className="text-slate-600">Unscanned</span><span className="font-bold text-red-600">{item.unscanned}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Scan %</span><span className="font-bold text-green-600">{item.scanPercent}%</span></div> */}
                </div>

                <div>
                  <h3 className="font-bold text-slate-700 mb-2 text-sm">
                    Weight Breakdown
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-orange-50 p-2 rounded-xl border border-orange-100">
                      <p className="text-[10px]">Balance</p>
                      <p className="font-bold text-sm">{item.balWeight}</p>
                    </div>
                    <div className="bg-pink-50 p-2 rounded-xl border border-pink-100">
                      <p className="text-[10px]">End Bit</p>
                      <p className="font-bold text-sm">{item.endBit}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                      <p className="text-[10px]">Weight</p>
                      <p className="font-bold text-sm">{item.totalWeight}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-indigo-900">
                  Table Details: {selectedTable.name}
                </h2>
                <p className="text-sm text-indigo-600">
                  Employee Productivity & Roll Logistics
                </p>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-slate-400 hover:text-red-500 text-3xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="overflow-auto p-6">
              <table className="w-full text-left border-separate border-spacing-0 min-w-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold">
                    <th className="p-3 border text-center">Job No</th>
                    <th className="p-3 border text-center">Plan No</th>
                    <th className="p-3 border text-center">Roll No</th>
                    <th className="p-3 border text-center">Emp 1</th>
                    <th className="p-3 border text-center">Emp 2</th>
                    <th className="p-3 border text-center">Weight</th>
                    <th className="p-3 border text-center">Total Pcs</th>
                    <th className="p-3 border text-center">Emp P&L</th>
                    <th className="p-3 border text-center">Total P&L</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {selectedTable.data.map((row, idx) => {
                    const pcs = Number(row.final_plans__pcs || 0);
                    const empPnl = getEmployeePnl(row);
                    const totalPnl = (Number(empPnl) * 2).toFixed(2);

                    // --- Helper Function for Row Spanning ---
                    const getRowSpan = (field, index) => {
                      let count = 1;
                      // Only calculate span for the first occurrence of the value
                      if (
                        index > 0 &&
                        selectedTable.data[index - 1][field] ===
                          selectedTable.data[index][field]
                      ) {
                        return 0; // Hide this cell
                      }
                      // Count how many consecutive rows have the same value
                      for (
                        let i = index + 1;
                        i < selectedTable.data.length;
                        i++
                      ) {
                        if (
                          selectedTable.data[i][field] ===
                          selectedTable.data[index][field]
                        ) {
                          count++;
                        } else {
                          break;
                        }
                      }
                      return count;
                    };

                    const jobSpan = getRowSpan('job_no', idx);
                    const planSpan = getRowSpan('plan_no', idx);

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-indigo-50/10 transition-colors"
                      >
                        {/* Merged Job No */}
                        {jobSpan > 0 && (
                          <td
                            rowSpan={jobSpan}
                            className="p-3 border text-slate-900 font-bold bg-white align-middle text-center"
                          >
                            {row.job_no}
                          </td>
                        )}

                        {/* Merged Plan No */}
                        {planSpan > 0 && (
                          <td
                            rowSpan={planSpan}
                            className="p-3 border text-slate-600 bg-white align-middle text-center"
                          >
                            {row.plan_no}
                          </td>
                        )}

                        <td className="p-3 border font-medium text-indigo-700">
                          {row.roll_no}
                        </td>
                        <td className="p-3 border">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {row.emp_name_1 || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                            {row.emp_name_2 || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 border text-center font-bold">
                          {row.actual_obwgt}
                        </td>
                        <td className="p-3 border text-center font-bold">
                          {pcs}
                        </td>
                        <td className="p-3 border text-center font-bold text-blue-600">
                          {empPnl}
                        </td>

                        <td className="p-3 border text-center font-bold text-green-600">
                          {totalPnl}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedTable(null)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.keys(filteredAndGrouped).length === 0 && (
        <div className="text-center py-20 text-slate-400 font-medium">
          No records found.
        </div>
      )}
    </div>
  );
};

export default Lay;
