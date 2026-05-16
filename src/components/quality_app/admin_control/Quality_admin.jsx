import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../auth/auth";

function Quality_admin() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [data, setQcdatas] = useState([]);

  useEffect(() => {
    fetch_qcdata();
  }, []);

  const fetch_qcdata = async () => {
    try {
      const res = await api.get("qcapp/qcadmin_mistakes/");
      setQcdatas(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(data.map((item) => item.category))),
  ];

  const filteredData =
    categoryFilter === "All"
      ? data
      : data.filter((item) => item.category === categoryFilter);

  // CREATE
  const handleAdd = async (formData) => {
    try {
      const res = await api.post("qcapp/qcadmin_mistakes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQcdatas([...data, res.data]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  // UPDATE
  const handleUpdate = async (id, formData) => {
    try {
      const res = await api.patch(
        `qcapp/qcadmin_mistakes/${id}/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setQcdatas(data.map((item) => (item.id === id ? res.data : item)));
      setShowEditModal(false);
    } catch (err) {
      console.error("Update Error:", err.response?.data);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await api.delete(`qcapp/qcadmin_mistakes/${id}/`);
      setQcdatas(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quality Admin Control</h2>
            <Link to="qc" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline mt-1 transition-colors">
              Go to QC View Dashboard &rarr;
            </Link>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex justify-center items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add New Item
          </button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="text-sm font-semibold text-gray-600 sm:w-auto">Filter Menu:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 transition-all outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Clean, Modern Layout with Independent Body Scroll */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-280px)] min-h-[350px]">
          
          {/* Fixed Layout Header */}
          <div className="bg-gray-50/70 border-b border-gray-100 backdrop-blur-md grid grid-cols-12 px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 min-w-[700px]">
            <div className="col-span-3">Name</div>
            <div className="col-span-2 text-center">Visual</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-center">Edit</div>
            <div className="col-span-2 text-center">Delete</div>
          </div>

          {/* Independent Scrollable Data Body Container */}
          <div className="overflow-y-auto divide-y divide-gray-100 flex-1 min-w-[700px]">
            {filteredData.length === 0 ? (
              <div className="flex justify-center items-center py-16 text-gray-400 text-sm">
                No items found matching the filter criteria.
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50/40 transition-colors">
                  
                  {/* Name column */}
                  <div className="col-span-3 text-sm font-medium text-gray-900 pr-4 truncate">
                    {item.name}
                  </div>

                  {/* Image column */}
                  <div className="col-span-2 flex justify-center">
                    <div className="h-11 w-11 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shadow-inner flex items-center justify-center">
                      <img
                        src={`https://hfapi.herofashion.com${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/44x44?text=NA' }}
                      />
                    </div>
                  </div>

                  {/* Category badge column */}
                  <div className="col-span-3 pr-4 truncate">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                      ${item.category?.includes('Critical') ? 'bg-red-50 text-red-700' : 
                        item.category?.includes('Major') ? 'bg-orange-50 text-orange-700' : 
                        item.category?.includes('Minor') ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Edit Button column */}
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-1.5 bg-white border border-gray-200 hover:border-amber-500 text-gray-600 hover:text-amber-600 font-medium text-xs rounded-lg shadow-sm transition-all"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Delete Button column */}
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-500 hover:text-red-600 font-medium text-xs rounded-lg shadow-sm transition-all"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
          
        </div>

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          title="Add Quality Log Item"
          onClose={() => setShowAddModal(false)}
          onSubmit={(formData) => handleAdd(formData)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && currentItem && (
        <Modal
          title="Update Log Item"
          item={currentItem}
          onClose={() => setShowEditModal(false)}
          onSubmit={(formData) => handleUpdate(currentItem.id, formData)}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, onSubmit, item }) {
  const [name, setName] = useState(item?.name || "");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState(item?.category || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    if (image) {
      formData.append("image", image);
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Broken Stitching"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Reference Image File</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border border-gray-200 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-xs text-gray-500 rounded-xl p-1 outline-none transition-all cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Defect Classification</label>
            <select
              value={category}
              required
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Select Category</option>
              <option value="Minor Defects">Minor Defects</option>
              <option value="Major Defects">Major Defects</option>
              <option value="Critical Defects">Critical Defects</option>
              <option value="rowing_qc">Rowing Qc</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200/70 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Quality_admin;