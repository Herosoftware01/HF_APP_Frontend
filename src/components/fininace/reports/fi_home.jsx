import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PieChart, 
  Signature, 
  Wallet, 
  Circle 
} from 'lucide-react';

const Fi_home = () => {
  const currentYear = new Date().getFullYear();

  const menuItems = [
    {
      title: "Bill Entry",
      desc: "Manage invoices & date aging.",
      icon: <FileText size={32} />,
      path: "/finance_report/bill",
      color: "orange",
    },
    {
      title: "Payment Status",
      desc: "Track transactions & history.",
      icon: <PieChart size={32} />,
      path: "/finance_report/pass",
      color: "blue",
    },
    {
      title: "Approvals",
      desc: "Authorize pending requests.",
      icon: <Signature size={32} />,
      path: "/finance_report/approve",
      color: "emerald",
    },
    {
      title: "Bills & Payments Dashboard",
      desc: "Overall payment insights.",
      icon: <Wallet size={32} />,
      path: "/finance_report/bill_dash", // Matches your logic
      color: "purple",
    }
    
  ];

  // Helper to handle dynamic Tailwind classes
  const getColorClasses = (color) => {
    const variants = {
      orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600",
      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
      emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
      purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
    };
    return variants[color] || variants.blue;
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#F8FAFC] font-['Outfit'] relative">
      
      {/* Decorative Background Circles */}
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-blue-200 rounded-full blur-[60px] opacity-50 animate-pulse -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-200 rounded-full blur-[60px] opacity-30 -z-10"></div>

      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 w-full max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="w-full text-left md:text-center mb-8 md:mb-12 space-y-2">
          <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-500 mb-2 shadow-sm">
            <Circle className="inline-block w-2 h-2 text-emerald-500 mr-1.5 fill-emerald-500" />
            System Online
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-lg md:mx-auto">
            Manage your invoices, track payments, and handle approvals efficiently.
          </p>
        </div>

        {/* Grid Container */}
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="group bg-white rounded-2xl p-4 md:p-8 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-6 relative overflow-hidden"
            >
              {/* Corner Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-50 rounded-bl-full -mr-6 -mt-6 hidden md:block opacity-50`}></div>
              
              {/* Icon Container */}
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-sm group-hover:text-white ${getColorClasses(item.color)}`}>
                {item.icon}
              </div>

              {/* Text content */}
              <div className="flex-grow z-10">
                <h3 className="text-lg md:text-xl font-bold text-slate-800">{item.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs">
        &copy; {currentYear} Hero Fashion. Secure Environment.
      </footer>
    </div>
  );
};

export default Fi_home;