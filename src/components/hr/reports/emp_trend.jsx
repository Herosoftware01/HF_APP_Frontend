import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, ArrowLeft, RotateCcw, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Emp_trend = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    range: '1M',
    start_date: '2026-05-01',
    end_date: '2026-05-04',
  });

  // Visibility States for Toggles
  const [showJoins, setShowJoins] = useState(true);
  const [showResigns, setShowResigns] = useState(true);
  const [showCatJoins, setShowCatJoins] = useState(true);
  const [showCatResigns, setShowCatResigns] = useState(true);
  const [timelineType, setTimelineType] = useState('joins'); // 'joins' or 'resigns'
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `https://hfapi.herofashion.com//reports/work_report/?${queryParams}`
      );
      const result = await response.json();
      if (result.status === 'success') {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching workforce data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Analytics...
      </div>
    );
  }

  const handelNavi = () => {
    navigate('/hr/emp_trend1');
  };

  const colors = {
    blue: '#3b82f6',
    darkBlue: '#1d4ed8',
    rose: '#f43f5e',
    slate: '#94a3b8',
    darkGray: '#4b5563',
    palette: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'],
  };

  // 1. Daily Trend Chart Config
  const trendSeries = [];
  if (showJoins) {
    trendSeries.push({
      name: 'Joins',
      type: 'bar',
      data: data.x_ts.map((x, i) => [x, data.join_series[i]]),
    });
    trendSeries.push({
      name: 'Join Trend',
      type: 'line',
      data: data.x_ts.map((x, i) => [x, data.join_series[i]]),
    });
  }
  if (showResigns) {
    trendSeries.push({
      name: 'Resigns',
      type: 'bar',
      data: data.x_ts.map((x, i) => [x, data.resign_series[i]]),
    });
    trendSeries.push({
      name: 'Resign Trend',
      type: 'line',
      data: data.x_ts.map((x, i) => [x, data.resign_series[i]]),
    });
  }

  const trendOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif',
    },
    colors: [colors.blue, colors.darkBlue, '#cbd5e1', colors.darkGray],
    stroke: { width: [0, 3, 0, 3], curve: 'smooth' },
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
    xaxis: { type: 'datetime', labels: { style: { colors: '#64748b' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { show: false },
  };

  // 2. Category Totals Chart Config
  const catSeries = [];
  if (showCatJoins) catSeries.push({ name: 'Joins', data: data.category_join });
  if (showCatResigns)
    catSeries.push({ name: 'Resigns', data: data.category_resign });

  const catOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    colors: [colors.blue, colors.rose],
    xaxis: {
      categories: data.categories,
      labels: { style: { colors: '#64748b' } },
    },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: '10px', colors: ['#304758'] },
    },
  };

  // 3. Category Timeline Chart Config
  const timelineSeries =
    timelineType === 'joins'
      ? data.daily_join_series.map((s) => ({ ...s, type: 'line' }))
      : data.daily_resign_series.map((s) => ({ ...s, type: 'line' }));

  const timelineOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: colors.palette,
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      type: 'datetime',
      categories: data.x_ts,
      labels: { style: { colors: '#64748b' } },
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: { position: 'bottom', horizontalAlign: 'left' },
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 space-y-6 font-['Inter']">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Workforce Analytics
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Joiners vs Resignations Trend Analysis
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handelNavi}
              className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
            >
              <LayoutGrid size={16} /> Unit-wise View
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() =>
                setFilters({
                  range: '1M',
                  start_date: '2026-05-01',
                  end_date: '2026-05-04',
                })
              }
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full mb-4"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['1M', '6M', '1Y', 'MAX'].map((r) => (
              <button
                key={r}
                onClick={() => setFilters({ ...filters, range: r })}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filters.range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden px-2">
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="bg-transparent border-none text-gray-600 text-xs font-medium focus:ring-0 py-2"
            />
            <span className="text-gray-400 px-1 text-xs">to</span>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="bg-transparent border-none text-gray-600 text-xs font-medium focus:ring-0 py-2"
            />
          </div>
        </div>
      </div>

      {/* Daily Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Daily Trends</h2>
          <div className="flex gap-3">
            <ToggleButton
              label="Joins"
              active={showJoins}
              color="bg-blue-500"
              onClick={() => setShowJoins(!showJoins)}
            />
            <ToggleButton
              label="Resigns"
              active={showResigns}
              color="bg-gray-400"
              onClick={() => setShowResigns(!showResigns)}
            />
          </div>
        </div>
        <Chart
          options={trendOptions}
          series={trendSeries}
          type="line"
          height={350}
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Totals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Category Totals</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCatJoins(!showCatJoins)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${showCatJoins ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              >
                Joins
              </button>
              <button
                onClick={() => setShowCatResigns(!showCatResigns)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${showCatResigns ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              >
                Resigns
              </button>
            </div>
          </div>
          <Chart
            options={catOptions}
            series={catSeries}
            type="bar"
            height={350}
          />
        </div>

        {/* Category Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Category Timeline
            </h2>
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setTimelineType('joins')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${timelineType === 'joins' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Joins
              </button>
              <button
                onClick={() => setTimelineType('resigns')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${timelineType === 'resigns' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
              >
                Resigns
              </button>
            </div>
          </div>
          <Chart
            options={timelineOptions}
            series={timelineSeries}
            type="line"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

// Reusable Toggle Component
const ToggleButton = ({ label, active, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm text-xs font-medium ${active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
  >
    <span
      className={`w-2 h-2 rounded-full ${active ? color : 'bg-gray-300'}`}
    ></span>{' '}
    {label}
  </button>
);

export default Emp_trend;
