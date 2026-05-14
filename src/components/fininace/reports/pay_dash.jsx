import React, { useState, useEffect } from 'react';
import { 
    PieChart, 
    User, 
    Folder, 
    RotateCcw, 
    Search, 
    X, 
    Loader2 
} from 'lucide-react';
import Pay_dash_de from '../reports/pay_dash_de';

const Pay_dash = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedBillParams, setSelectedBillParams] = useState(null);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('from_date', fromDate);
            if (toDate) params.append('to_date', toDate);
            
            const response = await fetch(`http://10.1.21.13:8200/reports/pay_dash/?${params}`);
            const result = await response.json();
            // API returns { data: [...] }
            setEntries(result.data || []);
        } catch (error) {
            console.error("Error fetching summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [fromDate, toDate]);

    const setQuickFilter = (type) => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        if (type === 'month') {
            setFromDate(`${yyyy}-${mm}-01`);
            setToDate(`${yyyy}-${mm}-${dd}`);
        } else if (type === 'year') {
            setFromDate(`${yyyy}-01-01`);
            setToDate(`${yyyy}-${mm}-${dd}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans">
            <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-lg">
                                <PieChart size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Ageing Dashboard</h1>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Paid vs Unpaid Analysis</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button onClick={() => setQuickFilter('month')} className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-md hover:bg-white hover:text-slate-900 transition-all">This Month</button>
                                <button onClick={() => setQuickFilter('year')} className="px-3 py-1.5 text-xs font-bold text-slate-600 rounded-md hover:bg-white hover:text-slate-900 transition-all">This Year</button>
                            </div>

                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-[10px] font-bold">
                                <label className="text-slate-400 uppercase">From</label>
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border-none focus:ring-0 p-0 text-slate-700 font-bold" />
                                <div className="w-px h-4 bg-slate-300"></div>
                                <label className="text-slate-400 uppercase">To</label>
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border-none focus:ring-0 p-0 text-slate-700 font-bold" />
                            </div>

                            {(fromDate || toDate) && (
                                <button onClick={() => {setFromDate(''); setToDate('')}} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                    <RotateCcw size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-slate-400" size={40} />
                        <p className="text-slate-500 font-medium">Loading Summary...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {entries.length > 0 ? entries.map((row, idx) => (
                            <DashboardCard 
                                key={idx} 
                                row={row} 
                                onOpenModal={(status, aging) => setSelectedBillParams({
                                    employee: row.display_name,
                                    module: row.module,
                                    status,
                                    aging,
                                    fromDate,
                                    toDate
                                })} 
                            />
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No summary data available.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedBillParams && (
                <Pay_dash_de 
                    params={selectedBillParams} 
                    onClose={() => setSelectedBillParams(null)} 
                />
            )}
        </div>
    );
};

const DashboardCard = ({ row, onOpenModal }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                    <User size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">{row.display_name}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        <Folder size={10} /> {row.module || 'General Items'}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bills</span>
                <span className="font-mono font-bold text-slate-700 text-base">{row.total_bills}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Unpaid</h4>
                    </div>
                    <button onClick={() => onOpenModal('Unpaid', '')} className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-[10px] font-bold border border-rose-100 hover:bg-rose-100 transition-colors">
                        TOTAL: {row.unpaid_count}
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <AgingButton label="Normal" sub="< 30" count={row.unpaid_lt_30} color="emerald" onClick={() => onOpenModal('Unpaid', 'lt30')} />
                    <AgingButton label="Risk" sub="30-45" count={row.unpaid_30_45} color="yellow" onClick={() => onOpenModal('Unpaid', '30to45')} />
                    <AgingButton label="High Risk" sub="> 45" count={row.unpaid_gt_45} color="rose" onClick={() => onOpenModal('Unpaid', 'gt45')} />
                </div>
            </div>

            <div className="p-4 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Paid</h4>
                    </div>
                    <button onClick={() => onOpenModal('Paid', '')} className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                        TOTAL: {row.paid_count}
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <AgingButton label="Normal" sub="< 30" count={row.paid_lt_30} color="emerald" onClick={() => onOpenModal('Paid', 'lt30')} />
                    <AgingButton label="Risk" sub="30-45" count={row.paid_30_45} color="yellow" onClick={() => onOpenModal('Paid', '30to45')} />
                    <AgingButton label="High Risk" sub="> 45" count={row.paid_gt_45} color="rose" onClick={() => onOpenModal('Paid', 'gt45')} />
                </div>
            </div>
        </div>
    </div>
);

const AgingButton = ({ label, sub, count, color, onClick }) => {
    const colors = {
        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-200',
        yellow: 'border-yellow-100 bg-yellow-50 text-yellow-600 hover:border-yellow-200',
        rose: 'border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-200'
    };
    return (
        <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-lg border transition-all hover:shadow-sm ${colors[color]}`}>
            <span className="text-[10px] font-bold uppercase">{label}</span>
            <span className="text-[9px] opacity-70 font-bold">({sub})</span>
            <span className="font-mono font-bold text-slate-700 text-lg mt-1">{count}</span>
        </button>
    );
};

export default Pay_dash;