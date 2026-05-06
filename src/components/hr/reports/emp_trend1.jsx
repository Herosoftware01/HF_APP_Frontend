import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { Building2, ChevronDown, RotateCcw, ArrowLeft, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://10.1.21.13:8200/reports/work_report1/";

const Emp_trend1 = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({
        range: '1M',
        unit: 'ALL',
        start_date: '2026-05-01',
        end_date: '2026-05-04'
    });

    // Visibility Toggles
    const [showJoins, setShowJoins] = useState(true);
    const [showResigns, setShowResigns] = useState(true);
    const [dailyViewType, setDailyViewType] = useState('joins');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_BASE_URL, { params: filters });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching workforce data:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading || !data) {
        return <div className="flex h-screen items-center justify-center font-medium text-slate-500">Loading Analytics...</div>;
    }

    const handelNavi = () => {
        navigate("/hr/emp_trend");
    }

    const colors = {
        blue: '#3b82f6',
        darkBlue: '#1d4ed8',
        slate: '#94a3b8',
        darkSlate: '#475569',
        grid: '#f1f5f9',
        palette: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6']
    };



    // 1. MAIN TREND CHART CONFIG
    const mainTrendOptions = {
        chart: { stacked: false, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: [colors.blue, colors.darkBlue, colors.slate, colors.darkSlate],
        stroke: { width: [0, 3, 0, 3], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
        dataLabels: {
            enabled: true,
            enabledOnSeries: [0, 2],
            formatter: val => (val > 0 ? val : ""),
            style: { fontSize: "11px", fontWeight: "700", colors: [colors.darkSlate] }
        },
        xaxis: { type: 'datetime', labels: { style: { fontSize: "11px", colors: colors.slate } } },
        grid: { borderColor: colors.grid, strokeDashArray: 4 },
        legend: { position: "bottom" }
    };

    const mainTrendSeries = [
        ...(showJoins ? [
            { name: 'Joins', type: 'bar', data: data.x_ts.map((x, i) => [x, data.join_series[i]]) },
            { name: 'Join Trend', type: 'line', data: data.x_ts.map((x, i) => [x, data.join_series[i]]) }
        ] : []),
        ...(showResigns ? [
            { name: 'Resigns', type: 'bar', data: data.x_ts.map((x, i) => [x, data.resign_series[i]]) },
            { name: 'Resign Trend', type: 'line', data: data.x_ts.map((x, i) => [x, data.resign_series[i]]) }
        ] : [])
    ];

    // 2. UNIT TOTALS CONFIG
    const unitsAll = ["TOTAL", ...data.units];
    const totalJoins = data.unit_join_vals.reduce((a, b) => a + b, 0);
    const totalResigns = data.unit_resign_vals.reduce((a, b) => a + b, 0);

    const unitTotalsOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
        xaxis: { categories: unitsAll, labels: { style: { fontSize: '10px' } } },
        colors: [colors.blue, colors.slate],
        dataLabels: { enabled: true, offsetY: -20, style: { colors: [colors.darkSlate], fontSize: '10px' } },
    };

    const unitTotalsSeries = [
        { name: 'Joins', data: [totalJoins, ...data.unit_join_vals] },
        { name: 'Resigns', data: [totalResigns, ...data.unit_resign_vals] }
    ];

    // 3. DAILY TIMELINE CONFIG
    const dailyOptions = {
        chart: { type: "line", toolbar: { show: false } },
        colors: colors.palette,
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { type: 'datetime', categories: data.x_ts }, // Using timestamps from API
        grid: { borderColor: colors.grid, strokeDashArray: 4 },
        legend: { position: "bottom" }
    };

    const dailySeries = dailyViewType === 'joins' ? data.unit_daily_join_series : data.unit_daily_resign_series;

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-6 space-y-6 font-['Inter']">
            
            {/* Header / Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Unit Analytics</h1>
                            <p className="text-xs text-slate-500 font-medium">Workforce Movement by Unit</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button onClick={handelNavi} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">
                            <LayoutGrid size={16} /> Category View
                        </button>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <button 
                            onClick={() => setFilters({...filters, range: '1M'})}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full mb-5"></div>

                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    {/* Range Selector */}
                    <div className="flex bg-slate-100 p-1 rounded-lg self-start lg:self-center">
                        {['1M', '6M', '1Y', 'MAX'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setFilters({ ...filters, range: r })}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                                    filters.range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Unit & Date Selectors */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <select 
                                value={filters.unit}
                                onChange={(e) => setFilters({...filters, unit: e.target.value})}
                                className="appearance-none pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-medium min-w-[160px]"
                            >
                                <option value="ALL">All Units</option>
                                {data.units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                        </div>

                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2">
                            <input 
                                type="date" 
                                value={filters.start_date}
                                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                                className="bg-transparent border-none text-slate-600 text-xs font-medium focus:ring-0 py-2"
                            />
                            <span className="text-slate-400 px-1 text-xs font-bold">TO</span>
                            <input 
                                type="date" 
                                value={filters.end_date}
                                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                                className="bg-transparent border-none text-slate-600 text-xs font-medium focus:ring-0 py-2"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Filtered Trend Analysis</h2>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={showJoins} onChange={() => setShowJoins(!showJoins)} className="hidden" />
                            <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${showJoins ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${showJoins ? 'bg-blue-500' : 'bg-slate-300'}`}></span> Joins
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showResigns} onChange={() => setShowResigns(!showResigns)} className="hidden" />
                            <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${showResigns ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${showResigns ? 'bg-slate-500' : 'bg-slate-300'}`}></span> Resigns
                            </div>
                        </label>
                    </div>
                </div>
                <Chart options={mainTrendOptions} series={mainTrendSeries} type="line" height={380} />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Units Totals */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Totals per Unit</h2>
                    <Chart options={unitTotalsOptions} series={unitTotalsSeries} type="bar" height={350} />
                </div>

                {/* Daily Timeline */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Unit Comparison</h2>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setDailyViewType('joins')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${dailyViewType === 'joins' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Joins
                            </button>
                            <button 
                                onClick={() => setDailyViewType('resigns')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${dailyViewType === 'resigns' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Resigns
                            </button>
                        </div>
                    </div>
                    <Chart options={dailyOptions} series={dailySeries} type="line" height={350} />
                </div>
            </div>
        </div>
    );
};

export default Emp_trend1;