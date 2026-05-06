import React, { useEffect, useState } from "react";
import { api } from "../../auth/auth";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  Edit3, 
  Trash2, 
  Shield, 
  X,
  Save,
  Loader2,
  Hash,
  Search,
  ChevronRight,
  Eye,      // Added Eye icon
  EyeOff    // Added EyeOff icon
} from "lucide-react";

const User_list = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [submenus, setSubmenus] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role_id: "",
    default_submenu_id: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchSubmenus();
  }, []);

  const fetchSubmenus = async () => {
    try {
      const res = await api.get("submenus/");
      setSubmenus(res.data);
    } catch (err) {
      console.error("Fetch Submenus Error:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("https://hfapi.herofashion.com/qcapp/api/employees_and_staff/");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Employee fetch error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("users-list/");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("roles/");
      setRoles(res.data);
    } catch (err) {
      console.error("Fetch Roles Error:", err);
    }
  };

  const toggleStatus = async (id, isActive) => {
    const action = isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.patch(`users/${id}/toggle-status/`);
      fetchUsers();
    } catch (err) {
      console.error("Toggle Error:", err);
      alert("Failed to update user status.");
    }
  };

  useEffect(() => {
    if (showCreateModal) fetchEmployees();
  }, [showCreateModal]);

  const deleteUser = async (id) => {
    if (!window.confirm("Permanent-ah delete panna mudiyum. Are you sure?")) return;
    try {
      await api.delete(`users/${id}/`);
      fetchUsers();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      role_id: user.role?.id || "",
      default_submenu_id: user.default_submenu?.id || "",
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setShowCreateModal(false);
    setShowEmployeeDropdown(false);
    setShowPassword(false); // Reset visibility when closing
    setSearchTerm("");
    setFormData({ username: "", password: "", role_id: "", default_submenu_id: "" });
  };

  const handleSubmit = async () => {
    if (!formData.username || (!editingUser && !formData.password) || !formData.role_id) {
      return alert("Required fields ellam fill pannunga.");
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`users/${editingUser.id}/`, {
          username: formData.username,
          password: formData.password || undefined,
          role_id: formData.role_id,
          default_submenu_id: formData.default_submenu_id || null,
        });
      } else {
        await api.post("users-create/", formData);
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      alert("Error saving user data.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 md:p-8 font-sans text-slate-700 antialiased">
      <div className="h-16 lg:hidden" /> 

      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 sm:relative z-30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-800 leading-tight">User Directory</h1>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Account Management</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95"
          >
            <UserPlus size={16} />
            Add New User
          </button>
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-none mb-1">{user.username}</h3>
                    <div className="flex items-center gap-1 text-slate-400">
                       <Hash size={10} />
                       <span className="text-[10px] font-bold uppercase">{user.id}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${
                    user.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                }`}>
                  {user.is_active ? "Live" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => toggleStatus(user.id, user.is_active)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all">
                  {user.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                  <span className="text-[10px] font-bold uppercase">{user.is_active ? "Off" : "On"}</span>
                </button>
                <button onClick={() => openEditModal(user)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => deleteUser(user.id)} className="p-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- DESKTOP TABLE --- */}
<div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
  {/* Set a max-height and enable vertical scrolling */}
  <div className="max-h-[calc(110vh-250px)] overflow-y-auto overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-200">
    <table className="w-full border-collapse">
      <thead>
        {/* 'sticky top-0' keeps the header fixed while scrolling */}
        <tr className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Staff Info</th>
          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Role</th>
          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Menu</th>
          <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Status</th>
          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Operations</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {user.username.substring(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-700 leading-none mb-1">{user.username}</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight italic">ID: #{user.id}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Shield size={14} className="text-slate-300" />
                <span className="text-[12px] font-semibold capitalize tracking-tight">{user.role || "No Role"}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`text-[12px] font-semibold capitalize tracking-tight px-2 py-1 rounded-md ${user.default_submenu ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {user.default_submenu ? user.default_submenu.name : "No Menu"}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${user.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                {user.is_active ? "Live" : "Inactive"}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button onClick={() => toggleStatus(user.id, user.is_active)} className="p-1.5 rounded-lg border text-slate-400 hover:text-indigo-600">
                  {user.is_active ? <UserMinus size={15} /> : <UserCheck size={15} />}
                </button>
                <button onClick={() => openEditModal(user)} className="p-1.5 text-slate-400 hover:text-indigo-600">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      </div>

      {/* --- MODAL --- */}
      {(editingUser || showCreateModal) && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm bg-slate-900/60 z-[100] overflow-y-auto">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 pb-4 flex justify-between items-start shrink-0">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <UserPlus size={24} />
              </div>
              <button onClick={closeModal} className="p-2 text-slate-300 hover:text-slate-500 rounded-xl">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 pt-0 overflow-y-auto flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{editingUser ? "Edit Profile" : "New Account"}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-6">User details & system access</p>

              <div className="space-y-5">
                {/* Searchable & Manual Username Field */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Username / Staff</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type username or select staff..."
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-50"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => { setShowEmployeeDropdown(!showEmployeeDropdown); setSearchTerm(""); }}
                      className="bg-indigo-600 px-4 py-2 rounded-xl text-white shadow-lg"
                    >
                      {showEmployeeDropdown ? <X size={18} /> : <Search size={18} />}
                    </button>
                  </div>

                  {showEmployeeDropdown && (
                    <div className="absolute z-[110] mt-2 w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                        <Search size={14} className="text-slate-400 ml-1" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Quick search staff..."
                          className="w-full bg-transparent text-[13px] font-medium outline-none placeholder:text-slate-400 placeholder:font-normal"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        {employees
                          .filter(emp => 
                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.code.toString().includes(searchTerm)||
                            emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((emp) => (
                            <div
                              key={emp.code}
                              onClick={() => {
                                setFormData({ ...formData, username: emp.name, password: "1234" });
                                setShowEmployeeDropdown(false);
                                setSearchTerm("");
                              }}
                              className="px-4 py-3 hover:bg-indigo-600 group cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center transition-all duration-200"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors">
                                  {emp.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black group-hover:bg-indigo-500 group-hover:text-indigo-100 transition-colors">
                                    ID: {emp.code}
                                  </span>
                                  <span className="text-[10px] bg-yellow-100 text-slate-500 px-1.5 py-0.5 rounded font-black group-hover:bg-indigo-500 group-hover:text-indigo-100 transition-colors">
                                    Dept : {emp.dept}
                                  </span>
                                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-200">
                                    • Employee
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-7 w-7 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center group-hover:bg-indigo-500 transition-all">
                                   <img src={emp.photo} alt="" className="object-cover h-full w-full" />
                                </div>
                                <div className="h-7 w-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-500 transition-all">
                                  <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
                                </div>
                              </div>
                            </div>
                          ))}

                        {employees.filter(emp => 
                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.dept.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.code.toString().includes(searchTerm)
                          ).length === 0 && (
                          <div className="py-10 flex flex-col items-center justify-center gap-2">
                            <div className="p-3 bg-slate-50 rounded-full">
                              <Users size={20} className="text-slate-300" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">No matching staff found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* --- PASSWORD FIELD WITH EYE TOGGLE --- */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:ring-2 ring-indigo-50"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Role</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  >
                    <option value="">Choose a role</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Default Path</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                    value={formData.default_submenu_id || ""}
                    onChange={(e) => setFormData({ ...formData, default_submenu_id: e.target.value })}
                  >
                    <option value="">Select a submenu</option>
                    {submenus.map((s) => (
                      <option key={s.id} value={s.id}>{s.menu_name} → {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 mb-6">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg disabled:bg-slate-200"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> {editingUser ? "Update Changes" : "Create Account"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User_list;