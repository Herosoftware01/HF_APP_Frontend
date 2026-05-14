import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useContext } from "react";
import { UserContext } from "../../../UserContext";
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
import { Ajax, Browser} from '@syncfusion/ej2-base';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, MultiSelect } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Uploader } from '@syncfusion/ej2-inputs';

interface OrderData {
  slno1?: number; // Added SL No field
  jobno_oms: string; company_name: string; buyer1: string; stylename: string; uom: string;
  final_delivery_date: string; merch: string; punit_sh: string; styleno: string;
  production_type_inside_outside: string; quantity: string; director_sample_order: string;
  printing_R: string; Fdt: string; Emb: string; abc: string; order_follow_up: string;
  quality_controller: string; reference: string; insdatenew: string; styledesc: string;
  date: string; ourdelvdate: string; podate: string; vessel_dt: string; vessel_yr: string;
  shipment_complete: string; u7: string; u141: string; u45: string; u36: string; u31: string;
  u15: string; u14: string; u8: string; u25: string; insdate: string; insdateyear: string;finaldelvdate1:string;number_03_emb:string;
  actdaten: string; actyeardate: string; pono: string; u46: string; u37: string; qltycontroller: string;Print:string;others1:string;
  mainimagepath: string; finaldelvdate: string; prnclr?: string | null; prnfile1?: string; prnfile2?: string; img_fpath?: string;clr?:string;print_img?:string;
  prnmeaimg?:string;mpic?:string;
  

}

const OrderDetails: React.FC = () => {
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState<string>('');
  // const [userName, setUserName] = useState("");
  const { username } = useContext(UserContext);

  // const [savedSettings, setSavedSettings] = useState<Array<{
    // id: number; name: string; data: any; user: string; 
// }>>([]);


interface SavedSetting {
  id: number;
  name: string;
  data: any;
  user: string; // <-- add this
}

const [savedSettings, setSavedSettings] = useState<SavedSetting[]>([]);

  const [selectedSetting, setSelectedSetting] = useState<string>('');
  const [qualityControllers, setQualityControllers] = useState<any[]>([]);

  const settingNameRef = useRef<TextBoxComponent>(null);
  const dropdownRef = useRef<DropDownListComponent>(null);
  const tooltipRef = useRef<TooltipComponent>(null);  
  const gridRef = useRef<GridComponent>(null);
  const searchTimeout = useRef<any>(null);
  const previousCellRef = useRef<HTMLElement | null>(null);

  const searchableFields = [
    'jobno_oms', 'company_name', 'buyer1', 'stylename', 'merch',
    'punit_sh', 'styleno', 'quantity', 'director_sample_order',
    'printing_R', 'Emb', 'abc', 'u46', 'uom', 'final_delivery_date',
    'production_type_inside_outside', 'prnclr'
  ];
//  const groupOptions = {
//     columns: ["abc"], // Group by "Category" column
//     showDropArea: true,
//     showGroupedColumn: true
//   };
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
          fetch('https://app.herofashion.com/order_panda'),
          // fetch('https://app.herofashion.com/PrintRgb/'),
          fetch('https://app.herofashion.com/ord_prn/'),
          fetch('https://app.herofashion.com/get_quality_controllers/')
        ]);
        if (!orderResponse.ok || !printResponse.ok || !qcResponse.ok) throw new Error("Failed to fetch data from APIs");

        const orderData: OrderData[] = await orderResponse.json();
        const printData: any[] = await printResponse.json();
        const qcData : any[] = await qcResponse.json();

        const printMap: Record<string, any> = {};
        printData.forEach(item => { if (item.jobno) printMap[item.jobno] = item; });

        const mergedData = orderData.map((order) => {
          const matchingPrintData = printMap[order.jobno_oms] || {};
          return {
            ...order,
            clr: matchingPrintData.clr || null,
            print_img: matchingPrintData.print_img || '',
            prnmeaimg: matchingPrintData.prnmeaimg || '',
            mpic: matchingPrintData.mpic || '',
            // img_fpath: matchingPrintData.img_fpath || ''
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
   
    fetchSavedSettings();
  }, []);
  
  const STORAGE_KEY = 'MainSettings';

  const fetchSavedSettings = async () => {
  try {
    const res = await fetch('https://hfapi.herofashion.com/syncfushion/api/grid-settings/');
    const data = await res.json();
    setSavedSettings(data);  // data is an array of {id, name, data}
  } catch (e) {
    console.error('Failed to fetch settings', e);
  }
};

  const saveSetting = async () => {
    const name = (settingNameRef.current?.value || '').trim();
    if (!name) {
      alert('Please enter a name for the setting');
      return;
    }
    if (!gridRef.current) return;

  try {
    const persist = gridRef.current.getPersistData();
    let persistedSettings: any = persist;
    try { persistedSettings = JSON.parse(persist); } catch {}

    const gridColumns = Object.assign([], (gridRef.current as any).getColumns());
    if (persistedSettings.columns && Array.isArray(persistedSettings.columns)) {
      persistedSettings.columns.forEach((persistedColumn: any) => {
        const origCol = gridColumns.find((c: any) => c.field === persistedColumn.field);
        if (origCol) {
          persistedColumn.template = origCol.template;
          persistedColumn.headerTemplate = origCol.headerTemplate;
          persistedColumn.formatter = origCol.formatter;
          persistedColumn.valueAccessor = origCol.valueAccessor;
        }
      });
    }

    const payload = { name, data: persistedSettings, user: username };

    console.log("Saving payload:", payload);

    const existing = savedSettings.find(s => s.name === name);
    
    const method = existing ? 'PUT' : 'POST';
    const url = existing
      ? `https://hfapi.herofashion.com/syncfushion/api/grid-settings/${existing.id}/`
      : `https://hfapi.herofashion.com/syncfushion/api/grid-settings/`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Save failed');

    const saved = await res.json();
    await fetchSavedSettings();
    setSelectedSetting(saved.name);
    if (settingNameRef.current) {
      settingNameRef.current.value = '';
      }
    alert('Setting saved');
    console.log("Saving grid setting for user:", username);
  } catch (err) {
    console.error(err);
    alert('Failed to save setting');
  }
};

  const applySetting = () => {
  const key = dropdownRef.current?.value as string;
  if (!key) return alert('Select a setting');

  const setting = savedSettings.find(s => s.id === Number(key));
  if (!setting) return alert('Setting not found');
  if (!gridRef.current) return;

  try {
    let persistedState = setting.data;
    const gridColumns = Object.assign([], (gridRef.current as any).getColumns());
    if (persistedState.columns && Array.isArray(persistedState.columns)) {
      persistedState.columns.forEach((persistedColumn: any) => {
        const origCol = gridColumns.find((c: any) => c.field === persistedColumn.field);
        if (origCol) {
          persistedColumn.template = origCol.template;
          persistedColumn.headerTemplate = origCol.headerTemplate;
          persistedColumn.formatter = origCol.formatter;
          persistedColumn.valueAccessor = origCol.valueAccessor;
        }
      });
    }

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

  const deleteSetting = async () => {
  const key = dropdownRef.current?.value;
  if (!key) return alert('Select a saved setting to delete');

  const setting = savedSettings.find(s => s.id === Number(key));
  if (!setting) return alert('Setting not found');

  try {
    const res = await fetch(`https://hfapi.herofashion.com/syncfushion/api/grid-settings/${setting.id}/`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Delete failed');

    // Refresh the saved settings from backend
    await fetchSavedSettings();

    // Clear dropdown and selection
    if (dropdownRef.current) dropdownRef.current.value = null;
    setSelectedSetting('');

    alert('Setting deleted');
  } catch (err) {
    console.error(err);
    alert('Failed to delete setting');
  }
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
  const imageFieldTemplate = (field: 'mainimagepath' |'Print'| 'print_img' | 'prnmeaimg' | 'img_fpath'| 'Emb' | 'others1'  ) => (p: OrderData) => { 
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
    console.log(args)
    if(args.requestType==='searching')
    {
      if (gridRef.current?.element) {
        // searchHighlightText(gridRef.current?.searchSettings?.key, gridRef.current.element);
      }
    }
     if (gridRef.current && args.requestType === 'beginEdit') {
            const cols: any = gridRef.current?.columns;
            for (const col of cols) {
                if (col.field === "jobno_oms" || col.field === "Print" || col.field==="print_img" || col.field==="prnclr" || col.field==="merch" || col.field==="buyer1"
                  || col.field==="punit_sh" || col.field==="punit_sh" || col.field==="styleno" ||  col.field==="director_sample_order"  ||  col.field==="director_sample_order" ||
                    col.field==="abc"  ||  col.field==="order_follow_up" ||  col.field==="styledesc" ||  col.field==="company_name" ||  col.field==="quantity" ||  col.field==="production_type_inside_outside"
                  ||  col.field==="prnmeaimg" ||  col.field==="Emb"  ||  col.field==="others1"  ||  col.field==="u25" ||  col.field==="u45" ||  col.field==="slno1" || col.field==="u37" ||  col.field==="actdaten"  ||  col.field==="u46"  ||  col.field==="date" ||  col.field==="ourdelvdate" ||  col.field==="finaldelvdate1" ||  col.field==="u15" ||  col.field==="u14" 
                ) {
                    col.visible = false;
                }
            }
        }

        // if (gridRef.current && args.requestType === 'add') {
        //     const cols: any = gridRef.current?.columns;
        //     for (const col of cols) {
        //         if (col.field === "jobno_oms" || col.field === "mainimagepath") {
        //             col.visible = true;
        //         }
        //     }
        // }
        if (gridRef.current && args.requestType === 'save') {
            const cols: any = gridRef.current?.columns;
            for (const col of cols) {
                if (col.field === "jobno_oms" || col.field === "Print") {
                    col.visible = true;
                }
            }
        }
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

  const  udf= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>1-Print:</b> {highlightText(p.printing_R)}<br />
      <b>3-Emb:</b> {highlightText(p.number_03_emb)}<br />
      <b>7:</b> {highlightText(p.u7)}<br />
      <b>8-Fab:</b> {highlightText(p.u8)}<br />
      <b>14-Fabdy:</b> {highlightText(p.u14)}<br />
      <b>25-week:</b> {highlightText(p.u25)}<br />
      {/* <b>Unit:</b> <span style={getPunitStyle(p.punit_sh)}>{highlightText(p.punit_sh)}</span><br />
      <b>Qty:</b> {highlightText(p.quantity)} */}
    </div>
  );

  
  const  udf2= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>31:</b> {highlightText(p.u31)}<br />
      <b>36-ITS:</b> {highlightText(p.u36)}<br />
      <b>u45:</b> {highlightText(p.u45)}<br />
      <b>u46:</b> {highlightText(p.u46)}<br />
      <b>u141:</b> {highlightText(p.u141)}<br />
    </div>
  );


  const toolbarOptions: any[] = [
    { text: 'Search', prefixIcon: 'e-icons e-search', id: 'default-aggregate-grid_search', align: 'Left' as any },
    { text: '', prefixIcon: 'e-add', id: 'add_icon', tooltipText: 'Add Records' },
    'Edit',
    'Delete',
    'Update',
    'Cancel',
    { type: 'Separator' },
    // { text: '', prefixIcon: 'sf-icon-expand-collapse', id: 'expand_icon', tooltipText: 'Expand/Collapse' },
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
    // 'ColumnChooser'
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
      if(gridRef.current.searchSettings.key &&gridRef.current.searchSettings.key.length>0 )
      {
        searchHighlightText(gridRef.current?.searchSettings?.key, gridRef.current?.element);
      }
    }
  };

  const toolbarClick = (args: any) => {
    if (!gridRef.current) return;

    const itemId = args.item?.id;

    switch (itemId) {
      case 'add_icon':
        console.log('Add Records clicked');
        gridRef.current.addRecord();
        break;

 

      case 'clearsorting_icon':
        console.log('Clear Sorting clicked');
        gridRef.current.clearSorting();
        break;

      case 'clearfilter_icon':
        console.log('Clear Filtering clicked');
        gridRef.current.clearFiltering();
        break;

      case 'clear_selection':
        console.log('Clear Selection clicked');
        gridRef.current.clearSelection();
        break;

      case 'clear_row_selection':
        console.log('Clear Row Selection clicked');
        gridRef.current.selectRows([]);
        break;

      case 'clear_column_selection':
        console.log('Clear Column Selection clicked');
        // Clear all selections
        gridRef.current.clearSelection();
        break;

      case 'clear_cell_selection':
        console.log('Clear Cell Selection clicked');
        gridRef.current.clearCellSelection();
        break;

      case 'export_csv':
        console.log('Export CSV clicked');
        gridRef.current.csvExport();
        break;

      case 'export_excel':
        console.log('Export Excel clicked');
        gridRef.current.excelExport();
        break;

      case 'export_pdf':
        console.log('Export PDF clicked');
        gridRef.current.pdfExport();
        break;

      default:
        console.log('Toolbar item clicked:', itemId);
        break;
    }
  };
  
  const rollnoTemplate = (props: any) => {
    let rollno = props.index
    if (rollno) {
      return (<span>{++rollno}</span>)
    }
  }

  const footerSum = (props: any) => {
    return (<span className='font-bold'>Q: {props.Sum}</span>)
  }

  const footerCount = (props: any) => {
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

  const imageUploaderEdit = {
    create: () => {
      const elem = document.createElement('input');
      elem.setAttribute('type', 'file');
      elem.setAttribute('name', 'UploadFiles');
      return elem;
    },
    read: (elem: HTMLElement) => {
      const uploaderObj = (elem as any).ej2_instances[0];
      const files = uploaderObj.getFilesData();
      
      // If files are uploaded, return the file path or URL
      if (files && files.length > 0) {
        // You can return the uploaded file URL here
        // For now, returning the file name
        return files[0].name || '';
      }
      
      // Return existing value if no new file uploaded
      return (elem as any).dataset.currentValue || '';
    },
    destroy: () => {
      // Cleanup uploader if needed
    },
    write: (args: any) => {
      const currentValue = args.rowData[args.column.field];
      
      // Store current value in dataset for read method
      args.element.dataset.currentValue = currentValue || '';
      
      // Create uploader instance
      const uploader = new Uploader({
        asyncSettings: {
          saveUrl: 'https://app.herofashion.com/upload_image/', // Replace with your upload API endpoint
          removeUrl: 'https://app.herofashion.com/remove_image/' // Replace with your remove API endpoint
        },
        multiple: false,
        allowedExtensions: '.jpg,.jpeg,.png,.gif,.webp',
        maxFileSize: 5000000, // 5MB
        dropArea: args.element.closest('.e-dialog'),
        success: (args: any) => {
          console.log('Upload successful:', args);
          // You can handle the uploaded file URL here
          if (args.e && args.e.currentTarget) {
            const response = JSON.parse(args.e.currentTarget.response);
            if (response && response.url) {
              // Store the uploaded URL
              (args.element as any).dataset.uploadedUrl = response.url;
            }
          }
        },
        failure: (args: any) => {
          console.error('Upload failed:', args);
        },
        removing: (args: any) => {
          console.log('File removing:', args);
        }
      });
      
      uploader.appendTo(args.element);
      
      // Show current image preview if exists
      if (currentValue) {
        const previewDiv = document.createElement('div');
        previewDiv.style.marginTop = '10px';
        previewDiv.style.textAlign = 'center';
        previewDiv.innerHTML = `
          <div style="margin-bottom: 8px; font-weight: bold; color: #666;">Current Image:</div>
          <img 
            src="${currentValue}" 
            alt="Current" 
            style="max-width: 200px; max-height: 200px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px; padding: 5px;"
          />
        `;
        args.element.parentElement?.appendChild(previewDiv);
      }
    }
  };

<TooltipComponent 
  target=".image-tooltip-target" 
  cssClass="custom-tooltip-size" // இந்த கிளாஸ் முக்கியம்
  width="450px" 
  height="450px"
  content={(args: any) => (
    <div style={{ width: '100%', height: '100%' }}>
      <img 
        src={args.target.src} 
        style={{ width: '200%', height: '200%', objectFit: 'contain' }} 
      />
    </div>
  )}
>
  {/* Unga Grid code inga varum */}
</TooltipComponent>

// Implementation on tooltipBeforeRender and removed toolTipOpen

  const tooltipBeforeRender = (args: any) => {

    const isHeaderCell = args.target.closest('.e-headercell');
    const isRowCell = args.target.closest('.e-rowcell');

    if (isRowCell || isHeaderCell) {
      let img = args.target.querySelector('img')
      if (img && !isHeaderCell) {
        // Get row information
        const rowInfo = gridRef.current?.getRowInfo(args.target.closest('td'));
        const rowData: OrderData = rowInfo?.rowData as OrderData;
        
        if (rowData) {
          // Get image source
          const imgSrc = img.src;
          
          // Build order information HTML
          const orderInfo = `
            <div style="padding: 12px; line-height: 1.6; font-size: 13px;">
              <div style="margin-bottom: 8px;"><strong>Job No:</strong> ${rowData.jobno_oms || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Company:</strong> ${rowData.company_name || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Buyer:</strong> ${rowData.buyer1 || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Style:</strong> ${rowData.stylename || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Style No:</strong> ${rowData.styleno || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Quantity:</strong> ${rowData.quantity || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Unit:</strong> ${rowData.punit_sh || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Merch:</strong> ${rowData.merch || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Delivery Date:</strong> ${rowData.Fdt || rowData.final_delivery_date || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Type:</strong> ${rowData.director_sample_order || 'N/A'}</div>
            </div>
          `;
          
          // Create tooltip content with order info on left and image on right
          const tooltipContent = `
            <div style="display: flex; max-width: 700px;">
              <div style="flex: 1; min-width: 250px; max-width: 300px; border-right: 1px solid #e0e0e0;">
                ${orderInfo}
              </div>
              <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 12px;">
                <img 
                  src="${imgSrc}" 
                  style="max-width: 350px; max-height: 350px; width: auto; height: auto; object-fit: contain;" 
                  alt="Order Image"
                />
              </div>
            </div>
          `;
          
          (tooltipRef.current as TooltipComponent).content = tooltipContent;
          (tooltipRef.current as TooltipComponent).width = '700px';
          (tooltipRef.current as TooltipComponent).height = 'auto';
        }
      }
      else if (img && isHeaderCell) {
        // For header cells, show simple image
        let imgElem:any= args.target.innerHTML;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = imgElem;
        const tooltipImg = wrapper.querySelector('img');
        if (tooltipImg) {
          tooltipImg.style.width = '100px';
          tooltipImg.style.height = '100px';
          tooltipImg.style.objectFit = 'contain';
        }
        (tooltipRef.current as TooltipComponent).content = wrapper.innerHTML;
        (tooltipRef.current as TooltipComponent).width = '100px';
        (tooltipRef.current as TooltipComponent).height = '100px';
      }
      else {
        // Create a wrapper div for text content with styling
        const textWrapper = document.createElement('div');
        textWrapper.style.padding = '8px';
        textWrapper.style.maxHeight = '150px';
        textWrapper.style.overflowY = 'auto';
        textWrapper.style.fontSize = '14px';
        textWrapper.style.lineHeight = '1.5';
        textWrapper.innerText = args.target.innerText;
        (tooltipRef.current as TooltipComponent).content = textWrapper.outerHTML;
        
        // Set different dimensions for header cells
        if (isHeaderCell) {
          (tooltipRef.current as TooltipComponent).width = '100px';
          (tooltipRef.current as TooltipComponent).height = '100px';
        } else {
          (tooltipRef.current as TooltipComponent).width = '200px';
          (tooltipRef.current as TooltipComponent).height = '200px';
        }
      }
    }

  }

  // Background color implementation
  const recordClick=(args:any)=>
    {
      // Remove background from previously clicked cell
      if (previousCellRef.current) {
        previousCellRef.current.style.backgroundColor = '';
      }
      
      // Set yellow background on the newly clicked cell
      if (args.cell) {
        args.cell.style.backgroundColor = 'yellow';
        // Store the current cell as the previous cell for next click
        previousCellRef.current = args.cell;
      }
      
      console.log('Cell clicked:', args);
    }

  const beforeOpen = (args: any) => {
    // Adjust tooltip dimensions based on content type
    const hasOrderInfo = args.element.innerHTML.includes('Job No:');
    
    if (hasOrderInfo) {
      args.element.style.maxWidth = '750px';
      args.element.style.width = 'auto';
    }
  };

  // Memoize the grid component to prevent unnecessary re-renders
  const memoizedGridComponent = useMemo(() => (
    <><div><TooltipComponent ref={tooltipRef} target=".e-rowcell, .e-headercell" width="130px" height="130px" beforeRender={tooltipBeforeRender} beforeOpen={beforeOpen}>
      <GridComponent
        id="default-aggregate-grid"
        ref={gridRef}
        dataSource={dataSource}
        dataBound={dataBound}
        pageSettings={{pageSize:10}}
        height="440px"
        enableVirtualization={true}
        allowSorting={true}
        allowFiltering={true}
        allowMultiSorting={true}
        filterSettings={{type:'CheckBox'}}
        statelessTemplates={['directiveTemplates']}
        allowGrouping={true}
        groupSettings={{showDropArea : !Browser.isDevice}}
        showColumnMenu={true}
        // showColumnChooser={true}
        enableAdaptiveUI={true}
        adaptiveUIMode={'Mobile'}
        allowTextWrap={true}
        allowReordering={true}
        allowResizing={true}
        allowPdfExport={true}
        // rowHeight={100}
        gridLines="Both"
        searchSettings={{  operator: 'contains', ignoreCase: true }}
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
        frozenColumns={2}
        toolbarClick={toolbarClick}
        recordClick={recordClick}
      >
        <ColumnsDirective>

          <ColumnDirective isPrimaryKey={true} field="jobno_oms" headerText="ORDER INFO" width="120" maxWidth="120" template={orderSummaryTemplate} allowEditing={false} />
          <ColumnDirective field="mainimagepath" headerText="IMG" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('mainimagepath')} allowEditing={true} />
          <ColumnDirective headerText="DELIVERY INFO" width="150" maxWidth="150" template={deliveryInfoTemplate} />
          <ColumnDirective headerText="UDF1" width="150" maxWidth="150" template={udf} />
          <ColumnDirective headerText="UDF2" width="150" maxWidth="150" template={udf2} />
          <ColumnDirective field="Print" headerText="Print" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Print')} allowEditing={false} />
          <ColumnDirective field="Emb" headerText="Emb" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Emb')} allowEditing={false} />
          <ColumnDirective field="others1" headerText="others1" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('others1')} allowEditing={false} />
          <ColumnDirective field="qltycontroller" headerText="QC-ms" width="100" template={genericHighlighter('qltycontroller')} edit={qualityControllerEdit} allowEditing={true} />
          <ColumnDirective headerText='fsn' width="90" textAlign="Center" allowFiltering={true} template={rollnoTemplate} allowEditing={false} />
          <ColumnDirective field="print_img" headerText="PRN IMG" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('print_img')} />
          <ColumnDirective field="prnmeaimg" headerText="MEAS IMG" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('prnmeaimg')} />
          <ColumnDirective field="img_fpath" headerText="AOP" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('img_fpath')} />
          <ColumnDirective field="prnclr" headerText="PRN COL" width="100" template={genericHighlighter('prnclr')} />
          <ColumnDirective field="finaldelvdate1" headerText="finaldelvdate1" width="100" template={genericHighlighter('finaldelvdate1')} />
          <ColumnDirective field="date" headerText="date" width="100" template={genericHighlighter('finaldelvdate1')} />
          <ColumnDirective field="ourdelvdate" headerText="ourdelvdate" width="100" template={genericHighlighter('ourdelvdate')} />
          <ColumnDirective field="actdaten" headerText="actdaten" width="100" template={genericHighlighter('actdaten')} />
          <ColumnDirective field="u25" headerText="25 WEEK" width="100" template={genericHighlighter('u25')} />
          <ColumnDirective field="abc" type="string" headerText="ABC" width="100" template={genericHighlighter('abc')} />
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
          <ColumnDirective field='punit_sh' headerText="punit_sh" width="100" template={genericHighlighter('punit_sh')} />
          <ColumnDirective field="styleno" headerText="STYLE NO" width="110" template={genericHighlighter('styleno')} />
          <ColumnDirective field="director_sample_order" headerText="DIR S/O" width="100" template={genericHighlighter('director_sample_order')} />
          <ColumnDirective field="order_follow_up" headerText="ORD FOLLOW UP" width="100" template={genericHighlighter('order_follow_up')} />
          <ColumnDirective field="u7" headerText="U7" width="100" template={genericHighlighter('u7')} />
          <ColumnDirective field="quality_controller" headerText="QC" width="120" template={genericHighlighter('quality_controller')} />
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
              <AggregateColumnDirective field='slno1' type='Count' footerTemplate={footerCount} format='N'> </AggregateColumnDirective>
              <AggregateColumnDirective field='quantity' type='Sum' footerTemplate={footerSum} format='N'> </AggregateColumnDirective>
            </AggregateColumnsDirective>
          </AggregateDirective>
        </AggregatesDirective>
        <Inject services={[Sort, Edit, Filter, Group, Reorder, Search, VirtualScroll, Freeze, Resize, ContextMenu, Page, Toolbar, ColumnChooser, ColumnMenu, Aggregate, PdfExport]} />
      </GridComponent></TooltipComponent></div></>
  ), [dataSource]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', minWidth: 0, overflow: 'hidden' }}>


      {/* Global Styles */}
      <style>{`
        .custom-highlight { background-color: #fff9c4 !important; color: #d32f2f !important; font-weight: bold; }
        .e-rowcell { vertical-align: top !important; font-size: 12px !important; line-height: 1.3 !important; padding-top: 8px !important; }
        .e-filter-popup { z-index: 10000001 !important; }
        .e-grid { min-width: 0 !important; }
        
        /* Tooltip custom styles */
        .e-tooltip-wrap .e-tip-content {
          padding: 0 !important;
        }
        
        .e-tooltip-wrap {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          border: 1px solid #e0e0e0 !important;
        }
        
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

            @media (max-width: 1023px){
              .dashboard-header {
                margin-top:40px !important             
              }
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
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #eee', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight:'bold' }}>
    <TextBoxComponent
      ref={settingNameRef}
      placeholder="Enter setting name"
      style={{ width: '120px' }}
    />
  </div>

  <ButtonComponent
    onClick={saveSetting}
    cssClass="e-primary"
    style={{ padding: '6px 12px', fontSize: '13px' }}
  >
    💾
  </ButtonComponent>

<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <DropDownListComponent
    ref={dropdownRef}
    id="settings-dropdown"
    dataSource={savedSettings
      .filter(
        s =>
          s.user?.toLowerCase() === username?.toLowerCase() // normalize for comparison
      )
      .map(s => ({ text: s.name, value: s.id }))}
    fields={{ text: 'text', value: 'value' }}
    placeholder="Select setting..."
    style={{ minWidth: '150px' }}
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
          memoizedGridComponent
        )}
      </div>
    </div>
  );
};

export default OrderDetails;