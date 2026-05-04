import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, Menu, X, LayoutDashboard, User, LogOut, Search, Circle } from "lucide-react";
import { api } from "../auth/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../auth/auth";
import { UserContext } from "../UserContext";
import image from "../assets/Hero Logo.png" 

// --- Custom Component to handle API Image Icons or Default Lucide Icons ---
const MenuIcon = ({ iconData, isActive }) => {
  if (!iconData) {
    return <LayoutDashboard size={18} className={isActive ? "text-cyan-400" : "text-white/40"} />;
  }

  // If iconData is a URL (starts with http)
  if (typeof iconData === "string" && iconData.startsWith("http")) {
    return (
      <img
        src={iconData}
        alt="icon"
        className={`w-5 h-5 object-contain transition-all duration-300 ${
          isActive ? "brightness-125 scale-110" : "brightness-100 opacity-60 group-hover:opacity-100"
        }`}
        onError={(e) => {
          e.target.style.display = 'none'; 
        }}
      />
    );
  }
  return <LayoutDashboard size={18} className={isActive ? "text-cyan-400" : "text-white/40"} />;
};

function Sidebar({ children }) {
  const [menus, setMenus] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { setUsername } = useContext(UserContext);
  const { setRole } = useContext(UserContext);
  const { setUserId } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Fetch Sidebar Data
  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const res = await api.get("/sidebar/");
        setMenus(res.data.menus || []);
        setUserName(res.data.user?.username || "Admin");
        if (setUsername) setUsername(res.data.user?.username || "Admin");
        if (setUserId) setUserId(res.data.user?.id || "");
        if (setRole) setRole(res.data.user?.role || null);
      } catch (err) {
        console.error("Sidebar API error:", err);
      }
    };
    fetchSidebar();
  }, [setUsername,setUserId,setRole]);

  // 2. Logic: Check if active
  const isChildActive = useCallback((item) => {
    if (item.path && item.path === location.pathname) return true;
    const children = item.submenus || item.children || [];
    return children.some(child => isChildActive(child));
  }, [location.pathname]);

  // 3. Auto-expand path
  useEffect(() => {
    const newOpenState = {};
    const findAndExpand = (items, level = 1) => {
      items.forEach(item => {
        if (isChildActive(item)) {
          newOpenState[level] = item.id;
          const children = item.submenus || item.children || [];
          if (children.length > 0) findAndExpand(children, level + 1);
        }
      });
    };
    findAndExpand(menus);
    setOpenMenus(prev => ({ ...prev, ...newOpenState }));
  }, [location.pathname, menus, isChildActive]);

  // 4. Search Filter
  const filteredMenus = useMemo(() => {
    if (!searchTerm.trim()) return menus;
    const filterItems = (items) => {
      return items.map((item) => {
        const isMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const children = item.submenus || item.children || [];
        const filteredChildren = filterItems(children);
        if (isMatch || filteredChildren.length > 0) return { ...item, submenus: filteredChildren };
        return null;
      }).filter(Boolean);
    };
    return filterItems(menus);
  }, [searchTerm, menus]);

  const toggleSubMenu = (id, level) => {
    setOpenMenus(prev => {
      const newState = { ...prev };
      if (prev[level] === id) delete newState[level];
      else newState[level] = id;
      Object.keys(newState).forEach(key => { if (parseInt(key) > level) delete newState[key]; });
      return newState;
    });
  };

  // 5. Submenu Renderer
  const RenderSubMenu = ({ items, level = 2, isMobile = false }) => (
    <div className="flex flex-col w-full mt-1">
      {items.map((item) => {
        const children = item.submenus || item.children || [];
        const hasChildren = children.length > 0;
        const isActive = location.pathname === item.path;
        const isParentActive = isChildActive(item);
        const isOpen = openMenus[level] === item.id || (searchTerm && hasChildren);

        return (
          <div key={item.id} className="w-full">
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleSubMenu(item.id, level);
                if (item.path) {
                  navigate(item.path);
                  if (isMobile) setMobileMenuOpen(false);
                }
              }}
              className={`flex items-center justify-between cursor-pointer py-2 pr-4 transition-all duration-200 group
                ${isActive 
                  ? "bg-cyan-600 text-white font-bold rounded-lg mx-2 shadow-md" 
                  : isParentActive 
                  ? "text-cyan-400 font-semibold" 
                  : "text-white/50 hover:text-white hover:bg-white/5"}`}
              style={{ paddingLeft: `${level * 16}px` }}
            >
              <div className="flex items-center gap-2">
                {!hasChildren && <Circle size={4} className={isActive ? "fill-white" : "fill-current opacity-40"} />}
                <span className="text-[12px] truncate uppercase tracking-tight">{item.name}</span>
              </div>
              {hasChildren && <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : "opacity-40"}`} />}
            </div>
            {hasChildren && isOpen && (
              <RenderSubMenu items={children} level={level + 1} isMobile={isMobile} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <style>{`.no-scrollbar::-webkit-scrollbar { display:none }`}</style>

      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-10 bg-cyan-950 text-white flex items-center justify-between px-2 z-[90] shadow-xl">
        <button onClick={() => setMobileMenuOpen(true)} className=" hover:bg-white/10 rounded-xl">
          <Menu size={20} />
        </button>
        
          <div className="flex justify-evenly">
            <span className="font-bold text-lg text-center" style={{color: '#75c15b'}}>HeroFashion</span>
            <div className="text-center text-xs text-white ml-2">
                  Powered by 
                  <span className="font-bold text-lg pl-2 text-cyan-400"><a href="https://www.syncfusion.com" target="_blank" className="hover:underline text-md" style={{color: '#75c15b'}}>
                    Syncfusion
                  </a></span>
                  
            </div>
          </div>
        
        {/* <div className="w-9 h-9 bg-cyan-800 rounded-full flex items-center justify-center font-bold border border-white/20">{userName[0]}</div> */}
        <div className="flex items-center justify-center font-bold text-sm">{userName}</div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[110] bg-cyan-950 text-white transition-all duration-300 flex flex-col shadow-2xl
        ${mobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"}
        ${sidebarOpen ? "lg:w-64" : "lg:w-20"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 shrink-0 bg-black/20 border-b border-white/5">
          {(sidebarOpen || mobileMenuOpen) && (
            <div className="items-center gap-2">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
                <img src={image} alt="Herofashion logo" />
               </div>
               <span className="font-bold text-green-500 text-lg italic" style={{color: '#75c15b'}}>Herofashion</span>
               
            </div>

            <div className="text-center text-xs text-white ">
              Powered by
              <a href="https://www.syncfusion.com" target="_blank" className="font-bold hover:underline ml-1 text-lg italic" style={{color: '#75c15b'}}>
                Syncfusion
              </a>
            </div>
            </div>
            
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-2 hover:bg-white/10 rounded-lg transition-all active:scale-95">
             {sidebarOpen ? <X size={18} /> : <Menu size={20} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
             <X size={20} />
          </button>
        </div>

        {(sidebarOpen || mobileMenuOpen) && (
          <div className="px-4 py-5 shrink-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400" size={14} />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-white/20"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1">
          {filteredMenus.map((menu) => {
            const hasChildren = (menu.submenus || menu.children || []).length > 0;
            const isActive = isChildActive(menu);
            const isOpen = openMenus[1] === menu.id || (searchTerm && hasChildren);

            return (
              <div key={menu.id} className="px-3">
                <div
                  onClick={() => {
                    if (hasChildren) toggleSubMenu(menu.id, 1);
                    if (menu.path) { navigate(menu.path); if (mobileMenuOpen) setMobileMenuOpen(false); }
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-300 group
                    ${isActive ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                       <MenuIcon iconData={menu.icon} isActive={isActive} />
                    </div>
                    {(sidebarOpen || mobileMenuOpen) && (
                      <span className={`text-[13px] tracking-wide ${isActive ? "font-bold" : "font-medium opacity-80 group-hover:opacity-100"}`}>
                        {menu.name}
                      </span>
                    )}
                  </div>
                  {hasChildren && (sidebarOpen || mobileMenuOpen) && (
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "opacity-30"}`} />
                  )}
                </div>
                {hasChildren && isOpen && (
                  <div className="mt-1 ml-4 border-l border-white/5 bg-black/5 rounded-bl-xl overflow-hidden">
                    <RenderSubMenu items={menu.submenus || menu.children} level={2} isMobile={mobileMenuOpen} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-black/30 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg text-white">
                  <User size={20} />
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-cyan-950 rounded-full"></div>
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black truncate uppercase tracking-widest text-white">{userName}</p>
                <button onClick={logoutUser} className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                   <LogOut size={12} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="min-h-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Sidebar;