import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  PdfExport, DetailRow,

} from '@syncfusion/ej2-react-grids';
import { ColumnsModel, QueryBuilderComponent } from '@syncfusion/ej2-react-querybuilder';
import { TooltipComponent, DialogComponent } from '@syncfusion/ej2-react-popups';
import { Ajax, Browser } from '@syncfusion/ej2-base';
import { TextBoxComponent, UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent, MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import './Material 3/Showcase Material3/style.css';
// import "../../../App.css";
// import { ClickEventArgs } from '@syncfusion/ej2-react-navigations';
import { DatePickerComponent, DateRangePickerComponent } from '@syncfusion/ej2-react-calendars';
import { DateRangePicker } from '@syncfusion/ej2-calendars';
import { DataUtil, DataManager, Query } from '@syncfusion/ej2-data';
MultiSelect.Inject(CheckBoxSelection);
interface OrderData {
  slno1?: number; // Added SL No field
  jobno_oms: string; company_name: string; buyer1: string; stylename: string; uom: string;
  final_delivery_date: string; merch: string; punit_sh: string; styleno: string;
  production_type_inside_outside: string; quantity: string; director_sample_order: string;
  printing_R: string; Fdt?: string; Emb: string; abc: string; order_follow_up: string;
  quality_controller: string; reference: string; insdatenew: string; styledesc: string;
  date: string; ourdelvdate: string; podate: string; vessel_dt: string; vessel_yr: string;
  shipment_complete: string; u7: string; u141: string; u45: string; u36: string; u31: string;Fdt_wk:string;
  u15: string; u14: string; u8: string; u25: string; insdate: string; insdateyear: string; finaldelvdate1: string; number_03_emb: string; actdate: string;
  actdaten: string; actyeardate: string; pono: string; u46: string; u37: string; qltycontroller: string; Print: string; Others1: string;
  mainimagepath: string; finaldelvdate: string; prnclr?: string | null; prnfile1?: string; prnfile2?: string; img_fpath?: string; clr?: string; print_img?: string; Fab_R: string;
  ITS_R: string; Order_R: string; Dy_R: string; Sample_R: string; Week_R: string; FMonth_yr: string; Emb_R: string; Week_R1: string; year: string; wk: string; 
  prnmeaimg?: string; mpic?: string; FabdyIN?: string;
  Others2: string; Others3: string; Others4: string; Others5: string; Others6: string; Others7: string,
}

const HeroFashionGrid131: React.FC = () => {
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchKey, setSearchKey] = useState<string>('');
  const customFilterRef = useRef<boolean>(false);
  const endDateRef = useRef<Date | null>(null);
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
  const [showQueryBuilderDialog, setShowQueryBuilderDialog] = useState<boolean>(false);
  const [tempPredicate, setTempPredicate] = useState<any>(null);

  const settingNameRef = useRef<TextBoxComponent>(null);
  const dropdownRef = useRef<DropDownListComponent>(null);
  const tooltipRef = useRef<TooltipComponent>(null);
  const gridRef = useRef<GridComponent>(null);
  const qryBldrObj = useRef<QueryBuilderComponent>(null);
  const dialogRef = useRef<DialogComponent>(null);

  const searchableFields = useMemo(() => [
    'slno1', 'jobno_oms', 'company_name', 'buyer1', 'stylename', 'uom',
    'final_delivery_date', 'merch', 'punit_sh', 'styleno',
    'production_type_inside_outside', 'quantity', 'director_sample_order',
    'printing_R', 'Fdt', 'Emb', 'abc', 'order_follow_up',
    'quality_controller', 'reference', 'insdatenew', 'styledesc',
    'date', 'ourdelvdate', 'podate', 'vessel_dt', 'vessel_yr',
    'shipment_complete', 'u7', 'u141', 'u45', 'u36', 'u31', 'Emb_R',
    'u15', 'u14', 'u8', 'u25', 'insdate', 'insdateyear', 'finaldelvdate1',
    'number_03_emb', 'actdate', 'actdaten', 'actyeardate', 'pono', 'u46', 'u37',
    'qltycontroller', 'Print', 'others1', 'mainimagepath', 'finaldelvdate',
    'prnclr', 'prnfile1', 'prnfile2', 'img_fpath', 'clr', 'print_img', 'FMonth_yr', 'wk',
    'Fab_R', 'ITS_R', 'Order_R', 'Dy_R', 'Sample_R', 'Week_R', 'year',"FabdyIN",
    'prnmeaimg', 'mpic', 'Others2', 'Others3', 'Others4', 'Others5', 'Others6', 'Others7'
  ], []);

  // Memoized search settings for better performance
  const searchSettings = useMemo(() => ({
    fields: searchableFields,
    operator: 'contains' as any,
    ignoreCase: true
  }), [searchableFields]);

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
    if (diffDays < 0) return { backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    if (diffDays === 0) return { backgroundColor: '#fff3e0', color: '#ef6c00', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    if (diffDays > 0 && diffDays <= 3) return { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    return { color: '#2e7d32', fontWeight: '500' };
  };

  const getPunitStyle = (punit_sh: string) => {
    const code = (punit_sh || '').trim().toUpperCase();
    if (code === 'U1') return { backgroundColor: '#007bff', color: 'orange', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    if (code === 'U2') return { backgroundColor: '#28a745', color: 'orange', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' };
    return { color: '#555' };
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const [orderResponse] = await Promise.all([
          fetch('https://app.herofashion.com/order_panda'),
          
        ]);
        if (!orderResponse.ok ) throw new Error("Failed to fetch data from APIs");

        const orderData: OrderData[] = await orderResponse.json();

        const printMap: Record<string, any> = {};

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
              if (typeA === 'Sam D') return -1; if (typeB === 'Sam D') return 1;
              return typeA.localeCompare(typeB);
            }
            const dateA = new Date(a.finaldelvdate || a.final_delivery_date || 0).getTime();
            const dateB = new Date(b.finaldelvdate || b.final_delivery_date || 0).getTime();
            return dateA - dateB;
          })

          .sort((a, b) => {
            // Priority: Sample=0, Order=1, Others=2
            const getPriority = (val: string) => {
              const type = (val || '').toLowerCase().trim();
              if (type === 'Sam D') return 0;
              if (type === 'Ord D') return 1;
              return 2;
            };

            const priorityA = getPriority(a.director_sample_order);
            const priorityB = getPriority(b.director_sample_order);

            // Sort by priority: Sample first, Order second, Others last
            if (priorityA !== priorityB) {
              return priorityA - priorityB;
            }

            // Within same priority, sort by finaldelvdate ascending
            const dateA = parseDate(a.finaldelvdate);
            const dateB = parseDate(b.finaldelvdate);

            // Handle null/invalid dates — push them to the end
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;

            return dateA.getTime() - dateB.getTime();
          })

          // --- FRONTEND SLNO GENERATION ---
          .map((item, index) => ({
            ...item,
            slno1: index + 1
          }));
        // Convert UTC date strings to Date objects for proper grid date handling
        const gridData = (DataUtil as any).parse.parseJson(JSON.stringify(processedData));
        setDataSource(gridData);
        setTotalCount(processedData.length);
        setShowingCount(processedData.length);
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
      try { persistedSettings = JSON.parse(persist); } catch { }

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
        // alert('Setting applied successfully');
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

   const stringOperator = [
    { key: 'IN', value: 'in' },
    { key: 'NOT IN', value: 'notin' },
    { key: 'STARTS WITH', value: 'startswith' },
    { key: 'ENDS WITH', value: 'endswith' },
    { key: 'CONTAINS', value: 'contains' },
    { key: 'EQUAL', value: 'equal' },
    { key: 'NOT EQUAL', value: 'notequal' },

  ];

  // --- QueryBuilder Configuration (Memoized for performance) ---
  const queryBuilderColumns: ColumnsModel[] = useMemo(() => [
    // { field: 'jobno_oms', label: 'Job No', type: 'string' },
    // { field: 'company_name', label: 'Company', type: 'string' },
    // { field: 'buyer1', label: 'Buyer', type: 'string' },
    // { field: 'stylename', label: 'Style Name', type: 'string' },
    // { field: 'styleno', label: 'Style No', type: 'string' },
    // { field: 'quantity', label: 'Quantity', type: 'number' },
    // { field: 'director_sample_order', label: 'Director Sample/Order', type: 'string' },
    // { field: 'production_type_inside_outside', label: 'Production Type', type: 'string' },
    // { field: 'merch', label: 'Merch', type: 'string' },
    // { field: 'punit_sh', label: 'Unit', type: 'string' },
    // { field: 'finaldelvdate1', label: 'Final Delivery Date', type: 'date', format: 'dd/MM/yyyy' },
    // { field: 'Fdt', label: 'Fdt', type: 'string' },
    // { field: 'printing_R', label: 'Printing', type: 'string' },
    // { field: 'Emb_R', label: 'Embroidery', type: 'string' },
    // { field: 'Fab_R', label: 'Fabric', type: 'string' },
    // { field: 'ITS_R', label: 'ITS', type: 'string' },
    // { field: 'Order_R', label: 'Order', type: 'string' },
    // { field: 'quality_controller', label: 'Quality Controller', type: 'string' },
    // { field: 'uom', label: 'UOM', type: 'string' },
    // { field: 'abc', label: 'ABC', type: 'string' }
    
    { field: 'fdt', label: 'FDT ISO', type: 'date' , operators:stringOperator },
    { field: 'slno', label: 'Serial No', type: 'number' , operators:stringOperator},
    { field: 'insdatenew', label: 'Ins Date New', type: 'string', operators:stringOperator },
    { field: 'jobno_oms', label: 'Job No OMS', type: 'string', operators:stringOperator },
    { field: 'printing_R', label: 'Printing Status', type: 'string', operators:stringOperator },
    { field: 'buyerid', label: 'Buyer ID', type: 'number', operators:stringOperator },
    { field: 'mpyear', label: 'MP Year', type: 'number' , operators:stringOperator},
    { field: 'number_01_printing', label: 'Printing No', type: 'number', operators:stringOperator },
    { field: 'number_03_emb', label: 'Embroidery No', type: 'number', operators:stringOperator },
    { field: 'mpdate', label: 'MP Date', type: 'date' , operators:stringOperator},
    { field: 'refno', label: 'Ref No', type: 'string', operators:stringOperator },
    { field: 'stylename', label: 'Style Name', type: 'string', operators:stringOperator },
    { field: 'styledesc', label: 'Style Description', type: 'string', operators:stringOperator },
    { field: 'season', label: 'Season', type: 'string' , operators:stringOperator},
    { field: 'jobnoomsnew', label: 'Job No New', type: 'string', operators:stringOperator },
    { field: 'Print', label: 'Print Detail', type: 'string', operators:stringOperator },
    { field: 'Others1', label: 'Image Link 1', type: 'string', operators:stringOperator },
    { field: 'Others2', label: 'Image Link 2', type: 'string', operators:stringOperator },
    { field: 'Others3', label: 'Image Link 3', type: 'string', operators:stringOperator },
    { field: 'Others4', label: 'Image Link 4', type: 'string', operators:stringOperator },
    { field: 'Others5', label: 'Image Link 5', type: 'string', operators:stringOperator },
    { field: 'Others6', label: 'Image Link 6', type: 'string', operators:stringOperator },
    { field: 'Others7', label: 'Image Link 7', type: 'string', operators:stringOperator },
    { field: 'Emb', label: 'Embroidery Detail', type: 'string', operators:stringOperator },
    { field: 'mainimagepath', label: 'Main Image Path', type: 'string', operators:stringOperator },
    { field: 'ordimg1_pen', label: 'Order Image Pending', type: 'string', operators:stringOperator },
    { field: 'seasonyear', label: 'Season Year', type: 'number', operators:stringOperator },
    { field: 'styleid', label: 'Style ID', type: 'number', operators:stringOperator },
    { field: 'final_delivery_date', label: 'Final Delivery Date', type: 'string', operators:stringOperator },
    { field: 'finaldelvdate1', label: 'Final Delv Date ISO', type: 'date', operators:stringOperator },
    { field: 'year', label: 'Year', type: 'string', operators:stringOperator },
    { field: 'final_year_delivery', label: 'Final Year Delv', type: 'string', operators:stringOperator },
    { field: 'final_year_delivery1', label: 'Final Year Delv ISO', type: 'string', operators:stringOperator },
    { field: 'ddays', label: 'Delivery Days', type: 'number', operators:stringOperator },
    { field: 'fdays', label: 'Final Days', type: 'number', operators:stringOperator },
    { field: 'insdays', label: 'Inspection Days', type: 'number', operators:stringOperator },
    { field: 'finaldelvdate', label: 'Final Delv Date Str', type: 'string', operators:stringOperator },
    { field: 'ourdeldate', label: 'Our Delivery Date', type: 'string', operators:stringOperator },
    { field: 'date', label: 'Entry Date', type: 'string', operators:stringOperator },
    { field: 'ourdelvdate', label: 'Our Delv Date Short', type: 'string', operators:stringOperator },
    { field: 'podate', label: 'PO Date', type: 'string', operators:stringOperator },
    { field: 'vessel_dt', label: 'Vessel Date', type: 'date', operators:stringOperator },
    { field: 'vessel_yr', label: 'Vessel Year', type: 'string', operators:stringOperator },
    { field: 'pono', label: 'PO No', type: 'string', operators:stringOperator },
    { field: 'shipmentcompleted', label: 'Shipment Completed', type: 'number', operators:stringOperator },
    { field: 'reference', label: 'Production Remarks', type: 'string', operators:stringOperator },
    { field: 'no', label: 'Job No Short', type: 'string', operators:stringOperator },
    { field: 'company_name', label: 'Company Name', type: 'string', operators:stringOperator },
    { field: 'mer_un', label: 'Merchandiser Unit', type: 'string', operators:stringOperator },
    { field: 'image_order', label: 'Order Image URL', type: 'string', operators:stringOperator },
    { field: 'abc', label: 'ABC Status', type: 'string', operators:stringOperator },
    { field: 'order_follow_up', label: 'Order Follow-up', type: 'string', operators:stringOperator },
    { field: 'quality_controller', label: 'QC Person', type: 'string', operators:stringOperator },
    { field: 'buyer_sh', label: 'Buyer Short', type: 'string', operators:stringOperator },
    { field: 'buyer1', label: 'Buyer Code', type: 'string', operators:stringOperator },
    { field: 'punit_sh', label: 'Production Unit Short', type: 'string', operators:stringOperator },
    { field: 'insdateyear', label: 'Inspection Year', type: 'string', operators:stringOperator },
    { field: 'insdate', label: 'Inspection Date', type: 'date', operators:stringOperator },
    { field: 'FMonth_yr', label: 'Month Year Ref', type: 'string', operators:stringOperator },
    { field: 'quantity', label: 'Total Quantity', type: 'number', operators:stringOperator },
    { field: 'production_unit1', label: 'Prod Unit Code', type: 'string', operators:stringOperator },
    { field: 'styleno', label: 'Style No', type: 'string', operators:stringOperator },
    { field: 'buyer', label: 'Buyer Full Name', type: 'string', operators:stringOperator },
    { field: 'merch', label: 'Merchandiser', type: 'string', operators:stringOperator },
    { field: 'u46', label: 'U46 Status', type: 'string', operators:stringOperator },
    { field: 'u7', label: 'U7 Status', type: 'string', operators:stringOperator },
    { field: 'u141', label: 'U141 Status', type: 'string', operators:stringOperator },
    { field: 'u45', label: 'U45 Status', type: 'string', operators:stringOperator },
    { field: 'u36', label: 'U36 Status', type: 'string', operators:stringOperator },
    { field: 'u31', label: 'U31 Status', type: 'string', operators:stringOperator },
    { field: 'u5', label: 'U5 Status', type: 'string', operators:stringOperator },
    { field: 'u14', label: 'U14 Status', type: 'string', operators:stringOperator },
    { field: 'u8', label: 'U8 Status', type: 'string', operators:stringOperator },
    { field: 'u37', label: 'U37 Status', type: 'string', operators:stringOperator },
    { field: 'u25', label: 'U25 Status', type: 'string', operators:stringOperator },
    { field: 'Emb_R', label: 'Embroidery Readiness', type: 'string', operators:stringOperator },
    { field: 'Week_R1', label: 'Week Ref Full', type: 'string', operators:stringOperator },
    { field: 'wk', label: 'Week Year', type: 'string', operators:stringOperator },
    { field: 'wk113', label: 'Week Detailed', type: 'string', operators:stringOperator },
    { field: 'Fab_R', label: 'Fabric Readiness', type: 'string', operators:stringOperator },
    { field: 'ITS_R', label: 'ITS Readiness', type: 'string', operators:stringOperator },
    { field: 'Order_R', label: 'Order Readiness', type: 'string', operators:stringOperator },
    { field: 'Dy_R', label: 'Dyeing Readiness', type: 'string', operators:stringOperator },
    { field: 'Sample_R', label: 'Sample Readiness', type: 'string', operators:stringOperator },
    { field: 'Week_R', label: 'Week Ref Short', type: 'string', operators:stringOperator },
    { field: 'actdaten', label: 'Actual Date ISO', type: 'date', operators:stringOperator },
    { field: 'actdate', label: 'Actual Date Str', type: 'string', operators:stringOperator },
    { field: 'actyeardate', label: 'Actual Year Date', type: 'string', operators:stringOperator },
    { field: 'con_actdate', label: 'Combined Act Date', type: 'string', operators:stringOperator },
    { field: 'uom', label: 'Unit of Measure', type: 'string', operators:stringOperator },
    { field: 'production_unit', label: 'Production Unit Name', type: 'string', operators:stringOperator },
    { field: 'director_sample_order', label: 'Director Status', type: 'string', operators:stringOperator }

  ], []);

  const updateResult = useCallback((args: any) => {
    if (!qryBldrObj.current) return;

    try {
      // Get the predicate from QueryBuilder and store it temporarily
      const predicate = qryBldrObj.current.getPredicate(args.rule);
      setTempPredicate(predicate);
    } catch (error) {
      console.error('Error building predicate:', error);
      setTempPredicate(null);
    }
  }, []);

  const applyQueryToGrid = useCallback(() => {
    try {
      if (tempPredicate && dataSource.length > 0) {
        // Filter the data using the predicate with Syncfusion DataManager
        const dataManager = new DataManager(dataSource as any);
        const query = new Query().where(tempPredicate);
        const filteredRecords = dataManager.executeLocal(query);

        // Update grid with filtered data
        if (gridRef.current) {
          gridRef.current.query = query;
          setShowingCount(filteredRecords.length);
        }
      } else {
        if (gridRef.current) {
          const query = new Query();
          const dataManager = new DataManager(dataSource as any);
          const filteredRecords = dataManager.executeLocal(query);
          gridRef.current.query = query;
          setShowingCount(filteredRecords.length);
        }
      }
      // Close dialog after applying
      setShowQueryBuilderDialog(false);
    } catch (error) {
      console.error('Error filtering data:', error);
      if (gridRef.current) {
        gridRef.current.query = new Query();
      }
    }
  }, [tempPredicate, dataSource]);

  const toggleQueryBuilder = useCallback(() => {
    setShowQueryBuilderDialog((prevState) => !prevState);
  }, []);

  // --- Search & Highlight Logic ---
  const highlightText = (text: any) => {
    // Handle null/undefined
    if (text === undefined || text === null) return text;

    // Convert Date objects to readable string format
    let stringText: string;
    if (text instanceof Date) {
      // Format date as dd/MM/yyyy
      const day = String(text.getDate()).padStart(2, '0');
      const month = String(text.getMonth() + 1).padStart(2, '0');
      const year = text.getFullYear();
      stringText = `${day}/${month}/${year}`;
    } else {
      stringText = String(text);
    }

    // If no search key, return the formatted string
    if (!searchKey) return stringText;

    // Apply highlighting
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

  const created = useCallback(() => {
    document.getElementById(gridRef.current?.element.id + "_searchbar")?.addEventListener('keyup', (event: any) => {
      gridRef.current?.search(event.target?.value);
    });
  }, []);

  const genericHighlighter = (field: keyof OrderData) => (props: OrderData) => (
    <>{highlightText(props[field])}</>
  );

  // Double-tap detection for mobile
  const lastTapTimeRef = useRef<number>(0);
  const lastTapTargetRef = useRef<EventTarget | null>(null);
  
  const imageDoubleTapHandler = useCallback((e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTimeRef.current;
    const target = e.currentTarget;
    
    // Double tap detected (within 300ms and on same element)
    if (tapLength < 300 && tapLength > 0 && lastTapTargetRef.current === target) {
      console.log('Double tap detected on mobile!');
      e.preventDefault(); // Prevent zoom on mobile
      
      if (target.getAttribute("data-tooltip-id")) {
        tooltipRef.current?.close();
      } else {
        tooltipRef.current?.open(target);
      }
      
      // Reset
      lastTapTimeRef.current = 0;
      lastTapTargetRef.current = null;
    } else {
      // First tap
      lastTapTimeRef.current = currentTime;
      lastTapTargetRef.current = target;
    }
  }, []);

  // --- Templates ---
  const imageFieldTemplate = useCallback((field: 'mainimagepath' | 'Print' | 'print_img' | 'prnmeaimg' | 'img_fpath' | 'Emb' | 'Others1' | 'Others2' | 'Others3' | 'Others4' | 'Others5' | 'Others6' | 'Others7') => (p: OrderData) => {
    if (!p[field]) return <div style={{ color: '#ccc', fontSize: '10px' }}>No Image</div>;
    
    return (
      <img 
        src={p[field]} 
        alt="img" 
        onClick={Browser.isDevice ? imageDoubleTapHandler : undefined}
        style={{ 
          width: '70px', 
          height: '70px', 
          objectFit: 'contain', 
          border: '1px solid #eee',
          touchAction: Browser.isDevice ? 'manipulation' : 'auto' // Prevents zoom on double-tap
        }} 
      />
    );
  }, [imageDoubleTapHandler]);

  let serverUpdated = false;
  let newPrimaryKey: number | null = null;
  const actionBegin = useCallback((args: AddEventArgs | SaveEventArgs | EditEventArgs | DeleteEventArgs | ActionEventArgs) => {
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
    if (
      (args as any).action === 'filter' &&
      (args as any).currentFilteringColumn === 'finaldelvdate1' &&
      customFilterRef.current
    ) {
      customFilterRef.current = false;
      // Add end date value as additional filter with ‘lessthan’ operator
      (args as any).columns.push({
        actualFilterValue: {},
        actualOperator: {},
        field: 'finaldelvdate1',
        ignoreAccent: false,
        isForeignKey: false,
        matchCase: false,
        operator: 'lessThanOrEqual',
        predicate: 'and',
        uid: gridRef.current?.getColumnByField((args as any).currentFilteringColumn).uid,
        value: endDateRef.current,
      });
    }
  }, []);

  const actionComplete = useCallback((args: AddEventArgs | SaveEventArgs | EditEventArgs | DeleteEventArgs | ActionEventArgs) => {
    if (args.requestType === 'beginEdit') {
      // buyerIdVal = args.rowData['buyerid_id'];
    }
    if (args.requestType === 'save') {
      // integrate your WhatsApp Integration code logic here
      serverUpdated = false;
      newPrimaryKey = null;
    }
    if(args.requestType==='searching')
    {
      const records = gridRef.current?.getFilteredRecords();
      setShowingCount(records ? (records as object[]).length : 0);
    }
  }, []);

  const orderSummaryTemplate = (p: OrderData) => {
    return (
      <div style={{ fontSize: '12px', lineHeight: '1.4', width: '90px' }}>
        <b>OR-</b> {highlightText(p.jobno_oms)}<br />
        <b>Buy-</b> {highlightText(p.buyer1)}<br />
        <b>Mer-</b> {p.merch ? highlightText(p.merch.includes("Murthy-") ? p.merch.split("Murthy-h ")[1] : p.merch) : ""}<br />
        <b>Unit-</b> <span style={getPunitStyle(p.punit_sh)}>{highlightText(p.punit_sh)}</span><br />
        <b>Qty-</b> {highlightText(p.quantity)}
      </div>
    );
  }

  const orderSummaryHeaderTemplate = (p: OrderData) => {
    return (
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <b>OR</b><br/>
        <b>Buy</b> <br/>
        <b>Mer</b> <br/>
        <b>Unit</b><br/>
        <b>Qty</b><br/>
      </div>
    );
  }

  
 const udf11 = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>FabdyIN:</b> {highlightText(p.FabdyIN)}<br />
      <b>Fdt_wk:</b> {highlightText(p.Fdt_wk)}<br />
      </div>);
  
  const ordHeaderTemplate = (p: OrderData) => {
    return (
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <b>Fdt</b><br/>
        <b>Dir</b> <br/>
        <b>ST</b> <br/>
        <b>UOM</b><br/>
        <b>Type</b><br/>
        
      </div>
    );
  }

  const udfheaderTemplate = (p: OrderData) => {
    return (
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <b>1-Print</b><br/>
        <b>3-Emb</b> <br/>
        <b>8-Fab</b> <br/>
        <b>14-dye</b><br/>
        <b>7-cust</b><br/>
      </div>
    );
  }
  
  const udf4HeaderTemplate = (p: OrderData) => {
    return (
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          <b>MO</b><br/>
          <b>wk</b> <br/>
          <b>yr</b> <br/>
          <b>uom</b> <br/>
          <b>abc</b> <br/>
          {/* <b>order_follow_up</b><br/>
          <b>Qty</b><br/> */}
      </div>
    );
  }

  const udf2HeaderTemplate = (p: OrderData) => {
    return (
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <b>31-ITS</b><br/>
        <b>36-CT</b> <br/>
        <b>45-Ord</b> <br/>
        <b>46-Empty</b><br/>
        <b>141-Sam</b><br/>
      </div>
    );
  }

  const udf = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b className='no-highlight'>1-Print-</b> {highlightText(p.printing_R)}<br />
      <b className='no-highlight'>3-Emb-</b> {highlightText(p.Emb_R)}<br />
      <b className='no-highlight'>8-Fab-</b> {highlightText(p.Fab_R)}<br />
      <b className='no-highlight'>14-dye-</b> {highlightText(p.Dy_R)}<br />
      <b className='no-highlight'>7-cust</b> {highlightText(p.u7)}<br />
      {/* <b>25-week:</b> {highlightText(p.Week_R)}<br /> */}
      {/* <b>Unit:</b> <span style={getPunitStyle(p.punit_sh)}>{highlightText(p.punit_sh)}</span><br />
      <b>Qty:</b> {highlightText(p.quantity)} */}
    </div>
  );

  const udf2 = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>31-ITS</b> {highlightText(p.ITS_R)}<br />
      <b>36-CUT</b> {highlightText(p.u36)}<br />
      <b>45-Ord</b> {highlightText(p.Order_R)}<br />
      <b>46-Empty</b> {highlightText(p.u46)}<br />
      <b>141-Sam</b> {highlightText(p.Sample_R)}<br />
      {/* <b>3-Emb:</b> {highlightText(p.number_03_emb)}<br />
      <b>8-Fab:</b> {highlightText(p.u8)}<br />
      <b>14-Fabdy:</b> {highlightText(p.u14)}<br /> */}
      {/* <b>31:</b> {highlightText(p.u31)}<br /> */}
      {/* <b>36-ITS:</b> {highlightText(p.u36)}<br /> */}
      {/* <b>Unit:</b> <span style={getPunitStyle(p.punit_sh)}>{highlightText(p.punit_sh)}</span><br />
      <b>Qty:</b> {highlightText(p.quantity)} */}
    </div>
  );

  const qualy = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>styleno-</b> {highlightText(p.styleno)}<br />
      <b>styledesc-</b> {highlightText(p.styledesc)}<br />
      <b>qcontr-</b> {highlightText(p.quality_controller)}<br />

      {/* <b>36-ITS:</b> {highlightText(p.u36)}<br /> */}
    </div>
  );

  const prdty = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>ptype:</b> {highlightText(p.production_type_inside_outside)}<br />
      <b>dir_sam_ord:</b> {highlightText(p.director_sample_order)}<br />
      <b>comp:</b> {highlightText(p.company_name)}<br />
      {/* <b>25-week:</b> {highlightText(p.Week_R)}<br /> */}
      <b>order_follow_up:</b> {highlightText(p.order_follow_up)}<br />
      {/* <b>ref:</b> {highlightText(p.reference)}<br /> */}
      {/* <b>order_follow_up:</b> {highlightText(p.order_follow_up)}<br /> */}
      {/* <b>36-ITS:</b> {highlightText(p.u36)}<br /> */}
    </div>
  );


  const Alldate = (p: OrderData) => (
    <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
      <b>finaldelvdate:</b> {highlightText(p.finaldelvdate)}<br />
      <b>ourdelvdate:</b> {highlightText(p.ourdelvdate)}<br />
      <b>date:</b> {highlightText(p.date)}<br />
      {/* <b>date:</b> {highlightText(p.date)}<br />
      <b>actdate:</b> {highlightText(p.actdate)}<br /> */}
      {/* <b>order_follow_up:</b> {highlightText(p.order_follow_up)}<br /> */}
      {/* <b>36-ITS:</b> {highlightText(p.u36)}<br /> */}
    </div>
  );

  const deliveryInfoTemplate = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>Fdt:</b> <span style={getDateStyle(p.Fdt || p.final_delivery_date)}>{highlightText(p.Fdt || p.final_delivery_date)}</span><br />
      <b>Dir:</b> {highlightText(p.director_sample_order)}<br />
      <b>ST:</b> {highlightText(p.styleno)}<br />
      <b>Uom:</b> {highlightText(p.uom)}<br />
      <b>PType:</b> {highlightText(p.production_type_inside_outside)}
    </div>
  );

  const udf4 = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      {/* <b>Fdt:</b> <span style={getDateStyle(p.Fdt || p.final_delivery_date)}>{highlightText(p.Fdt || p.final_delivery_date)}</span><br /> */}
      {/* <b>Week_R:</b> {highlightText(p.Week_R)}<br /> */}
      <b>Month-</b> {highlightText(p.FMonth_yr)}<br />
      <b>Week-</b> {highlightText(p.Week_R)}<br />
      <b>Year-</b> {highlightText(p.wk)}<br />
      {/* <b>ST:</b> {highlightText(p.styleno)}<br /> */}
      <b>Uom-</b> {highlightText(p.uom)}<br />
      <b>abc-</b> {highlightText(p.abc)}<br />

    </div>
  );

  const searchTemplate = useMemo(() => {
    return () => {
      const handleSearchInput = (e: any) => {
        const value = e.value || '';
        if (gridRef.current) {
          gridRef.current.search(value);
        }

      };

      return (
        <div>
          <TextBoxComponent
            id="customSearch"
            placeholder="Search..."
            input={handleSearchInput}
            showClearButton={true}
            style={{ width: '100px' }}
            cssClass="custom-search-textbox"
          />
        </div>
      );
    };
  }, []);

  const toolbarOptions: any[] = [
    {
      id: 'searching',
      align: 'Left' as any,
      template: searchTemplate,
    },
    // { text: 'Search', prefixIcon: 'e-icons e-search', id: 'default-aggregate-grid_search', align: 'Left' as any },
    { text: '', prefixIcon: 'e-add', id: 'add_icon', tooltipText: 'Add Records' },
    'Edit',
    'Delete',
    'Update',
    'Cancel',
    // { type: 'Separator' },
    { text: '', prefixIcon: 'e-filter', id: 'query_builder_toggle', tooltipText: 'Toggle Query Builder' },
    { text: 'FilterToggle', id: 'filterToggle', tooltipText: 'filterToggle' },
    { text: 'Clear All', id: 'clearAll', tooltipText: 'Clear All' },
    { text: '', prefixIcon: 'sf-icon-clear-sorting', id: 'clearsorting_icon', tooltipText: 'Clear Sorting' },
    { text: '', prefixIcon: 'e-filter-clear icon', id: 'clearfilter_icon', tooltipText: 'Clear Filtering' },
    // { type: 'Separator' },
    { text: '', prefixIcon: 'sf-icon-clear-selection', id: 'clear_selection', tooltipText: 'Clear Selection' },
    { text: '', prefixIcon: 'sf-icon-row-clear', id: 'clear_row_selection', tooltipText: 'Clear Row Selection' },
    { text: '', prefixIcon: 'sf-icon-column-clear', id: 'clear_column_selection', tooltipText: 'Clear Column Selection' },
    { text: '', prefixIcon: 'sf-icon-clear-cell', id: 'clear_cell_selection', tooltipText: 'Clear Cell Selection' },
    // { type: 'Separator' },
    // { type: 'Separator' },
    { text: '', prefixIcon: 'e-csvexport', id: 'export_csv', tooltipText: 'Export CSV' },
    { text: '', prefixIcon: 'e-excelexport', id: 'export_excel', tooltipText: 'Export Excel' },
    { text: '', prefixIcon: 'e-pdfexport', id: 'export_pdf', tooltipText: 'Export PDF' },
    'ColumnChooser',
    { text: '', prefixIcon: 'e-zoom-to-fit', id: "pagination_grid", tooltipText: 'Allow Pagination' }
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
      const parentElem: any = node.parentNode;
      if (parentElem?.classList?.contains('no-highlight')) {
        continue;
      }

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
  const firstTruthy = (...vals: Array<any>) =>
    vals.find((v) => typeof v === "string" && v.trim().length > 0) || "";

  /** NEW: show any non-empty value (string/number/boolean) else dash */
  const showVal = (val: any): string => {
    if (val === null || val === undefined) return "–";
    if (typeof val === "string") {
      const t = val.trim();
      return t.length ? t : "–";
    }
    // number/boolean/object: stringify safely
    try {
      return String(val);
    } catch {
      return "-";
    }
  };


  const clearHighlights = () => {

    CSS.highlights.delete('search');

  };
  let initialRender=true;
  const dataBound= useCallback((args: any) => {
    console.log('dataBound')
    if(initialRender)
    {
      initialRender=false;
      // gridRef.current?.autoFitColumns();
    }
    if (gridRef.current) {
      if (gridRef.current.searchSettings.key && gridRef.current.searchSettings.key.length > 0) {
        searchHighlightText(gridRef.current?.searchSettings?.key, gridRef.current?.element);
      }
    }
},[]);
  // Dialog Form Component
  const DialogFormTemplate = (props: OrderData) => {
    const jobnoRef = React.useRef<HTMLInputElement>(null);
    const buyerRef = React.useRef<HTMLInputElement>(null);
    const uploaderRef = React.useRef<UploaderComponent>(null);

    const [data, setData] = React.useState<Partial<OrderData>>(
      React.useMemo(() => ({ ...props }), [props])
    );

    // Helper function to check if a field exists in grid columns
    const isFieldInGrid = (fieldName: string): boolean => {
      if (!gridRef.current) return false;
      const columns = gridRef.current.columns as any[];
      return columns.some(col => col.field === fieldName);
    };

    React.useEffect(() => {
      if (data.jobno_oms) {
        buyerRef.current?.focus();
      } else {
        jobnoRef.current?.focus();
      }
    }, [data.jobno_oms]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const key = e.target.name;
      const value = e.target.value;
      setData(prevData => ({ ...prevData, [key]: value }));
    };

    const handleFileSelected = (e: any) => {
      try {
        if (e.filesData && e.filesData.length > 0) {
          const file = e.filesData[0];
          const reader = new FileReader();
          reader.onload = (event: any) => {
            setData(prev => ({ ...prev, mainimagepath: event.target.result }));
          };
          reader.readAsDataURL(file.rawFile);
        }
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };

    const handleClearImage = () => {
      try {
        // Clear the uploader's internal file list
        if (uploaderRef.current) {
          uploaderRef.current.clearAll();
        }
        // Clear the image from state
        setData(prev => ({ ...prev, mainimagepath: undefined }));
      } catch (error) {
        console.error('Error clearing image:', error);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px' }}>
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* {isFieldInGrid('jobno_oms') && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>jobno_oms</label>
              <input ref={jobnoRef} id="jobno_oms" name="jobno_oms" type="text" disabled value={data.jobno_oms || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f5f5f5' }} />
            </div>
          )} */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>printing_R</label>
              <input id="printing_R" name="printing_R" type="text" value={data.printing_R || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Fdt</label>
              {/* <input id="Fdt" name="Fdt" type="text" value={data.Fdt || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} /> */}
              <DatePickerComponent id="fdt" name="fdt" type="text" value={(data as any).fdt}/>
            </div>
        </div>



        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>


          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>Emb_R</label>
            <input id="Emb_R" name="Emb_R" type="text" value={data.Emb_R || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>


          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u7</label>
            <input id="u7" name="u7" type="text" value={data.u7 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>


        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u8</label>
            <input id="Fab_R" name="Fab_R" type="text" value={data.Fab_R || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>


          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u14</label>
            <input id="u14" name="u14" type="text" value={data.u14 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>
              
             <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u46</label>
            <input id="u46" name="u46" type="text" value={data.u46 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u36</label>
            <input id="u36" name="u36" type="text" value={data.u36 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u31</label>
            <input id="ITS_R" name="ITS_R" type="text" value={data.ITS_R || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u45</label>
            <input id="Order_R" name="Order_R" type="text" value={data.Order_R || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>


          {/* <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u45</label>
            <input id="u141" name="u141" type="text" value={data.u45 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div> */}

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>141</label>
            <input id="Sample_R" name="Sample_R" type="text" value={data.Sample_R || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>


            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u45</label>
              <input id="u45" name="u45" type="text" value={data.u45 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div>

        </div>


        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>


          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u7</label>
            <input id="u7" name="u7" type="text" value={data.u7 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
          </div>
           <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>quantity</label>
              <input id="quantity" name="quantity" type="text" value={data.quantity || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div>


        </div>

        
        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>quantity</label>
              <input id="quantity" name="quantity" type="text" value={data.quantity || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div> */}
          
          

            {/* <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u45</label>
              <input id="u45" name="u45" type="text" value={data.u45 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div> */}

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u46</label>
              <input id="u46" name="u46" type="text" value={data.u46 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '5px' }}>u141</label>
              <input id="u141" name="u141" type="text" value={data.u141 || ''} onChange={onChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
            </div>
        </div>

        {/* Row 4 - Full width image uploader */}

          <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '15px', fontWeight: 'bold' }}>mainimagepath</label>
            {data.mainimagepath && (
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                <img src={data.mainimagepath} alt="Current" style={{ maxWidth: '200px', maxHeight: '150px', border: '2px solid #5E5FE3', borderRadius: '4px', padding: '5px' }} />
              </div>
            )}
            <div key={`uploader-${props.jobno_oms}`} style={{ display: 'contents' }}>
              <UploaderComponent
                ref={uploaderRef}
                id='mainimagepath'
                type='file'
                asyncSettings={{ saveUrl: 'https://services.syncfusion.com/react/base/api/FileUpload/Save', removeUrl: 'https://services.syncfusion.com/react/base/api/FileUpload/Remove' }}
                autoUpload={false}
                sequentialUpload={true}
                showFileList={false}
                success={() => {
                  // can get the raw file
                }}
                selected={handleFileSelected}
                clearing={handleClearImage}
                change={(e: any) => {
                  // Reset uploader if user cancels file selection after clearing
                  if (!e.filesData || e.filesData.length === 0) {
                    if (uploaderRef.current) {
                      uploaderRef.current.clearAll();
                    }
                  }
                }}
              />
            </div>
          </div>
      </div>
    );
  };

  // Dialog Template Wrapper
  const dialogTemplate = useCallback((props: OrderData) => <DialogFormTemplate {...props} />, []);
  const toolbarClick = useCallback((args: any) => {
    if (!gridRef.current) return;

    const itemId = args.item?.id;

    switch (itemId) {
      case 'add_icon':
        console.log('Add Records clicked');
        gridRef.current.addRecord();
        break;

      case 'query_builder_toggle':
        toggleQueryBuilder();
        break;

      case 'pagination_grid': {

        const isPaging = gridRef.current.allowPaging;

        gridRef.current.setProperties({

          allowPaging: !isPaging,

          enableVirtualization: isPaging,

        }, true);

        gridRef.current.freezeRefresh();

        break;

      }

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
      case 'filterToggle':
        gridRef.current.setProperties({
          allowFiltering:!gridRef.current.allowFiltering
        },true)
        gridRef.current.freezeRefresh();
        break;
      case 'clearAll':
        gridRef.current.setProperties({
          filterSettings:{columns:{}},
          sortSettings:{columns:[]},
          searchSettings:{key:""},
          query:new Query()
        },true)
        gridRef.current.freezeRefresh();
        qryBldrObj.current?.reset();
        setShowingCount(0);
        break;
      default:
        console.log('Toolbar item clicked:', itemId);
        break;
    }
  },[]);

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

  const groupByPrint = (printing: OrderData[]) => {
    const map = new Map<string, any>();

    printing.forEach((item) => {
      const key = `${item.jobno_oms ?? ""}_${item.buyer1 ?? ""}_${item.merch ?? ""}`;

      if (!map.has(key)) {
        const primaryImage = firstTruthy(item.mainimagepath, item.prnfile1, item.prnfile2);
        const secondaryImage = firstTruthy(item.prnfile2);
        // const imageTb = firstTruthy(item.image_tb);

        const image1 = secondaryImage && secondaryImage !== primaryImage ? secondaryImage : "";
        // const image2 = imageTb && imageTb !== primaryImage && imageTb !== image1 ? imageTb : "";

        map.set(key, {
          jobno: item.jobno_oms ?? "",
          print_type: item.buyer1 ?? "",
          print_description: item.merch ?? "",
          // ✅ keep whatever type comes (number/string), we'll render via showVal()
          print_colours: item.production_type_inside_outside,
          inside_outside_print_emb: item.reference ?? "",
          individual_part_print_emb: item.director_sample_order ?? "",
          // print_screen_1: item.print_screen_1 ?? "",
          // print_screen_2: item.print_screen_2 ?? "",
          // print_screen_3: item.print_screen_3 ?? "",
          // top_bottom: item.top_bottom ?? "",
          // unit: item.sv ?? "",
          image: primaryImage,
          // image1,
          // image2,
          rows: [] as OrderData[]
        });
      }
      map.get(key).rows.push(item);
    });

    return Array.from(map.values());
  };

  const detailTemplate = (props: OrderData) => {
    const ord = Array.isArray(props.jobno_oms) ? props.jobno_oms : [];
    const printGroups = groupByPrint(ord);

    const getUniqueColours = (rows: any[] = []) => {
      const seen = new Set<string>();

      return rows
        .filter((r: any) => {
          const key = `${r?.colour || ""}-${r?.rgb || ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((r: any) => ({
          colour: r?.colour || "",
          rgb: r?.rgb || "",
        }));
    };

    return (
      <div style={{ padding: "20px" }}>
        {printGroups.map((grp: any, idx: number) => {
          const colours = getUniqueColours(Array.isArray(grp?.rows) ? grp.rows : []);

          const imageCount =
            (grp.image ? 1 : 0) + (grp.image1 ? 1 : 0) + (grp.image2 ? 1 : 0);
          const imageBlockWidth = imageCount > 0 ? imageCount * 160 + (imageCount - 1) * 20 : 160;

          return (
            <div
              key={idx}
              style={{ marginBottom: "30px", borderBottom: "2px solid #003399", paddingBottom: "20px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `${imageBlockWidth}px 1fr auto`,
                  columnGap: "30px",
                  alignItems: "start",
                  width: "100%"
                }}
              >
                {/* IMAGES BLOCK */}
                <div style={{ display: "flex", gap: "20px", width: `${imageBlockWidth}px`, flexShrink: 0 }}>
                  {grp.image ? (
                    <img
                      src={grp.image}
                      alt="print"
                      style={{ width: "160px", border: "1px solid #ccc", padding: "6px", display: "block", objectFit: "contain", background: "#fff" }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}

                </div>

                /* DATA unBLOCK */
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.2fr 0.8fr",
                    columnGap: "20px",
                    rowGap: "12px",
                    width: "100%",
                    fontSize: "14px",
                    minWidth: 0,
                    wordBreak: "break-word"
                  }}
                >
                  {/* Row 1 */}
                  <div><b>Job No:</b> {showVal(grp.jobno_oms)}</div>
                  <div><b>Print Type:</b> {showVal(grp.merch)}</div>
                  <div />

                  {/* Row 2 */}
                  <div><b>Print Description:</b> {showVal(grp.buyer1)}</div>
                  <div><b>Print Colours:</b> {showVal(grp.production_type_inside_outside)}</div>  {/* ✅ number 4 will show */}
                  <div />

                  {/* Row 3 */}
                  <div><b>Inside / Outside:</b> {showVal(grp.inside_outside_print_emb)}</div>
                  <div><b>Individual Part:</b> {showVal(grp.individual_part_print_emb)}</div>
                  <div />

                  {/* Row 4 */}
                  <div><b>Top / Bottom:</b> {showVal(grp.top_bottom)}</div>
                  <div>
                    <b>Unit:</b>
                    {String(grp.unit || "")
                      .split(",")
                      .filter(Boolean)
                      .map((u: string, i: number) => (
                        <div key={i}>{u.trim()}</div>
                      ))}
                  </div>
                  <div />

                  {/* Row 5: Screen info */}
                  <div><b>Print Screen 1:</b> {showVal(grp.print_screen_1)}</div>
                  <div><b>Print Screen 2:</b> {showVal(grp.print_screen_2)}</div>
                  <div />

                  {/* Row 6 */}
                  <div><b>Print Screen 3:</b> {showVal(grp.print_screen_3)}</div>
                  <div />
                  <div />
                </div>

                {/* COLOURS BLOCK */}
                <div style={{ minWidth: 220 }}>
                  <b>Colours:</b>
                  {colours.map((c: any, i: number) => (
                    <div
                      key={`${c.colour}_${c.rgb}_${i}`}
                      style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", whiteSpace: "nowrap" }}
                    >
                      <div
                        style={{ width: "20px", height: "20px", background: c.rgb || "#fff", border: "1px solid #000", flex: "0 0 auto" }}
                      />
                      <span>{showVal(c.colour || c.rgb)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  <TooltipComponent
    target=".image-tooltip-target"
    cssClass="custom-tooltip-size"
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
  </TooltipComponent>

  const tooltipBeforeRender = (args: any) => {

    const isRowCell = args.target.closest('.e-rowcell');
    if (isRowCell) {
      const cell = args.target.closest('.e-rowcell');

      if (!cell) return;
      const column = gridRef.current?.getColumnByIndex(
        parseInt(cell.getAttribute('aria-colindex')) - 1
      );

      const fieldName = column?.field;
      const allowedColumn = "mainimagepath";

      if (fieldName !== allowedColumn) {
        args.cancel = true;
        return;
      }

      const img = args.target.querySelector('img') || args.target;
      if (img) {
        // Get row information
        const rowInfo = gridRef.current?.getRowInfo(args.target.closest('td'));
        const rowData: OrderData = rowInfo?.rowData as OrderData;

        if (rowData) {
          // Get image source
          const imgSrc = img.src;
          const printimg = rowData.Print
          const Emp = rowData.Emb
          const others1 = rowData.Others1
          const others2 = rowData.Others2
          const others7 = rowData.Others7

          // Build order information HTML
          const orderInfo = `
              <div style="padding: 12px; line-height: 1; font-size: 13px; display: flex; flex-wrap: wrap; gap: 2px">
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

          const images = [
            { label: "Print Image", src: printimg },
            { label: "Emp Image", src: Emp },
            { label: "PLT-7 Image", src: others1 },
            { label: "AOP-9 Image", src: others2 },
            { label: "Fus-14 Image", src: others7 },
          ];

          // remove empty images
          const validImages = images.filter(img => img.src);

          const chunkSize = 3;
          const columns = [];
          for (let i = 0; i < validImages.length; i += chunkSize) {
            columns.push(validImages.slice(i, i + chunkSize));
          }

          // generate html
          const imagesHtml = columns.map(col => {
            const count = col.length;
            let height = "100%";
            if (count === 2) height = "46%";
            else if (count >= 3) height = "29.33%";

            return `
                <div style="display:flex; flex-direction:column; height:270px; gap: 20px;">
                  ${col.map(img => `
                    <div style="height:${height}; text-align:center;">
                      <b>${img.label}</b><br/>
                      <img 
                        src="${img.src}" 
                        style="max-height:100%; width:auto; object-fit:contain;"
                      />
                    </div>
                  `).join('')}
                </div>
              `;
          }).join('');

          // Create tooltip content with order info on left and image on right
          const tooltipContent = `
            <div style="flex: 1; min-width: 200px; max-width: 450px; border-bottom: 1px solid #e0e0e0;">
              ${orderInfo}
            </div>
            <div style="display: flex; gap: 6px; max-width: 450px;">

              <!-- LEFT BIG IMAGE -->
              <div style="padding: 12px;">
                <b>Order Image</b><br />
                <img 
                  src="${imgSrc}" 
                  style="max-width: 250px; max-height: 270px; object-fit: contain;" 
                />
              </div>

              <!-- RIGHT DYNAMIC GRID -->
              <div style="display: flex; gap: 10px; padding: 12px;">
                ${imagesHtml}
              </div>
            </div>
            `;

          (tooltipRef.current as TooltipComponent).content = tooltipContent;
          (tooltipRef.current as TooltipComponent).width = '450px';
          (tooltipRef.current as TooltipComponent).height = 'auto';
        }
      }
      else if (img) {
        // For header cells, show simple image
        let imgElem: any = args.target.innerHTML;
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
    }
  }

  const load = useCallback((args:any) => {
    args.enableSeamlessScrolling = true;
    const gridContainer = document.querySelector('.grid-container') as HTMLElement | null;
    if (!gridContainer) return;
    const rect = gridContainer.getBoundingClientRect();
    const topPosition = rect?.top ?? 0;
    const calculatedHeight = window.innerHeight - topPosition - 10; // 10px buffer
    gridContainer.style.height = `${calculatedHeight}px`;
  },[])

  const dateEditor = (props: any) => {
    return (
      <div>
        <DatePickerComponent
          value={props.finaldelvdate1}
          change={(args) => props.setCellValue(props.column.field, args.value)}
        />
      </div>
    );
  };

  const dateRangeFilterTemplate = {
    create: () => {
      const elem = document.createElement('input');
      elem.setAttribute('id', 'daterange');
      return elem;
    },
    write: (args: any) => {
      const dateRangePicker = new DateRangePicker({
        placeholder: 'Select date range',
        format: 'dd/MM/yyyy',
        change: (e: any) => {
          console.log('change', e)
          if (e.startDate && e.endDate && gridRef.current) {
            // Store endDate in ref for use in actionBegin
            endDateRef.current = e.endDate;
            // Set custom filter flag BEFORE calling filterByColumn
            customFilterRef.current = true;
            gridRef.current.clearFiltering(['finaldelvdate1']);
            // Apply date range filter using predicates
            gridRef.current.filterByColumn('finaldelvdate1', 'greaterThanOrEqual', e.startDate, 'and');
          } else if (!e.startDate && !e.endDate && gridRef.current) {
            // Clear filter if dates are cleared
            customFilterRef.current = false;
            endDateRef.current = null;
            gridRef.current.clearFiltering(['finaldelvdate1']);
          }
        }
      });
      dateRangePicker.appendTo('#daterange');
    }
  };

  const multiSelectFilterTemplate = {
    create: (args: any) => {
      console.log(args)
      const elem = document.createElement('input');
      elem.setAttribute('id', 'directorMultiSelect');
      return elem;
    },
    read: (args: any) => {

    },
    write: (args: any) => {

      let multiSelectData: any = DataUtil.distinct(dataSource, 'director_sample_order')
      const multiSelectObj = new MultiSelect({
        dataSource: multiSelectData,
        allowFiltering: false,
        fields: { text: 'director_sample_order', value: 'director_sample_order' },
        // set the type of mode for checkbox to visualized the checkbox added in li element.
        mode: 'CheckBox',
        change: (e: any) => {
          gridRef.current?.clearFiltering(['director_sample_order']);

          gridRef.current?.filterByColumn('director_sample_order', 'equal', e.value)
        }


      });
      multiSelectObj.appendTo('#directorMultiSelect');
    }
  };

  const beforeOpen = (args: any) => {
    // Adjust tooltip dimensions based on content type
    const hasOrderInfo = args.element.innerHTML.includes('Job No:');

    if (hasOrderInfo) {
      args.element.style.maxWidth = '750px';
      args.element.style.width = 'auto';
    }
  };
  const editSettings = useMemo(() =>
  (
    {
      allowDeleting: true,
      allowEditing: true,
      allowEditOnDblClick: false,
      allowAdding: true,
      mode: "Dialog",
      template: dialogTemplate
    }
  ),[])

  const sortSettings = useMemo(() => ({
    columns: [
      { field: 'Fdt', direction: 'Ascending' as any }
    ]
  }), []);
  const pageSettings=useMemo(()=>(
    { pageSize: 20 }
  ),[])
  // Memoize the grid component to prevent unnecessary re-renders
  const memoizedGridComponent = useMemo(() => (
    <><div><TooltipComponent ref={tooltipRef} target=".e-rowcell" width="130px" height="130px" opensOn={!Browser.isDevice ? "Hover" :"Custom"} beforeRender={tooltipBeforeRender} beforeOpen={beforeOpen}>
      <div className='grid-container e-bigger'
        style={{
          overflow: 'hidden',
          minHeight: 0
        }}>
        <GridComponent

          id="default-aggregate-grid"
          ref={gridRef}
          dataSource={dataSource}
          dataBound={dataBound}
          pageSettings={pageSettings}
          height="100%"
          rowHeight={100}
          enableVirtualization={true}
          allowSorting={true}
          allowFiltering={false}
          resizeSettings={{ mode: 'Auto' }}
          allowMultiSorting={true}
          filterSettings={{ showFilterBarOperator: true, mode: 'Immediate' }}
          statelessTemplates={['directiveTemplates']}
          allowGrouping={true}
          groupSettings={{ showGroupedColumn: true, showDropArea: !Browser.isDevice }}
          showColumnChooser={true}
          enableAdaptiveUI={true}
          adaptiveUIMode={'Mobile'}
          allowReordering={true}
          allowResizing={true}
          allowPdfExport={true}
          allowTextWrap={true}
          textWrapSettings={{ wrapMode: 'Both' }}
          autoFit={true}
          sortSettings={{ columns: [{ field: 'director_sample_order', direction: 'Descending' }, { field: 'Fdt', direction: 'Ascending' }] }}
          gridLines="Both"
          searchSettings={searchSettings}
          toolbar={toolbarOptions}
          editSettings={editSettings}
          actionBegin={actionBegin}
          actionComplete={actionComplete}
          created={created}
          frozenColumns={2}
          enableVirtualMaskRow={false}
          toolbarClick={toolbarClick}
          load={load}
        >
          <ColumnsDirective>
            <ColumnDirective isPrimaryKey={true} field="jobno_oms" headerTemplate={orderSummaryHeaderTemplate} width="90" maxWidth="120" filter={{ operator: 'startsWith' }} template={orderSummaryTemplate} allowEditing={false} customAttributes={{ class: 'editCss' }} />
            <ColumnDirective field="mainimagepath" headerText="IMG" width="100" textAlign="Center" allowFiltering={false} filter={{ operator: 'startsWith' }} template={imageFieldTemplate('mainimagepath')} allowEditing={true} customAttributes={{ class: 'img' }} />
            <ColumnDirective field="Fdt" headerText="Fdt,Dir,ST,Uom,Ptype" width="110" maxWidth="150" headerTemplate={ordHeaderTemplate} template={deliveryInfoTemplate} filter={{ operator: 'startsWith' }} customAttributes={{ class: 'editCss' }} />
            <ColumnDirective field="n" headerText='n' minWidth={60} width="30" textAlign="Center" allowFiltering={false} template={rollnoTemplate} filter={{ operator: 'startsWith' }} allowEditing={false} />
            <ColumnDirective field="printing_R" headerText="1_PR,3_Em,8_Fa_9_Dy,7_Cus" headerTemplate= {udfheaderTemplate} width="150" maxWidth="150" type="string" template={udf} filter={{ operator: 'startsWith' }} customAttributes={{ class: 'editCss' }} />
            <ColumnDirective field="ITS_R" headerText="31_IT,36_Cu,45_Or,46_Em,141-Sa" headerTemplate= {udf2HeaderTemplate} width="150" maxWidth="150" type="string" template={udf2} filter={{ operator: 'startsWith' }} customAttributes={{ class: 'editCss' }} />
            <ColumnDirective field="Week_R" headerText="Mo,Wk,Ye,Uo" width="150" maxWidth="150" headerTemplate= {udf4HeaderTemplate} template={udf4} customAttributes={{ class: 'editCss' }} />
            <ColumnDirective field="FabdyIN" headerText="FabdyIN"  width="150" maxWidth="150" type="string" template={udf11} filter={{ operator: 'startsWith' }} customAttributes={{ class: 'editCss' }} />
            <ColumnDirective field="Print" headerText="Print" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Print')} allowEditing={false} customAttributes={{ class: 'img' }} />
            <ColumnDirective field="Emb" headerText="Emb" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Emb')} allowEditing={true} customAttributes={{ class: 'img' }} />
            <ColumnDirective field="Others1" headerText="imgs1" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Others1')} allowEditing={false} customAttributes={{ class: 'img' }} />
            <ColumnDirective field="Others2" headerText="AOP-9 img" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Others2')} allowEditing={false} customAttributes={{ class: 'img' }} />
            <ColumnDirective field="quantity" headerText="QTY" width="110" textAlign="Center" template={genericHighlighter('quantity')} />
            <ColumnDirective field="director_sample_order" headerText="dir" width="75" maxWidth="100" filter={{ operator: 'startsWith' }} customAttributes={{ class: 'editCss' }} />
          </ColumnsDirective>
          <AggregatesDirective>
            <AggregateDirective>
              <AggregateColumnsDirective>
                <AggregateColumnDirective field='quantity' type='Sum' footerTemplate={footerSum} format='N'> </AggregateColumnDirective>
              </AggregateColumnsDirective>
            </AggregateDirective>
          </AggregatesDirective>
          <Inject services={[Sort, Edit, Filter, Group, Reorder, Search, VirtualScroll, DetailRow, Freeze, Resize, ContextMenu, Page, Toolbar, ColumnChooser, ColumnMenu, Aggregate, PdfExport]} />
        </GridComponent></div>
    </TooltipComponent></div></>
  ), [dataSource]);

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
          padding: 0px 10px;
          background-color: #0ff180;
          flex-shrink: 0;
          margin-top:0px;
          flex-wrap: wrap; 
          }
          
          .header-title {
            font-size: 2px;
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
            padding: 0px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            }

            .count-display1 {
            background: #e9ecef;
            color: #007bff;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            display: none
            }

            @media (max-width: 1023px){
            .dashboard-header {
              margin-top: 40px !important
            }
            }
            
            /* --- Mobile Layout --- */
            @media (max-width: 768px) {
              .dashboard-header {
                flex-direction: column;
                align-items: stretch;
                gap: 1px;             
                margin-top: 60px
                }

                .breadcromp{
                width:80%;
                font-size:50px;
                display:none
                }
                 
        
             .count-display {
            background: #e9ecef;
            color: #007bff;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            white-space: nowrap;
            display:none
            }
          
            .count-display1 {
            background: #e9ecef;
            color: #007bff;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            white-space: nowrap;
            display:block;
            width: 60px;
            float: right;
            }
            .count{
              margin-top: -45px;
              margin-left: 276px
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
            <a className="flex items-center text-xs md:text-xs text-xs text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/dashboard">
              <svg className="shrink-0 me-3 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Dashboard
            </a>
            <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </li>
          <li className="inline-flex items-center">
            <a className="flex items-center text-xs md:text-xs text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/sy-order">
              <svg className="shrink-0 me-3 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1" /><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" /></svg>
              Order
              <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </li>
          <li className="inline-flex items-center text-xs md:text-xs text-foreground truncate" aria-current="page">
            Order Table
          </li>
        </ol>


        <div style={{ padding: '0px 5px', marginLeft: '5px', display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
            <TextBoxComponent
              ref={settingNameRef}
              placeholder="setting name"
              style={{ width: '70px' }}
            />
          </div>

          <ButtonComponent
            onClick={saveSetting}
            cssClass="e-primary"
            style={{ padding: '3px 6px', fontSize: '13px' }}
          >
            💾
          </ButtonComponent>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* <DropDownListComponent
              ref={dropdownRef}
              id="settings-dropdown"
              dataSource={savedSettings
                .filter(
                  s =>
                    s.user?.toLowerCase() === username?.toLowerCase() // normalize for comparison
                )
                .map(s => ({ text: s.name, value: s.id }))}
              fields={{ text: 'text', value: 'value' }}
              placeholder="Select setting"
              style={{ width: '70px' }}
              change={() => {setSelectedSetting(dropdownRef.current?.value as string);applySetting()}}
            />
              change={() => setSelectedSetting(dropdownRef.current?.value as string)}
            /> */}

            <DropDownListComponent
              ref={dropdownRef}
              id="settings-dropdown"
              dataSource={savedSettings
                .filter(s => s.user?.toLowerCase() === username?.toLowerCase())
                .map(s => ({ text: s.name, value: s.id }))}
              fields={{ text: 'text', value: 'value' }}
              placeholder="Select setting"
              style={{ width: '70px' }}
              value={savedSettings.find(s => s.name === selectedSetting)?.id || null}
              change={() => { setSelectedSetting(dropdownRef.current?.value as string); applySetting() }}
            />
          </div>

          {/* <ButtonComponent
              onClick={applySetting}
              cssClass="e-outline"
              style={{ padding: '3px 6px', fontSize: '15px' }}
            >
            ✔
            </ButtonComponent> */}

          <ButtonComponent
            onClick={deleteSetting}
            cssClass="e-outline e-danger"
            style={{ padding: '3px 6px', fontSize: '15px' }}
          >
            🗑
          </ButtonComponent>
          <div className='count mr-1'>

            <div className="count-display1">
              {showingCount} / {totalCount}
            </div>
          </div>
        </div>
      </div>

      {/* Query Builder Dialog */}
      <DialogComponent
        ref={dialogRef}
        header="Query Builder"
        visible={showQueryBuilderDialog}
        showCloseIcon={true}
        width="80%"
        height="auto"
        isModal={true}
        target="body"
        close={() => setShowQueryBuilderDialog(false)}
        buttons={[
          {
            click: applyQueryToGrid,
            buttonModel: {
              content: 'OK',
              cssClass: 'e-primary',
              isPrimary: true
            }
          },
          {
            click: () => setShowQueryBuilderDialog(false),
            buttonModel: {
              content: 'Cancel',
              cssClass: 'e-flat'
            }
          }
        ]}
      >
        <div style={{ padding: '20px' }}>
          <QueryBuilderComponent
            ref={qryBldrObj}
            columns={queryBuilderColumns}
            ruleChange={updateResult}
            dataSource={dataSource}
            width="100%"
          />
        </div>
      </DialogComponent>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'auto' }}>
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

export default HeroFashionGrid131;