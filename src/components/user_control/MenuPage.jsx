import React, { useEffect, useState } from "react";
import { api } from "../../auth/auth";
import { 
  Layout, ShieldCheck, Plus, Edit3, Save, Users, X, 
  CheckCircle2, Circle, GripVertical, Settings2, Key,
  AlertCircle // Added for the error toast
} from "lucide-react";

const RoleMenuPermissions = () => {
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleMenuPermissions, setRoleMenuPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("menus"); // 'menus' or 'permissions'

  const [formData, setFormData] = useState({ name: "", order: 0 });
  const [editingMenu, setEditingMenu] = useState(null);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchMenus();
    fetchRoles();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await api.get("menus/");
      setMenus(res.data.sort((a, b) => a.order - b.order));
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("roles/");
      setRoles(res.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const fetchRoleMenuPermissions = async (roleId) => {
    setSelectedRole(roleId);
    if (!roleId) {
      setRoleMenuPermissions({});
      return;
    }
    try {
      const res = await api.get(`role-menu-permissions/`);
      const permsForRole = res.data.filter((p) => p.role.id === Number(roleId));
      const permsMap = {};
      menus.forEach(menu => {
        const perm = permsForRole.find(p => p.menu.id === menu.id);
        permsMap[menu.id] = perm ? perm.can_view : false;
      });
      setRoleMenuPermissions(permsMap);
      // Auto switch to permissions tab on mobile when a role is selected
      if(window.innerWidth < 768) setActiveTab("permissions");
    } catch (err) { console.error(err); }
  };

  const handlePermissionChange = (menuId) => {
    setRoleMenuPermissions(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const savePermissions = async () => {
    if (!selectedRole) return showToast("Please select a role first!", "error");
    setIsSaving(true);
    try {
      // 1. Correct Endpoint: role-menu-permissions
      const res = await api.get("role-menu-permissions/"); 
      const existingPerms = res.data.filter((p) => p.role.id === Number(selectedRole));

      for (const menuId of Object.keys(roleMenuPermissions)) {
        const canView = roleMenuPermissions[menuId];
        const existing = existingPerms.find((p) => p.menu.id === Number(menuId));
        
        const payload = { 
          role_id: Number(selectedRole), 
          menu_id: Number(menuId), 
          can_view: canView 
        };

        if (existing) {
          // 2. Correct PUT URL: role-menu-permissions
          await api.put(`role-menu-permissions/${existing.id}/`, payload);
        } else if (canView) {
          // 3. Correct POST URL: role-menu-permissions
          await api.post("role-menu-permissions/", payload);
        }
      }
      showToast("System permissions updated successfully!", "success");
    } catch (err) { 
      console.error("Save Error Details:", err.response?.data);
      showToast("Failed to save permissions", "error"); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleSaveMenu = async () => {
    if (!formData.name) return showToast("Menu name is required", "error");
    try {
      if (editingMenu) {
        await api.put(`menus/${editingMenu.id}/`, formData);
        showToast("Menu updated successfully!", "success");
      } else {
        await api.post("menus/", formData);
        showToast("Menu created successfully!", "success");
      }
      setEditingMenu(null);
      setFormData({ name: "", order: 0 });
      fetchMenus();
    } catch (err) { 
      showToast("Failed to save menu", "error"); 
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400 animate-pulse">Initializing System...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 md:p-8 font-sans antialiased relative">
      
      {/* Custom Popup Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg z-[100] transition-all duration-300 transform ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Navbar spacing for mobile */}
      <div className="h-14 lg:hidden" />

      <div className="max-w-6xl mx-auto">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Navigation & Access</h1>
              <p className="text-slate-400 text-[9px] uppercase font-black tracking-widest">Global Config</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 md:py-2 rounded-xl border border-slate-200 w-full md:w-80 group focus-within:ring-2 ring-indigo-100 transition-all">
            <Users size={18} className="text-slate-400" />
            <select 
              className="bg-transparent w-full outline-none font-bold text-slate-600 text-[12px] cursor-pointer"
              value={selectedRole || ""}
              onChange={(e) => fetchRoleMenuPermissions(e.target.value)}
            >
              <option value="">Choose User Role...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>

        {/* --- MOBILE TABS (Visible only on small screens) --- */}
        <div className="flex lg:hidden bg-white p-1.5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
          <button 
            onClick={() => setActiveTab("menus")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'menus' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            <Settings2 size={16} /> Modules
          </button>
          <button 
            onClick={() => setActiveTab("permissions")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'permissions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            <Key size={16} /> Matrix
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: MENU EDITOR --- */}
          <div className={`${activeTab === 'menus' ? 'block' : 'hidden'} lg:block lg:col-span-7 space-y-6`}>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={14} /> System Modules
                </h3>
              </div>
              
              {/* Form Input Area */}
              <div className="p-4 bg-white border-b border-slate-50 grid grid-cols-12 gap-3">
                <input
                  type="text"
                  placeholder="Module Name"
                  className="col-span-7 md:col-span-6 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-[13px] font-bold focus:bg-white focus:ring-2 ring-indigo-50 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="0"
                  className="col-span-2 md:col-span-2 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold text-center outline-none"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
                <button 
                  onClick={handleSaveMenu}
                  className="col-span-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase hover:bg-indigo-600 transition-all flex items-center justify-center"
                >
                  {editingMenu ? <Save size={16}/> : <Plus size={16}/>}
                </button>
              </div>

              {/* Modules List */}
              <div className="p-2 max-h-[60vh] lg:max-h-[500px] overflow-y-auto">
                <div className="space-y-2">
                  {menus.map((menu) => (
                    <div key={menu.id} className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                      <div className="flex items-center gap-4">
                        <GripVertical size={14} className="text-slate-200" />
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                          {menu.order}
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{menu.name}</span>
                      </div>
                      <button 
                        onClick={() => { setEditingMenu(menu); setFormData({name:menu.name, order:menu.order}); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm md:shadow-none"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ACCESS MATRIX --- */}
          <div className={`${activeTab === 'permissions' ? 'block' : 'hidden'} lg:block lg:col-span-5`}>
            {!selectedRole ? (
              <div className="bg-white rounded-[32px] p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                <ShieldCheck className="text-slate-100 mb-4" size={60} />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Select a Role</p>
                <p className="text-slate-300 text-xs mt-2">Matrix will unlock once a <br/> role is selected above.</p>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden sticky top-8">
                <div className="p-5 border-b border-slate-100 bg-slate-900 text-white">
                   <h2 className="text-base font-bold capitalize flex items-center gap-2">
                    <Key size={16} className="text-indigo-400" /> {roles.find(r => r.id == selectedRole)?.name} Access
                   </h2>
                </div>

                <div className="p-4 space-y-2 max-h-[50vh] lg:max-h-[450px] overflow-y-auto">
                  {menus.map((menu) => (
                    <div 
                      key={menu.id} 
                      onClick={() => handlePermissionChange(menu.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                        roleMenuPermissions[menu.id] 
                        ? "bg-emerald-50/40 border-emerald-100" 
                        : "bg-white border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {roleMenuPermissions[menu.id] ? (
                          <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle size={20} className="text-slate-200" />
                        )}
                        <span className={`text-[13px] font-bold ${roleMenuPermissions[menu.id] ? "text-emerald-800" : "text-slate-600"}`}>
                          {menu.name}
                        </span>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${roleMenuPermissions[menu.id] ? "bg-emerald-500" : "bg-slate-200"}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${roleMenuPermissions[menu.id] ? "left-6" : "left-1"}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={savePermissions}
                    disabled={isSaving}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
                  >
                    {isSaving ? "Syncing..." : "Apply Changes"}
                    {!isSaving && <Save size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      {/* Mobile Bottom Spacing */}
      <div className="h-10 md:hidden" />
    </div>
  );
};

export default RoleMenuPermissions;