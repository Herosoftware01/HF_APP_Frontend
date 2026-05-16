import React, { useEffect, useState } from "react";
import { api } from "../../auth/auth";
import { motion, AnimatePresence } from "framer-motion";

// Modal for editing / creating new allocation
function MachineEditPopup({ allocation, onClose, onSaved }) {
  const [units, setUnits] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(allocation.unit || "");
  const [selectedLine, setSelectedLine] = useState(allocation.line || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get("/qcapp/api/units/");
        setUnits(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!selectedUnit) return setLines([]);
    const fetchLines = async () => {
      try {
        const res = await api.get(`/qcapp/api/lines/?unit=${selectedUnit}`);
        setLines(res.data);
        if (!res.data.find((l) => l.id === selectedLine)) {
          setSelectedLine("");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLines();
  }, [selectedUnit]);

  const handleSave = async () => {
    if (!selectedUnit || !selectedLine) {
      setError("Select unit and line");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/qcapp/api/machine-transfer/", {
        machine_id: allocation.machine_id,
        unit: selectedUnit,
        line: selectedLine,
      });

      setMessage("✅ Transfer completed successfully");

      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);

    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.non_field_errors) {
          setError(data.non_field_errors.join(", "));
        } else {
          setError(Object.values(data).flat().join(", "));
        }
      } else {
        setError("❌ Failed to save allocation");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Machine Transfer</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine ID</label>
              <input 
                type="text" 
                value={allocation.machine || ""} 
                readOnly 
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line</label>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Line</option>
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>{l.line_number}</option>
                ))}
              </select>
            </div>

            {message && (
              <div className="p-3 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MachineAllocation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editAlloc, setEditAlloc] = useState(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/qcapp/api/machine-transfer/");
      setData(res.data);
    } catch (err) {
      alert("Failed to load allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derive Unique Units for the filter dropdown from the fetched dataset
  const uniqueUnits = Array.from(
    new Set(data.map((alloc) => alloc.unit_name).filter(Boolean))
  );

  // Combined Search & Filter Logic
  const filteredData = data.filter((alloc) => {
    const searchStr = searchQuery.toLowerCase();
    
    const matchesSearch = (
      (alloc.machine?.toLowerCase() || "").includes(searchStr) ||
      (alloc.unit_name?.toLowerCase() || "").includes(searchStr) ||
      (alloc.line_number?.toString() || "").includes(searchStr) ||
      (alloc.id?.toString() || "").includes(searchStr)
    );

    const matchesUnit = selectedUnitFilter === "" || alloc.unit_name === selectedUnitFilter;

    return matchesSearch && matchesUnit;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/qcapp/api/machine-transfer/${id}/`);
      fetchData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header and Controls layout */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:justify-between lg:items-center">
          <h2 className="text-2xl font-extrabold text-gray-800">Machine Transfer</h2>
          
          {/* Filters Area */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
            
            {/* Search Input UI */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search machine, unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>

            {/* Dropdown Filter for Unit */}
            <div className="relative flex-1 sm:w-48">
              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm bg-white"
              >
                <option value="">All Units</option>
                {uniqueUnits.map((unitName, index) => (
                  <option key={index} value={unitName}>{unitName}</option>
                ))}
              </select>
            </div>

            {/* Refresh Action */}
            <button 
              onClick={fetchData} 
              className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-sm whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Master Container - Adaptive Viewports */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
          <div className="hidden md:block overflow-y-auto max-h-[calc(115vh-280px)]">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 ">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 ">Machine</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 ">Unit</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 ">Line</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 ">Allocated At</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600  text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400">Loading data...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400">No matching allocations found.</td></tr>
                ) : (
                  filteredData.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{alloc.machine}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                          {alloc.unit_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.line_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-00 ">
                        {new Date(alloc.allocated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button 
                          onClick={() => setEditAlloc(alloc)}
                          className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all text-sm font-medium"
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW (Hidden on Desktop) */}
          <div className="block md:hidden overflow-y-auto max-h-[calc(100vh-280px)] p-4 space-y-4 bg-gray-50/50">
            {loading ? (
              <div className="p-10 text-center text-gray-400">Loading data...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-10 text-center text-gray-400">No matching allocations found.</div>
            ) : (
              filteredData.map((alloc) => (
                <div key={alloc.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 block">ID #{alloc.id}</span>
                      <span className="text-base font-bold text-gray-900">{alloc.machine}</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                      {alloc.unit_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-xs">Line No.</span>
                      <span className="text-gray-700 font-medium">{alloc.line_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Allocated At</span>
                      <span className="text-gray-700 italic text-xs">
                        {new Date(alloc.allocated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => setEditAlloc(alloc)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      Transfer Machine
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Popup Render context */}
      <AnimatePresence>
        {editAlloc && (
          <MachineEditPopup
            allocation={editAlloc}
            onClose={() => setEditAlloc(null)}
            onSaved={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MachineAllocation;
