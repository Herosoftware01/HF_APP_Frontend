import React, { useEffect, useState, useRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Inject,
  Filter,
  Group,
  Reorder,
  Search,
} from '@syncfusion/ej2-react-grids';

interface TallyReportData {
  ledgername: string | null;
  talled: string | null;
  tallyledgername: string | null;
  tallyclosingbalance: string | null;
  omsbal: string | null;
  diff: string | null;
  primarygroup: string | null;
}

const TallyBalanceReport: React.FC = () => {
  const [dataSource, setDataSource] = useState<TallyReportData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const[showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState<string>('');

  const gridRef = useRef<GridComponent>(null);
  const searchTimeout = useRef<any>(null);

  const searchableFields =[
    'ledgername', 'tallyledgername', 'primarygroup', 'talled'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://app.herofashion.com/omstalbal/');
        const textData = await response.text();
        
        // Fix invalid JSON (Replace unquoted NaN with null)
        const fixedJson = textData.replace(/:\s*NaN\b/g, ': null');
        const data: TallyReportData[] = JSON.parse(fixedJson);

        setDataSource(data);
        setTotalCount(data.length);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  },[]);

  // --- Highlighting Logic for Search ---
  const highlightText = (text: any) => {
    if (!searchKey || text === undefined || text === null) return text;
    const stringText = String(text);
    const escapedKey = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = stringText.split(new RegExp(`(${escapedKey})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchKey.toLowerCase() ?
            <span key={i} className="custom-highlight">{part}</span> : part
        )}
      </span>
    );
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKey(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (gridRef.current) gridRef.current.search(value);
    }, 400);
  };

  const updateCounts = () => {
    if (gridRef.current) {
      const records = gridRef.current.getFilteredRecords();
      setShowingCount(Array.isArray(records) ? records.length : 0);
    }
  };

  // --- Utility Formatting Functions ---
  
  // Convert number to Indian format (e.g., 1,50,000.00)
  const formatCurrency = (val: string | null) => {
    if (!val) return '0.00';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --- Custom Column Templates ---

  const genericHighlighter = (field: keyof TallyReportData) => (p: TallyReportData) => (
    <span style={{ color: '#334155', fontWeight: 500 }}>{highlightText(p[field])}</span>
  );

  const groupTemplate = (p: TallyReportData) => {
    if (!p.primarygroup) return null;
    return (
      <div style={{
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        display: 'inline-block',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {highlightText(p.primarygroup)}
      </div>
    );
  };

  const omsBalTemplate = (p: TallyReportData) => (
    <div style={{ fontWeight: '600', color: '#475569' }}>{formatCurrency(p.omsbal)}</div>
  );

  const tallyBalTemplate = (p: TallyReportData) => (
    <div style={{ fontWeight: '600', color: '#475569' }}>{formatCurrency(p.tallyclosingbalance)}</div>
  );

  // Advanced Difference Template (Red Badge for Mismatch, Green text for 0)
  const diffTemplate = (p: TallyReportData) => {
    const diffValue = parseFloat(p.diff || '0');
    const isMismatch = diffValue !== 0;

    if (isMismatch) {
      return (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: 'bold',
          display: 'inline-block',
          border: '1px solid #f87171'
        }}>
          {formatCurrency(p.diff)}
        </div>
      );
    }

    return (
      <div style={{ color: '#16a34a', fontWeight: 'bold' }}>
        {formatCurrency(p.diff)} ✓
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '18px', fontWeight: 'bold' }}>
      <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginRight: '15px' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      Loading Data...
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      
      {/* HEADER SECTION - MODERNIZED */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 25px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        zIndex: 10,
        flexShrink: 0
      }}>
        
        {/* Title & Count Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            color: '#2563eb', 
            padding: '6px 15px', 
            borderRadius: '20px', 
            fontSize: '13px', 
            fontWeight: 'bold',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)'
          }}>
            Showing: {showingCount} / {totalCount}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>
            📊 TALLY VS OMS BALANCE
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '320px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '10px', width: '16px', height: '16px', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Search ledgers, groups..."
            value={searchKey}
            onChange={onSearchChange}
            style={{
              width: '100%',
              padding: '9px 15px 9px 38px',
              borderRadius: '25px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              outline: 'none',
              fontSize: '13px',
              color: '#334155',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#ffffff'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'; }}
          />
        </div>
      </div>

      {/* GRID SECTION */}
      <div style={{ flex: 1, width: '100%', padding: '15px', overflow: 'hidden' }}>
        <style>{`
          /* Highlight Matches */
          .custom-highlight { background-color: #fef08a !important; color: #854d0e !important; font-weight: bold; border-radius: 2px; padding: 0 2px; }
          
          /* Syncfusion Grid Container Overrides */
          .e-grid { border: none !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; font-family: 'Segoe UI', Inter, sans-serif !important; }
          
          /* Headers Customization */
          .e-grid .e-gridheader { background-color: #f1f5f9 !important; border-bottom: 2px solid #cbd5e1 !important; }
          .e-grid .e-headercell { color: #475569 !important; font-size: 12px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; }
          
          /* Row Cell Customization */
          .e-grid .e-rowcell { font-size: 13px !important; border-bottom: 1px solid #f1f5f9 !important; padding-top: 12px !important; padding-bottom: 12px !important; vertical-align: middle !important; }
          
          /* Alternate rows and Hover Effect */
          .e-grid .e-altrow { background-color: #fafaf9 !important; }
          .e-grid .e-row:hover .e-rowcell { background-color: #f0fdf4 !important; transition: background-color 0.2s ease; cursor: default; }

          /* Clean up Filter Popups */
          .e-filter-popup { z-index: 10000001 !important; border-radius: 8px !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
        `}</style>

        <GridComponent
          ref={gridRef}
          dataSource={dataSource}
          dataBound={updateCounts}
          height="100%"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
          filterSettings={{ type: 'Excel' }}
          gridLines="Horizontal"
          searchSettings={{ fields: searchableFields, operator: 'contains', ignoreCase: true }}
        >
          <ColumnsDirective>
            <ColumnDirective field="ledgername" headerText="OMS Ledger Name" width="220" template={genericHighlighter('ledgername')} />
            <ColumnDirective field="tallyledgername" headerText="Tally Ledger Name" width="220" template={genericHighlighter('tallyledgername')} />
            <ColumnDirective field="primarygroup" headerText="Primary Group" width="180" template={groupTemplate} />
            
            <ColumnDirective field="omsbal" headerText="OMS Bal" width="120" textAlign="Right" template={omsBalTemplate} />
            <ColumnDirective field="tallyclosingbalance" headerText="Tally Bal" width="120" textAlign="Right" template={tallyBalTemplate} />
            <ColumnDirective field="diff" headerText="Difference" width="140" textAlign="Right" template={diffTemplate} />
            
            <ColumnDirective field="talled" headerText="Tally ID" width="100" textAlign="Center" template={genericHighlighter('talled')} />
          </ColumnsDirective>
          
          <Inject services={[Sort, Filter, Group, Reorder, Search]} />
        </GridComponent>
      </div>
    </div>
  );
};

export default TallyBalanceReport;