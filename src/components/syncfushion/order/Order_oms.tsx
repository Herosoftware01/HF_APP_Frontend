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
  ContextMenu,
  ColumnMenu,
  Page,
  Toolbar,
  ColumnChooser,
  Freeze,
  Edit,
  AddEventArgs,
  SaveEventArgs,
  EditEventArgs,
  DeleteEventArgs,
  ActionEventArgs,
  Aggregate,
  AggregateColumnsDirective,
  AggregateColumnDirective,
  AggregateDirective,
  AggregatesDirective,
  PdfExport,
}from '@syncfusion/ej2-react-grids';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { Ajax} from '@syncfusion/ej2-base';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, MultiSelect } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons'

interface OrderData {
  slno1?: number; // Added SL No field
  jobno_oms: string; company_name: string; buyer1: string; stylename: string; uom: string;
  final_delivery_date: string; merch: string; punit_sh: string; styleno: string;
  production_type_inside_outside: string; quantity: string; director_sample_order: string;
  printing_R: string; Fdt: string; Emb: string; abc: string; order_follow_up: string;
  quality_controller: string; reference: string; insdatenew: string; styledesc: string;
  date: string; ourdelvdate: string; podate: string; vessel_dt: string; vessel_yr: string;
  shipment_complete: string; u7: string; u141: string; u45: string; u36: string; u31: string;
  u15: string; u14: string; u8: string; u25: string; insdate: string; insdateyear: string;
  actdaten: string; actyeardate: string; pono: string; u46: string; u37: string; qltycontroller: string;
  mainimagepath: string; finaldelvdate: string; prnclr?: string | null; prnfile1?: string; prnfile2?: string; img_fpath?: string
}

const HeroFashionGrid13: React.FC = () => {
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState<string>('');
  const [savedSettings, setSavedSettings] = useState<Array<{ name: string; data: any }>>([]);
  const [selectedSetting, setSelectedSetting] = useState<string>('');
  const [qualityControllers, setQualityControllers] = useState<any[]>([]);

  const settingNameRef = useRef<TextBoxComponent>(null);
  const dropdownRef = useRef<DropDownListComponent>(null);
  const tooltipRef = useRef<TooltipComponent>(null);  
  const gridRef = useRef<GridComponent>(null);
  const searchTimeout = useRef<any>(null);

  const searchableFields = [
    'jobno_oms', 'company_name', 'buyer1', 'stylename', 'merch',
    'punit_sh', 'styleno', 'quantity', 'director_sample_order',
    'printing_R', 'Emb', 'abc', 'u46', 'uom', 'final_delivery_date',
    'production_type_inside_outside', 'prnclr'
  ];

  // --- Helpers ---
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

  const getPunitStyle = (punit_sh: string) => {
    const code = (punit_sh || '').trim().toUpperCase();
    if (code === 'U1') return { backgroundColor: '#007bff', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    if (code === 'U2') return { backgroundColor: '#28a745', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    return { color: '#555' };
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const [orderResponse, printResponse, qcResponse] = await Promise.all([
          fetch('https://app.herofashion.com/order_oms1'),
          fetch('https://app.herofashion.com/PrintRgb/'),
          fetch('https://app.herofashion.com/get_quality_controllers/')
        ]);
        if (!orderResponse.ok || !printResponse.ok || !qcResponse.ok) throw new Error("Failed to fetch data from APIs");

        const orderData: OrderData[] = await orderResponse.json();
        const printData: any[] = await printResponse.json();
        const qcData : any[] = await qcResponse.json();

        const printMap: Record<string, any> = {};
        printData.forEach(item => { if (item.jobno_joint) printMap[item.jobno_joint] = item; });

        const mergedData = orderData.map((order) => {
          const matchingPrintData = printMap[order.jobno_oms] || {};
          return {
            ...order,
            prnclr: matchingPrintData.prnclr || null,
            prnfile1: matchingPrintData.prnfile1 || '',
            prnfile2: matchingPrintData.prnfile2 || '',
            img_fpath: matchingPrintData.img_fpath || ''
          };
        });

        const processedData = mergedData
          .filter((item) => {
            const dateStr = item.finaldelvdate || item.final_delivery_date;
            if (!dateStr) return true;
            const dateParts = dateStr.split(/[-/]/); let year = 0;
            if (dateParts.length === 3) {
              const p0 = parseInt(dateParts[0]); const p2 = parseInt(dateParts[2]);
              year = p0 > 1000 ? p0 : (p2 < 100 ? 2000 + p2 : p2);
            }
            return year <= 2127;
          })
          .sort((a, b) => {
            const typeA = (a.director_sample_order || '').toLowerCase();
            const typeB = (b.director_sample_order || '').toLowerCase();
            if (typeA !== typeB) {
              if (typeA === 'sample') return -1; if (typeB === 'sample') return 1;
              return typeA.localeCompare(typeB);
            }
            const dateA = new Date(a.finaldelvdate || a.final_delivery_date || 0).getTime();
            const dateB = new Date(b.finaldelvdate || b.final_delivery_date || 0).getTime();
            return dateA - dateB;
          })
          // --- FRONTEND SLNO GENERATION ---
          .map((item, index) => ({
            ...item,
            slno1: index + 1
          }));

        setDataSource(processedData);
        setTotalCount(processedData.length);
        setShowingCount(processedData.length);
        setQualityControllers(qcData.slice(0, 10));
      } catch (err: any) {
        console.error("Fetch error:", err); setError(err.message);
      } finally { setLoading(false); }
    };
    fetchData();
    loadSettingsFromStorage();
  }, []);

  const STORAGE_KEY = 'MainSettings';

  const loadSettingsFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setSavedSettings([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedSettings(parsed);
      } else {
        setSavedSettings([]);
      }
    } catch (e) {
      console.error('Failed to load saved grid settings', e);
      setSavedSettings([]);
    }
  };

  const saveSetting = () => {
    const name = (settingNameRef.current?.value || '').trim();
    if (!name) {
      alert('Please enter a name for the setting');
      return;
    }
    if (!gridRef.current) return;
    try {
      // Get the persisted data (column width, order, sorting, filtering, etc.)
      const persist = gridRef.current.getPersistData();
      let persistedSettings: any = persist;
      try { persistedSettings = JSON.parse(persist); } catch (e) { /* keep as-is if not JSON */ }

      // Clone the grid columns to preserve templates, header templates, and custom properties
      const gridColumns = Object.assign([], (gridRef.current as any).getColumns());

      // Manually attach templates and header templates to persisted column data
      if (persistedSettings.columns && Array.isArray(persistedSettings.columns)) {
        persistedSettings.columns.forEach((persistedColumn: any) => {
          const column = gridColumns.find((col: any) => col.field === persistedColumn.field);
          if (column) {
            // Preserve template, headerTemplate, and other custom properties
            persistedColumn.template = column.template;
            persistedColumn.headerTemplate = column.headerTemplate;
            persistedColumn.formatter = column.formatter;
            persistedColumn.valueAccessor = column.valueAccessor;
          }
        });
      }

      const existingSettings = savedSettings.filter(s => s.name !== name);
      const newSetting = { name, data: persistedSettings };
      const updatedSettings = [...existingSettings, newSetting];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      setSavedSettings(updatedSettings);
      setSelectedSetting(name);
      if (settingNameRef.current) {
        settingNameRef.current.value = '';
      }
      alert('Setting saved with column templates');
    } catch (err) {
      console.error('Save error', err);
      alert('Failed to save setting');
    }
  };

  const applySetting = () => {
    const key = dropdownRef.current?.value as string;
    if (!key) return alert('Select a saved setting to apply');
    const settingData = savedSettings.find(s => s.name === key);
    if (!settingData) return alert('Setting not found');
    if (!gridRef.current) return;
    try {
      // Parse the persisted data if it's a string
      let persistedState: any = settingData.data;
      if (typeof persistedState === 'string') {
        persistedState = JSON.parse(persistedState);
      }

      // Apply the persisted state to the grid
      // This includes column width, order, sorting, filtering, AND the preserved templates
      (gridRef.current as any).setProperties(persistedState, true);

      setTimeout(() => {
        if (gridRef.current) {
          (gridRef.current as any).freezeRefresh();
        }
        alert('Setting applied successfully');
      }, 500);
    } catch (e) {
      console.error('Apply error', e);
      alert('Failed to apply setting');
    }
  };

  const deleteSetting = () => {
    const key = dropdownRef.current?.value as string;
    if (!key) return alert('Select a saved setting to delete');
    const next = savedSettings.filter(s => s.name !== key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedSettings(next);
    if (dropdownRef.current) {
      dropdownRef.current.value = null;
    }
    setSelectedSetting('');
  };

  // --- Search & Highlight Logic ---
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


  const created = () => {
    document.getElementById(gridRef.current?.element.id + "_searchbar")?.addEventListener('keyup', (event: any) => {
      gridRef.current?.search(event.target?.value);
    });
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKey(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (gridRef.current) gridRef.current.search(value);
    }, 400);
  };

  const genericHighlighter = (field: keyof OrderData) => (props: OrderData) => (
    <>{highlightText(props[field])}</>
  );

  // --- Templates ---
  const imageFieldTemplate = (field: 'mainimagepath' | 'prnfile1' | 'prnfile2' | 'img_fpath') => (p: OrderData) => {
    if (!p[field]) return <div style={{ color: '#ccc', fontSize: '10px' }}>No Image</div>;
    return <img src={p[field]} alt="img" style={{ width: '70px', height: '70px', objectFit: 'contain', border: '1px solid #eee' }} />;
  };



  let serverUpdated = false;
  let newPrimaryKey: number | null = null;
  const actionBegin = (args: AddEventArgs | SaveEventArgs | EditEventArgs | DeleteEventArgs | ActionEventArgs) => {
    const ajax = new Ajax({
      onSuccess: function (response: string) {
        serverUpdated = true;
        newPrimaryKey = JSON.parse(response).id;
        gridRef.current?.endEdit();
      },
      onFailure: function (xhr: XMLHttpRequest) {
        gridRef.current?.closeEdit();
      },
    });

    if (args.requestType === 'save') {
      if ((args as any).action === 'edit') {
        console.log(args)
        if (!serverUpdated) {
          args.cancel = true;
          ajax.url =
            'https://app.herofashion.com/udf7_update/';
          ajax.type = 'POST';
          ajax.data = JSON.stringify((args as any).data);
          ajax.send();
        }
      }
    }
  };

  const actionComplete = (args: AddEventArgs | SaveEventArgs | EditEventArgs | DeleteEventArgs | ActionEventArgs) => {
    if (args.requestType === 'beginEdit') {
      // buyerIdVal = args.rowData['buyerid_id'];
    }
    if (args.requestType === 'save') {
      // integrate your WhatsApp Integration code logic here
      serverUpdated = false;
      newPrimaryKey = null;
    }
  };

  const orderSummaryTemplate = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>OR:</b> {highlightText(p.jobno_oms)}<br />
      <b>Buy:</b> {highlightText(p.buyer1)}<br />
      <b>Mer:</b> {highlightText(p.merch)}<br />
      <b>Unit:</b> <span style={getPunitStyle(p.punit_sh)}>{highlightText(p.punit_sh)}</span><br />
      <b>Qty:</b> {highlightText(p.quantity)}
    </div>
  );

  const deliveryInfoTemplate = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>Fdt:</b> <span style={getDateStyle(p.Fdt || p.final_delivery_date)}>{highlightText(p.Fdt || p.final_delivery_date)}</span><br />
      <b>Dir:</b> {highlightText(p.director_sample_order)}<br />
      <b>ST:</b> {highlightText(p.styleno)}<br />
      <b>Uom:</b> {highlightText(p.uom)}<br />
      <b>Type:</b> {highlightText(p.production_type_inside_outside)}
    </div>
  );

  const toolbarOptions: any[] = [
    "Search",
    { text: '', prefixIcon: 'e-add', id: 'add_icon', tooltipText: 'Add Records' },
    'Edit',
    'Delete',
    'Update',
    'Cancel',
    { type: 'Separator' },
    { text: '', prefixIcon: 'sf-icon-expand-collapse', id: 'expand_icon', tooltipText: 'Expand/Collapse' },
    { text: '', prefixIcon: 'sf-icon-clear-sorting', id: 'clearsorting_icon', tooltipText: 'Clear Sorting' },
    { text: '', prefixIcon: 'e-filter-clear icon', id: 'clearfilter_icon', tooltipText: 'Clear Filtering' },
    { type: 'Separator' },
    { text: '', prefixIcon: 'sf-icon-clear-selection', id: 'clear_selection', tooltipText: 'Clear Selection' },
    { text: '', prefixIcon: 'sf-icon-row-clear', id: 'clear_row_selection', tooltipText: 'Clear Row Selection' },
    { text: '', prefixIcon: 'sf-icon-column-clear', id: 'clear_column_selection', tooltipText: 'Clear Column Selection' },
    { text: '', prefixIcon: 'sf-icon-clear-cell', id: 'clear_cell_selection', tooltipText: 'Clear Cell Selection' },
    { type: 'Separator' },
    { type: 'Separator' },
    { text: '', prefixIcon: 'e-csvexport', id: 'export_csv', tooltipText: 'Export CSV' },
    { text: '', prefixIcon: 'e-excelexport', id: 'export_excel', tooltipText: 'Export Excel' },
    { text: '', prefixIcon: 'e-pdfexport', id: 'export_pdf', tooltipText: 'Export PDF' },
    'ColumnChooser'
  ];

  const searchHighlightText = (key: string | undefined, gridElement: Node) => {

    if (!key) return;

    clearHighlights();

    const ranges = [];

    // Use the correct selector (most grids use .e-rowcell, not .e-rowcells)

    const TARGET_SELECTOR = '.e-rowcell';

    // TreeWalker over all text nodes, but only accept those within .e-rowcell

    const walker = document.createTreeWalker(

      gridElement,

      NodeFilter.SHOW_TEXT,

      {

        acceptNode(node) {

          // Get an Element to run closest() from (parentNode might be a Text/DocumentFragment)

          const parent = node.parentNode;

          const elem = parent instanceof Element ? parent : null;

          // Accept only if the text node lives inside an element with TARGET_SELECTOR

          return elem && elem.closest(TARGET_SELECTOR)

            ? NodeFilter.FILTER_ACCEPT

            : NodeFilter.FILTER_SKIP;

        },

      }

    );

    let node;

    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    while ((node = walker.nextNode())) {

      const text = node.textContent || '';

      let m;

      while ((m = regex.exec(text)) !== null) {

        const r = new Range();

        r.setStart(node, m.index);

        r.setEnd(node, m.index + m[0].length);

        ranges.push(r);

      }

    }

    if (ranges.length) {

      const highlight = new Highlight(...ranges);

      CSS.highlights.set('search', highlight);

    }

  };



  const clearHighlights = () => {

    CSS.highlights.delete('search');

  };

  const dataBound = () => {
    if (gridRef.current) {
      const records = gridRef.current.getFilteredRecords();
      setShowingCount(records ? (records as object[]).length : 0);
      searchHighlightText(gridRef.current?.searchSettings?.key, gridRef.current?.element);
      searchHighlightText(gridRef.current?.searchSettings?.key, gridRef.current?.element);
    }
  };

  const rollnoTemplate = (props: any) => {
    let rollno = props.index
    if(rollno){
      return (<span>{++rollno}</span>)
    }
  }

  const footerSum = (props: any) =>{
    return (<span className='font-bold'>Q: {props.Sum}</span>)
  }

  const footerCount = (props: any) =>{
    return (<span className='font-bold'>C: {props.Count}</span>)
  }

  const qualityControllerEdit = {
    create: () => {
      const elem = document.createElement('input');
      return elem;
    },
    read: (elem: HTMLElement) => {
      const multiSelectObj = (elem as any).ej2_instances[0];
      return multiSelectObj.value ? multiSelectObj.value.join(',') : '';
    },
    destroy: () => {
      // Cleanup if needed
    },
    write: (args: any) => {
      const currentValue = args.rowData[args.column.field];
      const valueArray = currentValue ? currentValue.split(',').map((v: string) => v.trim()).filter(Boolean) : [];

      // Use vanilla JS MultiSelect instead of React component
      const multiSelect = new MultiSelect({
        dataSource: qualityControllers,
        fields: { text: 'name', value: 'name' }, // Adjust based on your API response
        value: valueArray,
        placeholder: 'Select Quality Controllers',
        mode: 'Box',
        showDropDownIcon: true,
        popupHeight: '200px',
        allowFiltering: true,
        filterBarPlaceholder: 'Search controllers...'
      });
      multiSelect.appendTo(args.element);
    }
  };

  const tooltipOpen = (args: any) => {
    let img = args.target.querySelector('img')
    if (img) {
      (tooltipRef.current as TooltipComponent).content = args.target.innerHTML
    }
    else {
      (tooltipRef.current as TooltipComponent).content = args.target.innerText;
    }
  }

  // const toolbarClick = (args: any) => {
  //   if (gridRef && args.item.id === 'export_pdf') { // 'Grid_pdfexport' -> Grid component id + _ + toolbar item name
  //     const exportProperties = {
  //       exportType: 'CurrentPage'
  //     };
  //     gridRef.pdfExport(exportProperties);
  //   }
  // }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', minWidth: 0, overflow: 'hidden' }}>


      {/* Global Styles */}
      <style>{`
        .custom-highlight { background-color: #fff9c4 !important; color: #d32f2f !important; font-weight: bold; }
        .e-rowcell { vertical-align: top !important; font-size: 12px !important; line-height: 1.3 !important; padding-top: 8px !important; }
        .e-filter-popup { z-index: 10000001 !important; }
        .e-grid { min-width: 0 !important; }
        
        /* --- Desktop Layout --- */
        .dashboard-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          background-color: #0ff180;
          border-bottom: 1px solid #dee2e6;
          flex-shrink: 0;
          flex-wrap: wrap; 
          }
          
          .header-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-right: 20px;
            }
            
            .header-controls {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 15px;
              }
              
              .search-input {
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid #ced4da;
          outline: none;
          width: 250px;
          transition: width 0.3s;
          }
          
          .search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
          }
          
          .count-display {
            background: #e9ecef;
            color: #007bff;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            border: 1px solid #dce1e6;
            }

                      .count-display1 {
            background: #e9ecef;
            color: #007bff;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            border: 1px solid #dce1e6;
            display: none
            }
            
            /* --- Mobile Layout --- */
            @media (max-width: 768px) {
              .dashboard-header {
                flex-direction: column;
                padding: 10px;
                align-items: stretch;
                gap: 10px;
                }

                .breadcromp{
                width:80%;
                font-size:50px;
                }
                 
        
                          .count-display {
            background: #e9ecef;
            color: #007bff;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            border: 1px solid #dce1e6;
            display:none
            }
                          .count-display1 {
            background: #e9ecef;
            color: #007bff;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            border: 1px solid #dce1e6;
            display:block;
            width: 70px;
            float: right;
            }
            .count{
              margin-top: -30px;
              margin-left: 30px
            }
                .header-title {
                  text-align: center;
                  margin-right: 0;
                  margin-bottom: 5px;
                  fontStyle:'Bold' ;
                  order: 1;
                  }
                  .header-controls {
                    flex-direction: column;
                    width: 100%;
                    gap: 10px;
                    order: 2;
                    }
            .search-input {
              width: 100%;
              }
              .count-display {
                width: 100%;
                textAlign: 'center';
                display: 'block';
                boxSizing: 'border-box';
                }
                }
                `}
      </style>

      {/* Header contenyt */}
      <div className="dashboard-header">
        <div className="count-display">
          {showingCount} / {totalCount}
        </div>

        <ol className="flex items-center whitespace-nowrap breadcromp">
          <li className="inline-flex items-center">
            <a className="flex items-center text-xs md:text-sm text-lg text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/dashboard">
              <svg className="shrink-0 me-3 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Dashboard
            </a>
            <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </li>
          <li className="inline-flex items-center">
            <a className="flex items-center text-xs md:text-sm text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/sy-order">
              <svg className="shrink-0 me-3 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="14" y="3" rx="1" /><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" /></svg>
              Order
              <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </li>
          <li className="inline-flex items-center text-xs md:text-sm font-semibold text-foreground truncate" aria-current="page">
            Order Table
          </li>
        </ol>
        <div className='count'>

          <div className="count-display1">
            {showingCount} / {totalCount}
          </div>
        </div>
        <div className="header-controls bg-white">
          <input
            type="text"
            placeholder="Search all columns..."
            value={searchKey}
            onChange={onSearchChange}
            className="search-input"
          />
        </div>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #eee', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,fontStyle:'Bold' }}>
            {/* <label style={{ fontSize: '13px', fontWeight: '500', color: '#333', whiteSpace: 'nowrap' }}>Setting Name:</label> */}
            <TextBoxComponent
              ref={settingNameRef}
              placeholder="Enter setting name"
              style={{ width: '80px' }}
            />
          </div>

          <ButtonComponent
            onClick={saveSetting}
            cssClass="e-primary"
            style={{ padding: '6px 12px', fontSize: '13px', border: "2px" }}
          >
            💾
          </ButtonComponent>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* <label style={{ fontSize: '13px', fontWeight: '500', color: '#333', whiteSpace: 'nowrap' }}>Saved Settings:</label> */}
            <DropDownListComponent
              ref={dropdownRef}
              id="settings-dropdown"
              dataSource={savedSettings.map(s => ({ text: s.name, value: s.name }))}
              fields={{ text: 'text', value: 'value' }}
              placeholder="Select setting..."
              style={{ width: '50px' }}
              change={() => setSelectedSetting(dropdownRef.current?.value as string)}
            />
          </div>

          <ButtonComponent
            onClick={applySetting}
            cssClass="e-outline"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
           ✔
          </ButtonComponent>

          <ButtonComponent
            onClick={deleteSetting}
            cssClass="e-outline e-danger"
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            🗑
          </ButtonComponent>
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>Loading Data...</div>
        ) : error ? (
          <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>Error: {error}</div>
        ) : (
          <><div><TooltipComponent ref={tooltipRef} target=".e-rowcell" beforeOpen={tooltipOpen}>
          <GridComponent
            id="default-aggregate-grid"
            ref={gridRef}
            dataSource={dataSource}
            dataBound={dataBound}
            height="440px"
            enableVirtualization={true}
            rowHeight={95}
            allowSorting={true}
            allowFiltering={true}
            allowGrouping={true}
            allowTextWrap={true}
            showColumnMenu={true}
            showColumnChooser={true}
            enableAdaptiveUI={true}
            adaptiveUIMode = {'Mobile'}      
            allowReordering={true}
            allowResizing={true}
            allowPdfExport={true}
            // filterSettings={{ type: 'Excel' }}
            gridLines="Both"
            searchSettings={{ fields:["jobno_oms", "quality_controller"], operator: 'contains', ignoreCase: true }}
            toolbar={toolbarOptions}
            editSettings={{
              allowDeleting: true,
              allowEditing: true,
              allowEditOnDblClick: false,
              allowAdding: true, 
              mode: "Dialog"
            }}
            actionBegin={actionBegin}
            actionComplete={actionComplete}
            created={created}
            // toolbarClick={toolbarClick}
          >
            <ColumnsDirective>

              <ColumnDirective isPrimaryKey={true} field="jobno_oms" headerText="ORDER INFO" width="120" maxWidth="120" freeze='Left' template={orderSummaryTemplate} allowEditing={false}/>
              <ColumnDirective field="mainimagepath" headerText="IMG" freeze='Left' width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('mainimagepath')} allowEditing={false} />
              <ColumnDirective field="qltycontroller" headerText="QC-ms" width="100" template={genericHighlighter('qltycontroller')} edit={qualityControllerEdit} allowEditing={true} />
              <ColumnDirective field="Fdt" headerText="DELIVERY INFO" width="150" maxWidth="150" template={deliveryInfoTemplate} />
              <ColumnDirective headerText='fsn' width="90" textAlign="Center" allowFiltering={true} template={rollnoTemplate} allowEditing={false}/>
              <ColumnDirective field="prnfile1" headerText="PRN IMG" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('prnfile1')} />
              <ColumnDirective field="prnfile2" headerText="MEAS IMG" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('prnfile2')} />
              <ColumnDirective field="img_fpath" headerText="AOP" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('img_fpath')} />
              <ColumnDirective field="prnclr" headerText="PRN COL" width="100" template={genericHighlighter('prnclr')} />
              <ColumnDirective field="u25" headerText="25 WEEK" width="100" template={genericHighlighter('u25')} />
              <ColumnDirective field="abc" headerText="ABC" width="100" template={genericHighlighter('abc')} />
              <ColumnDirective field="u46" headerText="46 EMPTY" width="100" template={genericHighlighter('u46')} />
              <ColumnDirective field="production_type_inside_outside" headerText="PRD TYPE" width="100" template={genericHighlighter('production_type_inside_outside')} />
              <ColumnDirective field="u37" headerText="37 AOP" width="100" template={genericHighlighter('u37')} />
              <ColumnDirective field="printing_R" headerText="1 PRINT" width="100" template={genericHighlighter('printing_R')} />
              <ColumnDirective field="u8" headerText="8 FAB" width="100" template={genericHighlighter('u8')} />
              <ColumnDirective field="u36" headerText="36 FABIN" width="90" template={genericHighlighter('u36')} />
              <ColumnDirective field="u15" headerText="15" width="90" template={genericHighlighter('u15')} />
              <ColumnDirective field="u45" headerText="45 ORDER" width="90" template={genericHighlighter('u45')} />
              <ColumnDirective field="u31" headerText="31 ITS" width="90" template={genericHighlighter('u31')} />
              <ColumnDirective field="u141" headerText="141 SAMPLE" width="100" template={genericHighlighter('u141')} />
              <ColumnDirective field="Emb" headerText="3 EMB" width="90" template={genericHighlighter('Emb')} />
              <ColumnDirective field="buyer1" headerText="BUYER" width="100" template={genericHighlighter('buyer1')} />
              <ColumnDirective field="merch" headerText="MERCH" width="100" template={genericHighlighter('merch')} />
              <ColumnDirective field="styleno" headerText="STYLE NO" width="110" template={genericHighlighter('styleno')} />
              <ColumnDirective field="director_sample_order" headerText="DIR S/O" width="100" template={genericHighlighter('director_sample_order')} />
              <ColumnDirective field="order_follow_up" headerText="ORD FOLLOW UP" width="100" template={genericHighlighter('order_follow_up')} />
              <ColumnDirective field="u7" headerText="U7" width="100" template={genericHighlighter('u7')} />
              <ColumnDirective field="quality_controller" headerText="QC" width="100" template={genericHighlighter('quality_controller')}/>
              <ColumnDirective field="slno1" headerText="No" width="90" textAlign="Center" />
              <ColumnDirective field="u14" headerText="14 DY" width="70" minWidth="90" template={genericHighlighter('u14')} />
              <ColumnDirective field="styledesc" headerText="DESC" width="160" template={genericHighlighter('styledesc')} />
              <ColumnDirective field="reference" headerText="reference" width="250" maxWidth="250" template={genericHighlighter('reference')} />
              <ColumnDirective field="quantity" headerText="QTY" width="90" textAlign="Right" template={genericHighlighter('quantity')} />
              <ColumnDirective field="company_name" headerText="COMPANY" width="90" template={genericHighlighter('company_name')} />

            </ColumnsDirective>
            <AggregatesDirective>
              <AggregateDirective>
                <AggregateColumnsDirective>
                  <AggregateColumnDirective field='slno1'  type='Count' footerTemplate={footerCount} format='N'> </AggregateColumnDirective>
                  <AggregateColumnDirective field='quantity'  type='Sum' footerTemplate={footerSum} format='N'> </AggregateColumnDirective>
                </AggregateColumnsDirective>
              </AggregateDirective>
            </AggregatesDirective>
            <Inject services={[Sort, Edit, Filter, Group, Reorder, Search, VirtualScroll, Freeze, Resize, ContextMenu, Page, Toolbar, ColumnChooser, ColumnMenu, Aggregate, PdfExport]} />
          </GridComponent></TooltipComponent></div></>
        )}
      </div>
    </div>
  );
};

export default HeroFashionGrid13;