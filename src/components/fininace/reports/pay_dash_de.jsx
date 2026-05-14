import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

const Pay_dash_de = ({ params, onClose }) => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Formatting module to avoid sending "null" as a string
                const cleanModule = (params.module && params.module !== 'null') ? params.module : '';
                
                const query = new URLSearchParams({
                    employee: params.employee || '',
                    module: cleanModule,
                    status: params.status || '',
                    aging: params.aging || '',
                    from_date: params.fromDate || '',
                    to_date: params.toDate || ''
                });

                const response = await fetch(`http://10.1.21.13:8200/reports/pay_details/?${query}`);
                const result = await response.json();

                // Handle both direct array responses and { data: [...] } responses
                if (Array.isArray(result)) {
                    setBills(result);
                } else if (result && Array.isArray(result.data)) {
                    setBills(result.data);
                } else {
                    setBills([]);
                }
            } catch (error) {
                console.error("Error fetching bill details:", error);
                setBills([]);
            } finally {
                setLoading(false);
            }
        };

        if (params) fetchDetails();
    }, [params]);

    // Safety check: ensure bills is an array before filtering
    const filteredBills = Array.isArray(bills) ? bills.filter(bill => 
        bill.billno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.suppliers?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            {/* Modal Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-20">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{params.employee}</h3>
                        <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">{params.status}</span>
                            {params.aging && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                    {params.aging === 'lt30' ? 'Normal' : params.aging === '30to45' ? 'Risk' : 'High Risk'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search bill no or supplier..." 
                                className="w-full md:w-72 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-auto bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-slate-400" size={32} />
                            <p className="text-sm text-slate-500 font-medium">Fetching records...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse bg-white">
                            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                                <tr className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-3">Bill No</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Ageing</th>
                                    <th className="px-6 py-3">Supplier</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBills.length > 0 ? filteredBills.map((bill, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors text-center">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700 whitespace-nowrap">
                                            {bill.billno || bill.billno1}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {bill.billdate ? new Date(bill.billdate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${bill.billpassed === 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                {bill.billpassed === 1 ? 'PASSED' : 'UNPASSED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <AgeingBadge days={bill.ageing} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-700 truncate max-w-[200px]" title={bill.suppliers}>
                                            {bill.suppliers || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-xs font-bold text-slate-800">
                                            {bill.amount ? parseFloat(bill.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-slate-400 font-medium">No records found matching criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const AgeingBadge = ({ days }) => {
    let colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (days >= 30 && days <= 45) colorClass = "bg-amber-100 text-amber-700 border-amber-200";
    if (days > 45) colorClass = "bg-rose-100 text-rose-700 border-rose-200";
    
    return (
        <span className={`${colorClass} px-2 py-0.5 rounded-full text-[10px] font-bold border`}>
            {days || 0} Days
        </span>
    );
};

export default Pay_dash_de;