import React, { useEffect, useState, useRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Inject,
  Resize,
  Filter,
  Group,
  Reorder,
  Search,
  VirtualScroll,
} from '@syncfusion/ej2-react-grids';


// Define Order Data Interface for the join
interface OrderData {
  jobno_oms: string;

  company_name?: string;
  buyer1?: string;
  reference?: string;
  merch?: string; 
  director_sample_order?: string;

  // Style & Design
  stylename?: string;
  styleno?: string;
  styledesc?: string;
  mainimagepath?: string;
  img_fpath?: string;
  prnclr?: string | null; 
  prnfile1?: string;
  prnfile2?: string;

  // Production Details
  production_type_inside_outside?: string;
  uom?: string; 
  quantity?: string;
  printing_R?: string;
  Fdt?: string;
  Emb?: string; 
  abc?: string;
  quality_controller?: string;
  punit_sh?: string;

  // Logistics & Dates
  podate?: string;
  pono?: string;
  slno?: string;
  date?: string;
  insdate?: string;
  insdatenew?: string;
  insdateyear?: string;
  actdaten?: string;
  actyeardate?: string;
  vessel_dt?: string;
  vessel_yr?: string;
  final_delivery_date?: string;
  finaldelvdate?: string;
  ourdelvdate?: string;
  order_follow_up?: string;
  shipment_complete?: string;

  // Utility/Custom Fields
  u7?: string;
  u8?: string;
  u14?: string;
  u15?: string;
  u25?: string;
  u31?: string;
  u36?: string;
  u37?: string;
  u45?: string;
  u46?: string;
  u141?: string;

  [key: string]: any; 
}


// Extended PrnData to include potential Order fields
interface PrnData {
  jobno_joint: string | null;
  prnclr: string | null;
  prnfile1: string | null;
  prnfile2: string | null;
  jobno_print_emb: string | null;
  img_fpath: string | null;
  hex: string | null;
  print_img_pen: string | null;
  image_tb: string | null;
  con_fimg_grclr: string | null;
  con_jobno_print: string | null;
  jobno_print_new_rgb: string | null;
  con_jobno_prndes: string | null;
  con_jobno_top_clr_line: string | null;
  con_jobno_top_clr_siz_line: string | null;
  con_inout_outsup: string | null;
  print_screen_1: string | null;
  print_screen_2: string | null;
  print_screen_3: string | null;
  top_bottom: string | null;
  clrcomb: string | null;
  screen_number: string | null;
  print_type: string | null;
  print_description: string | null;
  individual_part_print_emb: string | null;
  print_colours: string | null;
  print_emb_ground_colour: string | null;
  inside_outside_print_emb: string | null;
  print_emb_outside_supplier: string | null;
  print_colour_1: string | null;
  print_colour_2: string | null;
  print_colour_3: string | null;
  print_colour_4: string | null;
  print_colour_5: string | null;
  print_colour_6: string | null;
  print_colour_7: string | null;
  print_colour_8: string | null;
  print_size_details: string | null;
  print_emb_ground_colour_rgb: string | null;
  img_print: string | null;
  img_print_mmt: string | null;
  con_jobno_top_clr_siz: string | null;
  con_jobno_top_clr: string | null;
  rgb: string | null;
  print_colour_rgb_1: string | null;
  print_colour_rgb_2: string | null;
  print_colour_rgb_3: string | null;
  print_colour_rgb_4: string | null;
  print_colour_rgb_5: string | null;
  print_colour_rgb_6: string | null;
  print_colour_rgb_7: string | null;
  print_colour_rgb_8: string | null;
  // Joined Fields from Order
  final_delivery_date?: string;
  fdt?: string;
  mainimagepath?: string | null; // Added mainimagepath
}

const PrnReportGrid: React.FC = () => {
  const [dataSource, setDataSource] = useState<PrnData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState<string>('');

  const gridRef = useRef<GridComponent>(null);
  const searchTimeout = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch both APIs simultaneously
        const [printResponse, orderResponse] = await Promise.all([
          fetch('https://app.herofashion.com/PrintRgb/'),
          fetch('https://app.herofashion.com/order_panda/')
        ]);

        // 2. Process Print Data (Fix NaN)
        const textData = await printResponse.text();
        const fixedJson = textData.replace(/:\s*NaN\b/g, ': null');
        const printData: PrnData[] = JSON.parse(fixedJson);

        // 3. Process Order Data
        const orderData: OrderData[] = await orderResponse.json();

        // 4. Create a Map for Order Data for efficient lookup
        const orderMap: Record<string, OrderData> = {};
        orderData.forEach(item => {
          if (item.jobno_oms) {
            orderMap[item.jobno_oms] = item;
          }
        });

        // 5. Join Data: Add Order fields to Print Data
        const mergedData = printData.map(printItem => {
          const matchingOrder = orderMap[printItem.jobno_joint || ''];
          
          // Parse date for styling
          let formattedDate = matchingOrder?.final_delivery_date || matchingOrder?.fdt || '';
          
          return {
            ...printItem,
            // Add merged fields
            final_delivery_date: formattedDate,
            fdt: matchingOrder?.fdt || formattedDate,
            mainimagepath: matchingOrder?.mainimagepath || null // Mapping mainimagepath
          };
        });

        setDataSource(mergedData);
        setTotalCount(mergedData.length);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Helpers & Templates ---

  const highlightText = (text: any) => {
    if (!searchKey || text === undefined || text === null || text === "") return text;
    const stringText = String(text).trim();
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
      const records = gridRef.current.getCurrentViewRecords();
      setShowingCount(records ? records.length : 0);
    }
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split(/[-/]/);
    if (parts.length !== 3) return null;
    let day, month, year;
    if (parts[0].length === 4) { [year, month, day] = parts.map(Number); }
    else { [day, month, year] = parts.map(Number); }
    return new Date(year, month - 1, day);
  };

  const getDateStyle = (dateStr: string) => {
    const targetDate = parseDate(dateStr);
    if (!targetDate) return { color: 'inherit' };
    const today = new Date();
    today.setHours(0, 0, 0, 0); targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { backgroundColor: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    if (diffDays === 0) return { backgroundColor: '#fff3e0', color: '#ef6c00', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    if (diffDays > 0 && diffDays <= 3) return { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    return { color: '#2e7d32', fontWeight: '500' };
  };

  const createImageTemplate = (field: keyof PrnData) => (props: PrnData) => {
    const url = props[field];
    return (
      <div style={{ textAlign: 'center', padding: '5px' }}>
        {url ? (
          <img 
            src={String(url)} 
            alt="Print" 
            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff' }} 
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : <div style={{fontSize: '10px', color: '#ccc'}}>No Image</div>}
      </div>
    );
  };

  const jobSummaryTemplate = (p: PrnData) => (
    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
      <b style={{color: '#d32f2f'}}>Joint:</b> {highlightText(p.jobno_joint)}<br />
      <b>PRN/EMB:</b> {highlightText(p.jobno_print_emb)}<br />
      <b>Type:</b> {highlightText(p.print_type)}<br />
      <b>Pos:</b> {highlightText(p.top_bottom)}
    </div>
  );

  const jobno_prnsc = (p: PrnData) => (
    <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
      <b style={{color: '#d32f2f'}}>Joint:</b> {highlightText(p.jobno_joint)}<br />
      <b>Print Scr 1:</b> {highlightText(p.print_screen_1)}<br />
      <b>Print Scr 2:</b> {highlightText(p.print_screen_2)}<br />
      <b>Screen #:</b> {highlightText(p.screen_number)}
    </div>
  );

  // const colorListTemplate = (p: PrnData) => {
  //   const colors = [p.print_colour_1, p.print_colour_2, p.print_colour_3, p.print_colour_4, p.print_colour_5, p.print_colour_6, p.print_colour_7, p.print_colour_8].filter(c => c && c.trim() !== "");
  //   return (
  //     <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column' }}>
  //       {colors.map((clr, idx) => (
  //         <div key={idx}>{idx + 1}. {highlightText(clr)}</div>
  //       ))}
  //     </div>
  //   );
  // };
const colorListTemplate = (p: PrnData) => {
  // Extract and filter valid colors
  const colors = [
    p.print_colour_1, p.print_colour_2, p.print_colour_3, p.print_colour_4,
    p.print_colour_5, p.print_colour_6, p.print_colour_7, p.print_colour_8
  ].filter(c => c && c.trim() !== "");

  return (
    <div style={{ 
      fontSize: '11px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px' // Adds spacing between each color
    }}>
      {colors.map((clr, idx) => (
        <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '2px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{idx + 1}.</span>
          {highlightText(clr)}
        </div>
      ))}
    </div>
  );
};

  const conDetailsTemplate = (p: PrnData) => (
    <div style={{ fontSize: '10px', whiteSpace: 'pre-line', color: '#555', lineHeight: '1.3' }}>
      {highlightText(p.con_jobno_print)}
      {p.con_jobno_top_clr_siz && `\n${highlightText(p.con_jobno_top_clr_siz)}`}
    </div>
  );

  // Template for Delivery Date
  const deliveryDateTemplate = (p: PrnData) => {
    const dateStr = p.fdt || p.final_delivery_date;
    return (
      <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
        <b>Fdt:</b> <span style={getDateStyle(dateStr || '')}>{highlightText(dateStr)}</span>
      </div>
    );
  };

  return (
    /* CONTAINER: minWidth: 0 fixes sidebar issues */
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', backgroundColor: '#fff' }}>
      
      <style>{`
        .custom-highlight { background-color: #fff9c4 !important; color: #d32f2f !important; font-weight: bold; }
        .e-rowcell { vertical-align: top !important; font-size: 11px !important; padding: 10px !important; }
        .e-headercell { background-color: #f8f9fa !important; font-weight: bold !important; }
        .e-grid { border: none !important; min-width: 0 !important; }

        /* --- Desktop Layout --- */
        .dashboard-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #fff;
          border-bottom: 1px solid #dee2e6;
          flex-shrink: 0;
        }
        
        .header-title { font-size: 16px; font-weight: bold; color: #333; margin-right: 20px; }
        .header-controls { display: flex; flex-direction: row; align-items: center; gap: 15px; }
        .search-input { padding: 8px 16px; border-radius: 4px; border: 1px solid #ccc; outline: none; width: 250px; }
        .search-input:focus { borderColor: #d32f2f; boxShadow: 0 0 0 2px rgba(211, 47, 47, 0.2); }
        .count-display { background: #ffebee; color: #d32f2f; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 14px; white-space: nowrap; border: 1px solid #ffcdd2; }

        /* --- Mobile Layout --- */
        @media (max-width: 768px) {
            .dashboard-header { flex-direction: column; padding: 15px; align-items: stretch; gap: 10px; }
            .header-title { text-align: center; margin-right: 0; margin-bottom: 5px; order: 1; }
            .header-controls { flex-direction: column; width: 100%; gap: 10px; order: 2; }
            .search-input { width: 100%; }
            .count-display { width: 100%; textAlign: center; display: block; boxSizing: border-box; }
        }
      `}</style>

      {/* Header Section */}
      <div className="dashboard-header">
          <div className="header-title">
              PRINT & EMBROIDERY (PRN) REPORT
          </div>
          
          <div className="header-controls">
              <input
                type="text"
                placeholder="Search job details..."
                value={searchKey}
                onChange={onSearchChange}
                className="search-input"
              />
              
              <div className="count-display">
                  {showingCount} / {totalCount} Records
              </div>
          </div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>Loading Data...</div>
        ) : (
          <GridComponent
            ref={gridRef}
            dataSource={dataSource}
            dataBound={updateCounts}
            height="100%"
            // enableVirtualization={true}
            rowHeight={130}
            allowSorting={true}
            allowTextWrap={true}
            allowFiltering={true}
            allowResizing={true}
             filterSettings={{type:'CheckBox'}}
            // allowTextWrap={true}
            // allowSorting={true}
            allowSelection={true}
            allowGrouping={true}
            // filterSettings={{ type: 'Excel' }}
            gridLines="Both"
          >
            <ColumnsDirective>
              <ColumnDirective field="jobno_joint" headerText="JOB INFO" width="150" template={jobSummaryTemplate} />
              <ColumnDirective field="jobno_joint" headerText="jobno_joint" width="70" textAlign="Center" />
              {/* Joined Delivery Date Column */}
              <ColumnDirective field="final_delivery_date" headerText="DEL DATE" width="100" template={deliveryDateTemplate} />

              <ColumnDirective field="print_screen_1" headerText="PRN SC" width="150" template={jobno_prnsc} />
              
              {/* NEW: Order Main Image Column */}
              <ColumnDirective field="mainimagepath" headerText="ORD IMG" width="100" textAlign="Center" template={createImageTemplate('mainimagepath')} />
               <ColumnDirective field="printing_R" headerText="1 print" width="70" textAlign="Center" />
               <ColumnDirective field="Emb" headerText="Emb" width="70" textAlign="Center" />
              <ColumnDirective field="prnfile1" headerText="PRN 1" width="100" textAlign="Center" template={createImageTemplate('prnfile1')} />
              <ColumnDirective field="prnfile2" headerText="PRN 2" width="100" textAlign="Center" template={createImageTemplate('prnfile2')} />
              <ColumnDirective field="img_fpath" headerText="AOP" width="100" textAlign="Center" template={createImageTemplate('img_fpath')} />
              
              <ColumnDirective field="print_description" headerText="DESCRIPTION" width="140" template={(p: PrnData) => highlightText(p.print_description)} />
              <ColumnDirective field="print_colours" headerText="CLR" width="70" textAlign="Center" />
              <ColumnDirective headerText="COLOUR LIST (1-8)" width="180" template={colorListTemplate} />
              {/* <ColumnDirective field="screen_number" headerText="SCR #" width="80" textAlign="Center" /> */}
              <ColumnDirective field="print_screen_1" headerText="S1" width="80" />
              <ColumnDirective field="print_screen_2" headerText="S2" width="80" />
              <ColumnDirective headerText="CONSOLIDATED" width="170" template={conDetailsTemplate} />
              <ColumnDirective field="prnclr" headerText="PRN CLR" width="110" />
              <ColumnDirective field="print_emb_ground_colour" headerText="GRND CLR" width="110" />
              <ColumnDirective field="individual_part_print_emb" headerText="INDV PART" width="110" />
              <ColumnDirective field="print_emb_outside_supplier" headerText="SUPPLIER" width="120" />
              <ColumnDirective field="inside_outside_print_emb" headerText="IN/OUT" width="90" />
              <ColumnDirective field="print_size_details" headerText="SIZE DTLS" width="120" />
            </ColumnsDirective>
            <Inject services={[Sort, Filter, Group, Reorder, Search, Resize]} />
          </GridComponent>
        )}
      </div>
    </div>
  );
};

export default PrnReportGrid;