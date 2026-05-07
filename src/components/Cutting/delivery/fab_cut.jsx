import React, { useState, useEffect } from 'react';

const Fab_cut = () => {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Assuming the API accepts date params, e.g., ?from=...&to=...
      const response = await fetch(
        `https://hfapi.herofashion.com/advance/fab_cut_report/?from=${fromDate}&to=${toDate}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClear = () => {
    setFromDate(today);
    setToDate(today);
    fetchData();
  };

  // Grouping data by Department
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.dept]) {
      acc[item.dept] = [];
    }
    acc[item.dept].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6 bg-white p-4 rounded shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-800 uppercase">
            Fab Cut Report
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded text-sm"
          />
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Filter
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-3 text-center">
                Dept
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center">
                Nos
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left">
                Transaction
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center">
                Pc
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center">
                Wgt
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center">
                Mtr
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : Object.keys(groupedData).length > 0 ? (
              Object.keys(groupedData).map((dept) =>
                groupedData[dept].map((row, index) => (
                  <tr key={row.sl} className="hover:bg-gray-50">
                    {index === 0 && (
                      <td
                        rowSpan={groupedData[dept].length}
                        className="border border-gray-300 px-4 py-2 font-bold text-center bg-white align-middle"
                        style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                        }}
                      >
                        {dept}
                      </td>
                    )}
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {row.nos}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {row.trn1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                      {row.pc}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {row.wgt}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {row.mtr}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No data found for the selected range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fab_cut;
