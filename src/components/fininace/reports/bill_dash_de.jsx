import React, { useState, useEffect } from 'react';

const Bill_dash_de = ({ params, onClose }) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Helper to format date like Django's d-M-Y (e.g., 16-Apr-2025)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).replace(/ /g, '-');
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    employee: params?.employee || '',
                    module: params?.module || '',
                    bucket: params?.bucket || '',
                    from_date: params?.fromDate || '',
                    to_date: params?.toDate || ''
                });

                const url = `http://10.1.21.13:8200/reports/bill_details/?${query.toString()}`;
                const response = await fetch(url);
                const result = await response.json();
                
                // --- THE FIX IS HERE ---
                if (result && result.bills && Array.isArray(result.bills)) {
                    // It matches your screenshot: { "bills": [...] }
                    setBills(result.bills);
                } else if (result && Array.isArray(result.data)) {
                    setBills(result.data);
                } else if (Array.isArray(result)) {
                    setBills(result);
                } else {
                    setBills([]);
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                setBills([]);
            } finally {
                setLoading(false);
            }
        };

        if (params) fetchDetails();
    }, [params]);

    const filteredBills = bills.filter(bill => {
        const term = searchTerm.toLowerCase();
        return (
            String(bill.billno || '').toLowerCase().includes(term) ||
            String(bill.suppliers || '').toLowerCase().includes(term) ||
            String(bill.amount || '').includes(term)
        );
    });

    const getBucketLabel = () => {
        if(params?.bucket === 'less_3') return 'Safe (< 3 Days)';
        if(params?.bucket === 'eq_3') return 'Warning (= 3 Days)';
        if(params?.bucket === 'more_3') return 'Critical (> 3 Days)';
        return 'All Pending Bills';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
                
                {/* Modal Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800">{params?.employee || 'Unknown'}</h3>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md self-start mt-1">
                            {params?.module} • {getBucketLabel()}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                            <input 
                                type="text" 
                                placeholder="Search Bill No or Supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full rounded-lg border-0 py-2 pl-9 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-slate-50 outline-none"
                            />
                        </div>
                        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bill No</th>
                                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3.5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age (Days)</th>
                                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-3xl mb-3"></i>
                                        <p className="text-sm text-slate-500 font-medium">Retrieving Data...</p>
                                    </td>
                                </tr>
                            ) : filteredBills.length > 0 ? (
                                filteredBills.map((bill, idx) => (
                                    <tr key={idx} className="hover:bg-indigo-50 border-b">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{bill.billno || '-'}</td>
                                        <td className="px-6 py-4 text-xs text-slate-600">{formatDate(bill.billdate)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {bill.ageing > 3 ? (
                                                <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                                    {bill.ageing} Days
                                                </span>
                                            ) : bill.ageing === 3 ? (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                                    {bill.ageing} Days
                                                </span>
                                            ) : (
                                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold">
                                                    {bill.ageing} Days
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600">{bill.suppliers || '-'}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-700">
                                            {Number(bill.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No bills found for this filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Bill_dash_de;