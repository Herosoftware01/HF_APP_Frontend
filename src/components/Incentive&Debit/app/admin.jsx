import React, { useState, useEffect } from 'react';
import {
  UserPlus, FilePlus, Trash2, ShieldCheck, Database, ListFilter,
  X, CheckCircle2, LayoutGrid, AlertTriangle, ChevronDown,
  LogOut, Users, FileText
} from 'lucide-react';

const Admin = () => {
  const [view, setView] = useState('entry');
  const [statusList, setStatusList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [purposeList, setPurposeList] = useState([]);
  const [notification, setNotification] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  const [userData, setUserData] = useState({ username: '', password: '', dept: '' });
  const [purposeData, setPurposeData] = useState({ ste: 'Staff', type: 'Incentive', purpose: '' });

  const fetchStatusEntries = async () => {
    try {
      const response = await fetch('https://app.herofashion.com/incentive/api/incdeb/');
      const data = await response.json();
      setStatusList(data);
    } catch (error) {
      showNotification('Failed to load logs', 'error');
    }
  };

  const fetchManagementData = async () => {
    try {
      const userRes = await fetch('https://app.herofashion.com/incentive/api/incdeb_users/');
      if (userRes.ok) setUserList(await userRes.json());
      const purpRes = await fetch('https://app.herofashion.com/incentive/api/incdeb_purpose/');
      if (purpRes.ok) setPurposeList(await purpRes.json());
    } catch (error) {
      console.error("Error fetching data");
    }
  };

  useEffect(() => {
    if (view === 'delete') fetchStatusEntries();
    if (view === 'entry') fetchManagementData();
  }, [view]);

  const showNotification = (text, type) => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    showNotification('Logging out...', 'success');
    setTimeout(() => { window.location.href = '/login'; }, 1000);
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (type === 'user' && !userData.dept) {
      showNotification('Select Permission Level', 'error');
      return;
    }

    const endpoint = type === 'user' ? 'https://app.herofashion.com/incentive/api/incdeb_users/' : 'https://app.herofashion.com/incentive/api/incdeb_purpose/';
    const body = type === 'user' ? 
      { username: userData.username, password: userData.password, role: userData.dept } : 
      purposeData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        showNotification(`${type.toUpperCase()} saved`, 'success');
        fetchManagementData();
        type === 'user' ? setUserData({ username: '', password: '', dept: '' }) : setPurposeData({ ste: 'Staff', type: 'Incentive', purpose: '' });
      }
    } catch (error) {
      showNotification('Server Error', 'error');
    }
  };

  const initiateDelete = (id, type) => {
    if (type === 'log') {
      const entry = statusList.find(item => item.req_id === id);
      if (entry && entry.status.toLowerCase() !== 'pending') {
        showNotification('Only Pending records can be removed', 'error');
        return;
      }
    }
    setDeleteId(id);
    setDeleteType(type);
  };

  const confirmDelete = async () => {
    let url = `https://app.herofashion.com/incentive/api/${deleteType === 'log' ? 'incdeb' : 'incdeb_' + deleteType}/${deleteId}/`;
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        showNotification('Deleted successfully', 'success');
        if (deleteType === 'log') setStatusList(p => p.filter(i => i.req_id !== deleteId));
        else if (deleteType === 'user') setUserList(p => p.filter(i => i.id !== deleteId));
        else setPurposeList(p => p.filter(i => i.id !== deleteId));
      }
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* NAV BAR - Optimized for Mobile height & spacing */}
      <nav className="bg-slate-900 text-white h-16 sticky top-0 shrink-0 z-50 shadow-xl px-4 md:px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1.5 rounded-lg shrink-0"><ShieldCheck size={18} /></div>
            <span className="font-bold tracking-tight text-sm md:text-lg hidden sm:inline">Admin</span>
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl">
            <NavBtn active={view === 'entry'} onClick={() => setView('entry')} label="Mgmt" icon={<LayoutGrid size={16} />} />
            <NavBtn active={view === 'delete'} onClick={() => setView('delete')} label="Logs" icon={<Database size={16} />} />
          </div>

          <button onClick={handleLogout} className="p-2 md:px-4 md:py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* TOAST - Adjusted position for mobile */}
      {notification && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-72 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4">
          <div className={notification.type === 'success' ? 'text-emerald-500' : 'text-red-500'}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          </div>
          <span className="font-bold text-xs md:text-sm text-slate-700">{notification.text}</span>
        </div>
      )}

      {/* MAIN CONTENT - Grid switching from 1 to 2 cols */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {view === 'entry' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-10">
              {/* USER SECTION */}
              <div className="space-y-6">
                <FormContainer title="Register Admin" icon={<UserPlus size={20} className="text-indigo-600" />}>
                  <form onSubmit={(e) => handleSubmit(e, 'user')} className="space-y-4">
                    <Input label="Username" value={userData.username} onChange={(e) => setUserData({ ...userData, username: e.target.value })} />
                    <Input label="Password" type="password" value={userData.password} onChange={(e) => setUserData({ ...userData, password: e.target.value })} />
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permissions</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Admin', 'Action', 'Request', 'Statement'].map((r) => (
                          <button key={r} type="button" onClick={() => setUserData({ ...userData, dept: r })}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${userData.dept === r ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">Register User</button>
                  </form>
                </FormContainer>

                <SectionBox title="Existing Users" icon={<Users size={18} />}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[300px]">
                      <thead className="text-[10px] uppercase text-slate-400 font-black">
                        <tr>
                          <th className="pb-2">User</th>
                          <th className="pb-2">Perm</th>
                          <th className="pb-2 text-right">Del</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {userList.filter(u => u.screen_per !== 'Admin').map((u) => (
                          <tr key={u.id} className="border-t border-slate-50">
                            <td className="py-3 font-bold text-slate-700">{u.username}</td>
                            <td className="py-3"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">{u.screen_per}</span></td>
                            <td className="py-3 text-right">
                              <button onClick={() => initiateDelete(u.id, 'user')} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionBox>
              </div>

              {/* PURPOSE SECTION */}
              <div className="space-y-6">
                <FormContainer title="Purpose" icon={<FilePlus size={20} className="text-sky-600" />}>
                  <form onSubmit={(e) => handleSubmit(e, 'purpose')} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="STE" value={purposeData.ste} options={['Staff', 'Employee']} onChange={(e) => setPurposeData({ ...purposeData, ste: e.target.value })} />
                      <SelectField label="Type" value={purposeData.type} options={['Incentive', 'Debit']} onChange={(e) => setPurposeData({ ...purposeData, type: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                      <textarea className="p-3 bg-white border border-slate-200 rounded-2xl text-sm h-24 focus:ring-4 focus:ring-sky-500/10 outline-none"
                        value={purposeData.purpose} onChange={(e) => setPurposeData({ ...purposeData, purpose: e.target.value })} required />
                    </div>
                    <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg">Save Parameters</button>
                  </form>
                </FormContainer>

                <SectionBox title="Defined Purposes" icon={<FileText size={18} />}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[400px]">
                      <thead className="text-[10px] uppercase text-slate-400 font-black">
                        <tr>
                          <th className="pb-2 w-1/4">Info</th>
                          <th className="pb-2">Description</th>
                          <th className="pb-2 text-right">Del</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {purposeList.map((p) => (
                          <tr key={p.id} className="border-t border-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-700 text-xs">{p.ste}</div>
                              <div className={`text-[9px] font-black uppercase ${p.type === 'Incentive' ? 'text-emerald-500' : 'text-red-500'}`}>{p.type}</div>
                            </td>
                            <td className="py-3 text-slate-500 text-xs pr-4">{p.purpose}</td>
                            <td className="py-3 text-right">
                              <button onClick={() => initiateDelete(p.id, 'purpose')} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionBox>
              </div>
            </div>
          ) : (
            /* LOGS VIEW - Responsive Table */
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
              <div className="p-5 md:p-8 flex justify-between items-center bg-white border-b border-slate-50">
                <h3 className="text-lg font-black text-slate-800">Logs</h3>
                <div className="bg-indigo-50 px-3 py-1.5 rounded-xl text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                  {statusList.length} Entries
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 md:px-8">
                <table className="w-full text-left border-separate border-spacing-y-2 min-w-[700px]">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-2 px-4">ID</th>
                      <th className="pb-2 px-4">Entity</th>
                      <th className="pb-2 px-4">Type</th>
                      <th className="pb-2 px-4">Amount</th>
                      <th className="pb-2 px-4">Status</th>
                      <th className="pb-2 px-4 text-center">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusList.map((item) => (
                      <tr key={item.req_id}>
                        <td className="bg-slate-50 py-3 px-4 rounded-l-xl font-mono text-xs font-bold text-indigo-500">{item.req_id}</td>
                        <td className="bg-slate-50 py-3 px-4">
                          <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{item.code}</div>
                        </td>
                        <td className="bg-slate-50 py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${item.req_type === 'incentive' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.req_type}</span>
                        </td>
                        <td className="bg-slate-50 py-3 px-4 font-black text-slate-600 text-xs">₹{item.amt}</td>
                        <td className={`bg-slate-50 py-3 px-4 text-[10px] font-black uppercase ${item.status === "Pending" ? "text-yellow-600" : item.status === "Approved" ? "text-green-600" : "text-red-600"}`}>{item.status}</td>
                        <td className="bg-slate-50 py-3 px-4 text-center rounded-r-xl">
                          <button onClick={() => initiateDelete(item.req_id, 'log')} className="p-2 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DELETE MODAL - Made more compact for small screens */}
      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-xs w-full p-6 md:p-10 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-slate-800">Confirm Delete</h3>
            <p className="text-slate-500 mt-2 text-xs">Deleting <span className="text-slate-900 font-bold">#{deleteId}</span> cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => { setDeleteId(null); setDeleteType(null); }} className="py-3 text-sm font-bold text-slate-400">Cancel</button>
              <button onClick={confirmDelete} className="py-3 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavBtn = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${active ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>
    {icon} <span className="hidden xs:inline">{label}</span>
  </button>
);

const FormContainer = ({ title, icon, children }) => (
  <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <h3 className="font-black text-slate-800 text-sm md:text-base tracking-tight uppercase">{title}</h3>
    </div>
    {children}
  </div>
);

const SectionBox = ({ title, icon, children }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
    <div className="flex items-center gap-2 mb-4 px-2">
      <span className="text-slate-400">{icon}</span>
      <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
    </div>
    <div className="max-h-60 overflow-y-auto px-2">
      {children}
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input className="p-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm" required {...props} />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none pr-8" {...props}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900" />
    </div>
  </div>
);

export default Admin;