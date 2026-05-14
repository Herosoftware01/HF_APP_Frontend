import React, { useEffect, useState } from "react";
import { api } from "../../auth/auth";
import { 
  ChevronDown, 
  ShieldCheck, 
  Save, 
  Users, 
  Lock,
  Layout,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const SubMenuPermissionTable = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allMenus, setAllMenus] = useState([]); 
  const [permissions, setPermissions] = useState({}); 
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("roles/");
      setRoles(res.data);
    } catch (err) { console.error("Error fetching roles:", err); }
  };

  const fetchMenus = async () => {
    try {
      const res = await api.get("menus/");
      setAllMenus(res.data);
    } catch (err) { console.error("Error fetching menus:", err); }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleRoleChange = async (roleId) => {
    setSelectedRole(roleId);
    if (!roleId) {
      setPermissions({});
      return;
    }
    try {
      const res = await api.get("role-submenu-permissions/");
      const rolePerms = res.data.filter((p) => p.role.id === Number(roleId));

      // Map permissions
      const permsMap = {};
      rolePerms.forEach((p) => {
        permsMap[p.submenu.id] = p.can_view;
      });

      // Include all submenu IDs to default hidden if not present
      const addAllSubmenus = (subs) => {
        subs.forEach(sub => {
          if (!(sub.id in permsMap)) permsMap[sub.id] = false;
          if (sub.children?.length) addAllSubmenus(sub.children);
        });
      };
      allMenus.forEach(menu => menu.submenus && addAllSubmenus(menu.submenus));

      setPermissions(permsMap);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setPermissions({});
    }
  };

  const togglePermission = (submenuId) => {
    setPermissions((prev) => ({
      ...prev,
      [submenuId]: !prev[submenuId],
    }));
  };

  const toggleMenuExpand = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const savePermissions = async () => {
    if (!selectedRole) {
      return showToast("Please select a role first!", "error");
    }
    setIsSaving(true);
    try {
      const res = await api.get("role-submenu-permissions/");
      const existingPerms = res.data.filter(p => p.role.id === Number(selectedRole));

      const saveSubmenus = async (subs) => {
        for (const sub of subs) {
          const hasPermissionInUI = !!permissions[sub.id];
          const existingInDB = existingPerms.find(p => p.submenu.id === sub.id);
          const payload = {
            role_id: Number(selectedRole),
            submenu_id: sub.id,
            can_view: hasPermissionInUI,
          };
          if (existingInDB) {
            await api.put(`role-submenu-permissions/${existingInDB.id}/`, payload);
          } else if (hasPermissionInUI) {
            await api.post("role-submenu-permissions/", payload);
          }
          if (sub.children?.length) await saveSubmenus(sub.children);
        }
      };

      for (const menu of allMenus) {
        if (menu.submenus?.length) await saveSubmenus(menu.submenus);
      }

      showToast("Permissions successfully updated!", "success");
    } catch (err) {
      showToast("Failed to save permissions. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Recursive rendering for desktop
  const renderSubmenusTable = (submenus, level = 0) => {
    return submenus.map(sub => (
      <React.Fragment key={sub.id}>
        <tr className="bg-slate-50/30 border-l-4 border-indigo-500">
          <td className="px-14 py-3" style={{ paddingLeft: `${level * 24 + 16}px` }}>
            <span className={`text-[12px] font-semibold ${permissions[sub.id] ? "text-slate-800" : "text-slate-400 italic"}`}>
              {sub.name}
            </span>
          </td>
          <td className="px-6 py-3 text-center">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${permissions[sub.id] ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-300 bg-white border-slate-100"}`}>
              {permissions[sub.id] ? "Visible" : "Hidden"}
            </span>
          </td>
          <td className="px-6 py-3 text-right">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={!!permissions[sub.id]} onChange={() => togglePermission(sub.id)} />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
          </td>
        </tr>
        {sub.children?.length > 0 && renderSubmenusTable(sub.children, level + 1)}
      </React.Fragment>
    ));
  };

  // Recursive rendering for mobile accordion
  const renderSubmenusMobile = (submenus, level = 0) => {
    return submenus.map(sub => (
      <div key={sub.id} className="p-4 flex items-center justify-between bg-white" style={{ paddingLeft: `${level * 16}px` }}>
        <div>
          <p className="text-[13px] font-bold text-slate-700">{sub.name}</p>
          <p className={`text-[10px] font-bold uppercase ${permissions[sub.id] ? "text-emerald-500" : "text-slate-300"}`}>
            {permissions[sub.id] ? "Visible" : "Hidden"}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer scale-110">
          <input type="checkbox" className="sr-only peer" checked={!!permissions[sub.id]} onChange={() => togglePermission(sub.id)} />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
        </label>
        {sub.children?.length > 0 && renderSubmenusMobile(sub.children, level + 1)}
      </div>
    ));
  };

  return (
    // Replaced min-h-screen with h-screen and overflow-hidden to fix the screen layout
    <div className="h-screen bg-[#f8fafc] p-3 md:p-8 font-sans text-slate-700 antialiased flex flex-col overflow-hidden relative">
      
      {/* Custom Popup Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg z-[100] transition-all duration-300 transform ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="h-4 lg:hidden flex-none" />

      {/* Header & Role Selection - Fixed Height Container */}
      <div className="flex-none max-w-5xl w-full mx-auto bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-800">Permission Matrix</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Access Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 md:py-2 rounded-xl border border-slate-200 w-full md:w-72">
          <Users size={16} className="text-slate-400" />
          <select 
            className="bg-transparent w-full outline-none font-bold text-slate-600 text-[13px] cursor-pointer"
            value={selectedRole || ""}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            <option value="">Choose a Role</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area - Expands to fill available space */}
      <div className="flex-1 max-w-5xl w-full mx-auto flex flex-col overflow-hidden min-h-0">
        {!selectedRole ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex-none">
            <Lock className="mx-auto text-slate-100 mb-4" size={48} />
            <p className="text-slate-400 font-bold text-sm">Select a role to begin configuration</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">

            {/* MOBILE VIEW - Scrollable */}
            <div className="md:hidden space-y-3 overflow-y-auto flex-1 pb-24">
              {allMenus.map(menu => (
                <div key={menu.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div onClick={() => toggleMenuExpand(menu.id)} className="p-4 flex items-center justify-between bg-slate-50/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Layout size={18} className="text-indigo-600" />
                      <span className="font-black text-xs uppercase tracking-tight">{menu.name}</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform text-slate-400 ${expandedMenus[menu.id] ? "rotate-180" : ""}`} />
                  </div>
                  {expandedMenus[menu.id] && menu.submenus && renderSubmenusMobile(menu.submenus)}
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW - Scrollable table body only */}
            <div className="hidden md:flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse relative">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Modules</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allMenus.map(menu => (
                      <React.Fragment key={menu.id}>
                        <tr onClick={() => toggleMenuExpand(menu.id)} className="group cursor-pointer hover:bg-slate-50/80">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className={`p-1.5 rounded-lg transition-all ${expandedMenus[menu.id] ? "bg-indigo-600 text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
                              <ChevronDown size={12} />
                            </div>
                            <span className="font-bold text-slate-700 text-[13px]">{menu.name}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 text-[9px] font-black rounded bg-slate-100 text-slate-400 uppercase">Module</span>
                          </td>
                          <td className="px-6 py-4 text-right text-[11px] font-bold text-slate-300">
                            {menu.submenus?.length} Submenus
                          </td>
                        </tr>
                        {expandedMenus[menu.id] && menu.submenus && renderSubmenusTable(menu.submenus)}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FIXED SAVE BUTTON */}
            <div className="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 md:bg-slate-50 md:border-t-0 md:border md:rounded-2xl md:p-4 flex flex-col md:flex-row justify-between items-center gap-4 mt-4 z-20">
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Requires refresh to apply changes.</p>
              <button
                onClick={savePermissions}
                disabled={isSaving}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 md:py-2.5 rounded-2xl md:rounded-xl font-black text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:bg-slate-300"
              >
                {isSaving ? "Syncing..." : "Update Permissions"}
                {!isSaving && <Save size={16} />}
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default SubMenuPermissionTable;