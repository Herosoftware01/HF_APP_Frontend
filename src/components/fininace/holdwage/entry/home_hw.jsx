import { useNavigate } from "react-router-dom";

const Home_hw = () => {
  const navigate = useNavigate();

  // Navigation handler using the hook
  const handleNavigate = (path) => {
  navigate(`/holdwage/${path}`);
};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
          Hold Wages Entry System
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage payroll holds and view system reports
        </p>
      </header>

      {/* Action Cards */}
      {/* Updated grid-cols to 3 for better layout with three items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        
        {/* Entry Card */}
        <button 
          onClick={() => handleNavigate('/holdwage/hold')}
          className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-500 transition-all duration-300 text-left"
        >
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hold Wage Entry</h2>
          <p className="text-slate-500 mt-2">Input new wage hold records into the database.</p>
          <div className="mt-4 text-blue-600 font-semibold flex items-center">
            Get Started <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Report Card */}
        <button 
          onClick={() => handleNavigate('/holdwage/reports/hw_report')}
          className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-green-500 transition-all duration-300 text-left"
        >
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hild Wage Details Reports</h2>
          <p className="text-slate-500 mt-2">Analyze and export existing wage hold data.</p>
          <div className="mt-4 text-green-600 font-semibold flex items-center">
            View Reports <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Paid Report Card */}
        <button 
          onClick={() => handleNavigate('/holdwage/reports/paid_report')}
          className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-500 transition-all duration-300 text-left"
        >
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hold Wage Paid Reports</h2>
          <p className="text-slate-500 mt-2">View and manage settled wage payments and history.</p>
          <div className="mt-4 text-purple-600 font-semibold flex items-center">
            View Paid <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

      </div>
      
      <footer className="mt-16 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Wage Management Portal
      </footer>
    </div>
  );
};

export default Home_hw;