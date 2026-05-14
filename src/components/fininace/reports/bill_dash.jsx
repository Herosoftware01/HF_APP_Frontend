import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Bill_dash_de from './Bill_dash_de';

const Bill_dash = () => {
    const navigate = useNavigate();
    
    // --- State Management ---
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Initialize with empty strings to show "All Data" by default
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParams, setSelectedParams] = useState(null);

    // --- Effects ---

    // 1. Load FontAwesome for icons
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(link);
    }, []);

    // 2. Fetch data whenever dates change
    useEffect(() => {
        fetchData();
    }, [fromDate, toDate]);

    // --- Logic ---

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('from_date', fromDate);
            if (toDate) params.append('to_date', toDate);

            // Construct URL: If no dates, it fetches base URL (All Data)
            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await fetch(`http://10.1.21.13:8200/reports/bill_dash/${queryString}`);
            
            if (!response.ok) throw new Error("Network response was not ok");
            
            const result = await response.json();
            if (result.status === "success") {
                setData(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setData([]); 
        } finally {
            setLoading(false);
        }
    };

    const setDateFilter = (type) => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');

        if (type === 'month') {
            setFromDate(`${y}-${m}-01`);
            setToDate(`${y}-${m}-${d}`);
        } else if (type === 'year') {
            setFromDate(`${y}-01-01`);
            setToDate(`${y}-${m}-${d}`);
        }
    };

    const openModal = (employee, module, bucket) => {
        setSelectedParams({ employee, module, bucket, fromDate, toDate });
        setIsModalOpen(true);
    };

    // Navigation Handlers
    const payNavi = () => navigate('/finance_report/pay_dash');
    const handleNavi = () => navigate(-1);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Header / Navbar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                <i className="fa-solid fa-chart-pie text-lg"></i>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Aging Dashboard</h1>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <span className={!fromDate ? "text-indigo-600 font-bold" : ""}>
                                        {!fromDate ? 'Overall View' : 'Filtered Analysis'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>Pending Bills Analysis</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button onClick={() => setDateFilter('month')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 rounded-md hover:bg-white hover:text-indigo-600 transition-all">
                                    This Month
                                </button>
                                <button onClick={() => setDateFilter('year')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 rounded-md hover:bg-white hover:text-indigo-600 transition-all">
                                    This Year
                                </button>
                            </div>

                            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                <div className="px-3 py-2 border-r border-slate-100 bg-slate-50">
                                    <i className="fa-regular fa-calendar text-slate-400 text-xs"></i>
                                </div>
                                <div className="flex items-center">
                                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border-none text-xs font-bold text-slate-700 py-2 px-2 bg-transparent outline-none cursor-pointer" />
                                    <span className="text-slate-300 text-xs px-1">→</span>
                                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border-none text-xs font-bold text-slate-700 py-2 px-2 bg-transparent outline-none cursor-pointer" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {setFromDate(''); setToDate('')}} 
                                    className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-colors ${!fromDate ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100'}`} 
                                    title="Show All Data"
                                >
                                    <i className="fa-solid fa-filter-circle-xmark"></i>
                                </button>
                                <button onClick={payNavi} className="h-9 px-4 flex items-center gap-2 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-all">
                                    Payments <i className="fa-solid fa-arrow-right opacity-60"></i>
                                </button>
                                <button onClick={handleNavi} className="h-9 px-4 flex items-center gap-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-all">
                                    Back <i className="fa-solid fa-arrow-left opacity-60"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-4xl"></i>
                        <p className="text-slate-400 font-medium text-sm animate-pulse">Loading Records...</p>
                    </div>
                ) : data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {data.map((bill, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group">
                                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <i className="fa-solid fa-user text-sm"></i>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm truncate">{bill.display_name}</h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                                                {bill.module}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 pt-1">
                                        {bill.more_3 > 0 ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 border border-rose-100">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                                </span>
                                                <span className="text-[10px] font-bold text-rose-600 uppercase">Critical</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Safe</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                                    <button onClick={() => openModal(bill.display_name, bill.module, 'more_3')} className="p-4 flex flex-col items-center hover:bg-rose-50 transition-colors relative">
                                        {bill.more_3 > 0 && <div className="absolute top-0 inset-x-0 h-0.5 bg-rose-500"></div>}
                                        <span className="text-slate-400 uppercase text-[10px] font-bold mb-1">High Risk</span>
                                        <span className={`text-lg font-mono font-bold ${bill.more_3 > 0 ? 'text-rose-600' : 'text-slate-300'}`}>{bill.more_3}</span>
                                    </button>
                                    <button onClick={() => openModal(bill.display_name, bill.module, 'eq_3')} className="p-4 flex flex-col items-center hover:bg-amber-50 transition-colors relative">
                                        {bill.eq_3 > 0 && <div className="absolute top-0 inset-x-0 h-0.5 bg-amber-500"></div>}
                                        <span className="text-slate-400 uppercase text-[10px] font-bold mb-1">Warning</span>
                                        <span className={`text-lg font-mono font-bold ${bill.eq_3 > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{bill.eq_3}</span>
                                    </button>
                                    <button onClick={() => openModal(bill.display_name, bill.module, 'less_3')} className="p-4 flex flex-col items-center hover:bg-emerald-50 transition-colors relative">
                                        {bill.less_3 > 0 && <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-500"></div>}
                                        <span className="text-slate-400 uppercase text-[10px] font-bold mb-1">Normal</span>
                                        <span className={`text-lg font-mono font-bold ${bill.less_3 > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{bill.less_3}</span>
                                    </button>
                                </div>

                                <button onClick={() => openModal(bill.display_name, bill.module, 'total')} className="mt-auto p-4 flex items-center justify-between bg-slate-50/30 hover:bg-indigo-50 transition-colors group/btn">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase group-hover/btn:text-indigo-500">Total Pending</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-mono font-bold text-slate-700 group-hover/btn:text-indigo-700">{bill.total_bills}</span>
                                        <i className="fa-solid fa-chevron-right text-xs text-slate-300 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all"></i>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <i className="fa-solid fa-folder-open text-4xl mb-4 opacity-20"></i>
                        <p className="font-medium">No data matches your criteria.</p>
                        <button onClick={() => {setFromDate(''); setToDate('')}} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">
                            Reset to All Data
                        </button>
                    </div>
                )}
            </main>

            {/* Modal Portal */}
            {isModalOpen && (
                <Bill_dash_de 
                    params={selectedParams} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default Bill_dash;