import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter,
  Toolbar,
  ExcelExport,
  PdfExport,
  Resize,
  ColumnMenu,
  VirtualScroll
} from '@syncfusion/ej2-react-grids';
// DataManager, Query, Predicate no longer needed for filterByColumn approach
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { enableRipple } from '@syncfusion/ej2-base';
import { z } from 'zod';

// Enable ripple effect globally
enableRipple(true);

// Data Schema Validation
const DataItemSchema = z.object({
  jobno: z.string().or(z.number()),
  dt: z.string().nullable().optional(),
  planno: z.string().or(z.number()),
  sample_descr: z.string().optional(),
  per: z.string().or(z.number()).optional(),
  topbottom_des: z.string().optional(),
  lot: z.string().or(z.number()),
  rls: z.string().or(z.number()).optional(),
  fdeldt: z.string().nullable().optional(),
  plan_kg: z.string().or(z.number()).optional(),
  mtr: z.string().or(z.number()).optional(),
  cutdt: z.string().nullable().optional(),
  tply: z.string().or(z.number()).optional(),
  aply: z.string().or(z.number()).nullable().optional(),
  ratio_stick_dt: z.string().nullable().optional(),
  bitcheck_dt: z.string().nullable().optional(),
  mas_bud_dt: z.string().nullable().optional(),
  unitdel_dt: z.string().nullable().optional()
});

type DataItem = z.infer<typeof DataItemSchema>;

// Row Status Type
type RowStatus = 'fabric_pending' | 'without_plan' | 'normal';

const CuttingDeliveryGrid: React.FC = () => {
  const gridRef = useRef<GridComponent>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter States
  const [filterJobNo, setFilterJobNo] = useState('');
  const [filterPlanNo, setFilterPlanNo] = useState('');
  const [filterLot, setFilterLot] = useState('');
  const [filterTopBottom, setFilterTopBottom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dialog States
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedPlanNo, setSelectedPlanNo] = useState<string | number>('');

  useEffect(() => {
    // Check mobile view
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch("https://hfapi.herofashion.com/reports/cutdel/")
      .then((res) => res.json())
      .then((rawData) => {
        // Validate data with Zod
        const validatedData = rawData.map((item: unknown) => {
          try {
            return DataItemSchema.parse(item);
          } catch {
            console.warn('Invalid data item:', item);
            return null;
          }
        }).filter(Boolean) as DataItem[];
        
        setData(validatedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Helper: Format Date
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr || dateStr === 'null' || dateStr === '-') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Logic: Status Determination
  const getRowStatus = (item: DataItem): RowStatus => {
    const hasUnitDel = item.unitdel_dt && item.unitdel_dt !== 'null';
    const hasFileDate = item.fdeldt && item.fdeldt !== 'null';
    const hasAPly = item.aply && item.aply !== 'null' && item.aply !== 0 && item.aply !== '0';

    if (!hasFileDate && !hasAPly && !hasUnitDel) return 'fabric_pending';
    if (!hasFileDate && hasAPly) return 'without_plan';
    return 'normal';
  };

  // Get unique values for dropdowns (non-cascading)
  const getUniqueValues = (field: keyof DataItem, label: string) => {
    const values = [...new Set(data.map(item => {
      const value = item[field];
      return value ? String(value) : null;
    }))].filter((v): v is string => v !== null && v !== undefined);
    
    const sortedValues = values.sort();
    
    return [
      { value: '', text: label },
      ...sortedValues.map(v => ({ value: v, text: v }))
    ];
  };

  // Apply filter to grid using filterByColumn
  const applyGridFilter = (fieldName: string, value: string) => {
    if (gridRef.current) {
      if (value) {
        // Convert value to number if it's a numeric field and the value is numeric
        let filterValue: string | number = value;
        const numericFields = ['jobno', 'planno', 'lot', 'per', 'plan_kg', 'mtr', 'tply', 'aply', 'rls'];
        
        if (numericFields.includes(fieldName) && !isNaN(Number(value))) {
          filterValue = Number(value);
        }
        
        gridRef.current.filterByColumn(fieldName, 'equal', filterValue);
      } else {
        gridRef.current.clearFiltering([fieldName]);
      }
    }
  };



  // Status Badge Template
  const statusBadgeTemplate = (props: DataItem) => {
    const status = getRowStatus(props);
    if (status === 'fabric_pending') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200 whitespace-nowrap">
          FABRIC DELIVERY PENDING
        </span>
      );
    }
    if (status === 'without_plan') {
      return (
        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded border border-amber-200 whitespace-nowrap">
          WITHOUT PLAN
        </span>
      );
    }
    return null;
  };

  // Date Field Template
  const dateTemplate = (field: keyof DataItem) => (props: DataItem) => {
    const status = getRowStatus(props);
    const isAffectedField = field === 'fdeldt' || field === 'aply' || field === 'unitdel_dt';

    if (status === 'fabric_pending' && isAffectedField) {
      return statusBadgeTemplate(props);
    }
    if (status === 'without_plan' && field === 'fdeldt') {
      return statusBadgeTemplate(props);
    }

    const value = props[field];
    const dateFields = ['fdeldt', 'dt', 'cutdt', 'ratio_stick_dt', 'bitcheck_dt', 'mas_bud_dt', 'unitdel_dt'];
    return <span>{dateFields.includes(field) ? formatDate(value as string) : (value || '-')}</span>;
  };

  // Row Data Bound - Custom styling based on status
  const rowDataBound = (args: any) => {
    const status = getRowStatus(args.data);
    if (status === 'fabric_pending') {
      args.row?.classList.add('bg-red-50');
    } else if (status === 'without_plan') {
      args.row?.classList.add('bg-amber-50');
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setFilterJobNo('');
    setFilterPlanNo('');
    setFilterLot('');
    setFilterTopBottom('');
    setFilterStatus('');
    // Clear all grid filters
    if (gridRef.current) {
      gridRef.current.clearFiltering();
    }
  };

  // Handle Plan No Click
  const handlePlanNoClick = (planNo: string | number) => {
    setSelectedPlanNo(planNo);
    setDialogVisible(true);
  };

  // Close Dialog
  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedPlanNo('');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
   

      <main className="w-full mx-auto p-4 lg:p-6">
        {/* Filter Section */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-2 mb-5 text-slate-700">
            <span className="e-icons e-filter" style={{ fontSize: '18px', color: '#4f46e5' }}></span>
            <h2 className="font-bold">Advanced Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Job Number Filter */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                Job Number
              </label>
              <DropDownListComponent
                dataSource={getUniqueValues('jobno', 'All Jobs')}
                fields={{ text: 'text', value: 'value' }}
                value={filterJobNo}
                change={(e) => {
                  const newValue = e.value || '';
                  setFilterJobNo(newValue);
                  applyGridFilter('jobno', newValue);
                }}
                placeholder="All Jobs"
                cssClass="w-full"
                popupHeight="250px"
                allowFiltering={true}
              />
            </div>

            {/* Plan No Filter */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                Plan No
              </label>
              <DropDownListComponent
                dataSource={getUniqueValues('planno', 'All Plans')}
                fields={{ text: 'text', value: 'value' }}
                value={filterPlanNo}
                change={(e) => {
                  const newValue = e.value || '';
                  setFilterPlanNo(newValue);
                  applyGridFilter('planno', newValue);
                }}
                placeholder="All Plans"
                cssClass="w-full"
                popupHeight="250px"
                allowFiltering={true}
              />
            </div>

            {/* Lot Filter */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                Lot
              </label>
              <DropDownListComponent
                dataSource={getUniqueValues('lot', 'All Lots')}
                fields={{ text: 'text', value: 'value' }}
                value={filterLot}
                change={(e) => {
                  const newValue = e.value || '';
                  setFilterLot(newValue);
                  applyGridFilter('lot', newValue);
                }}
                placeholder="All Lots"
                cssClass="w-full"
                popupHeight="250px"
                allowFiltering={true}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                Category
              </label>
              <DropDownListComponent
                dataSource={getUniqueValues('topbottom_des', 'All Categories')}
                fields={{ text: 'text', value: 'value' }}
                value={filterTopBottom}
                change={(e) => {
                  const newValue = e.value || '';
                  setFilterTopBottom(newValue);
                  applyGridFilter('topbottom_des', newValue);
                }}
                placeholder="All Categories"
                cssClass="w-full"
                popupHeight="250px"
                allowFiltering={true}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 ml-1">
                Status
              </label>
              <DropDownListComponent
                dataSource={[
                  { value: '', text: 'All Statuses' },
                  { value: 'normal', text: 'Normal / Complete' },
                  { value: 'without_plan', text: 'Without Plan' },
                  { value: 'fabric_pending', text: 'Fabric Pending' }
                ]}
                fields={{ text: 'text', value: 'value' }}
                value={filterStatus}
                change={(e) => setFilterStatus(e.value || '')}
                placeholder="All Statuses"
                cssClass="w-full"
                popupHeight="200px"
                allowFiltering={true}
              />
            </div>
          </div>

          {(filterJobNo || filterPlanNo || filterLot || filterTopBottom || filterStatus) && (
            <ButtonComponent
              cssClass="e-danger mt-6"
              iconCss="e-icons e-refresh"
              onClick={resetFilters}
            >
              Reset Filter View
            </ButtonComponent>
          )}
        </div>


       
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <GridComponent
              ref={gridRef}
              dataSource={data}
              gridLines='Both'
              allowPaging={true}
              
            //   enableVirtualization={true}
              allowSorting={true}
              allowFiltering={true}
              enableRowSpan={true}
              allowExcelExport={true}
              statelessTemplates={['directiveTemplates']}
              allowPdfExport={true}
              allowResizing={true}
              enableStickyHeader={true}
              pageSettings={{ pageSize: 20, pageSizes: [10, 20, 50, 100] }}
              filterSettings={{ type: 'Excel' }}
              rowDataBound={rowDataBound}
              height="calc(100vh - 420px)"
            >
              <ColumnsDirective>
        
                <ColumnDirective
                  field="jobno"
                  headerText="Job No"
                  width="120"
      
                  textAlign="Center"
                />
    
                <ColumnDirective
                  field="sample_descr"
                  headerText="Description"
                  width="200"
                  enableRowSpan={false}
                  textAlign="Left"
                />
                            <ColumnDirective
                  field="dt"
                  headerText="Date"
                  width="120"
                  textAlign="Center"
                  enableRowSpan={false}
                  template={dateTemplate('dt')}
                />
                <ColumnDirective
                  field="planno"
                  headerText="Plan No"
                  width="120"
                  textAlign="Center"
                  enableRowSpan={false}
                  template={(props: DataItem) => (
                    <span 
                      className="font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline"
                      onClick={() => handlePlanNoClick(props.planno)}
                    >
                      {props.planno}
                    </span>
                  )}
                />
                <ColumnDirective
                  field="per"
                  headerText="Per"
                  width="100"
                  enableRowSpan={false}
                  textAlign="Center"
                />
                <ColumnDirective
                  field="topbottom_des"
                  headerText="Category"
                  enableRowSpan={false}
                  width="150"
                  textAlign="Center"
                />
                <ColumnDirective
                  field="lot"
                  headerText="Lot"
                  width="100"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={(props: DataItem) => (
                    <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">{props.lot}</span>
                  )}
                />
                <ColumnDirective
                  field="rls"
                  headerText="Rls"
                  enableRowSpan={false}
                  width="100"
                  textAlign="Center"
                />
                <ColumnDirective
                  field="fdeldt"
                  headerText="File Date"
                  width="130"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={dateTemplate('fdeldt')}
                />
                <ColumnDirective
                  field="plan_kg"
                  headerText="Plan KG"
                  width="120"
                  enableRowSpan={false}
                  textAlign="Right"
                  template={(props: DataItem) => (
                    <span className="font-black text-slate-700">{props.plan_kg}</span>
                  )}
                />
                <ColumnDirective
                  field="mtr"
                  headerText="MTR"
                  width="100"
                  enableRowSpan={false}
                  textAlign="Right"
                />
                <ColumnDirective
                  field="cutdt"
                  headerText="Cut Del"
                  width="120"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={dateTemplate('cutdt')}
                />
                <ColumnDirective
                  field="tply"
                  headerText="T Ply"
                  width="100"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={(props: DataItem) => (
                    <span className="font-bold bg-slate-50 px-3 py-1 rounded">{props.tply}</span>
                  )}
                />
                <ColumnDirective
                  field="aply"
                  headerText="A Ply"
                  enableRowSpan={false}
                  width="130"
                  textAlign="Center"
                  template={dateTemplate('aply')}
                />
                <ColumnDirective
                  field="ratio_stick_dt"
                  headerText="Sticker Dt"
                  width="120"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={dateTemplate('ratio_stick_dt')}
                />
                <ColumnDirective
                  field="bitcheck_dt"
                  headerText="Bitcheck"
                  width="120"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={dateTemplate('bitcheck_dt')}
                />
                <ColumnDirective
                  field="mas_bud_dt"
                  headerText="Mas Bundle"
                  width="120"
                  enableRowSpan={false}
                  textAlign="Center"
                  template={dateTemplate('mas_bud_dt')}
                />
                <ColumnDirective
                  field="unitdel_dt"
                  headerText="Unit Del"
                  width="130"
                  enableRowSpan={false} 
                  textAlign="Center"
                  template={dateTemplate('unitdel_dt')}
                />
              </ColumnsDirective>
              <Inject services={[Page, VirtualScroll, Sort, Filter, Toolbar, ExcelExport, PdfExport, Resize, ColumnMenu]} />
            </GridComponent>
          </div>
        


      </main>

      {/* Dialog with Nested Grid */}
      <DialogComponent
        width="90%"
        height="80%"
        isModal={true}
        visible={dialogVisible}
        close={closeDialog}
        header={`Plan Details - ${selectedPlanNo}`}
        showCloseIcon={true}
        animationSettings={{ effect: 'FadeZoom' }}
      >
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-700">Plan Number: {selectedPlanNo}</h3>
            <p className="text-sm text-slate-500">Details grid will be displayed here</p>
          </div>
          
          {/* Nested Grid with Empty Data */}
          <GridComponent
            dataSource={[]}
            allowPaging={true}
            allowSorting={true}
            allowFiltering={true}
            pageSettings={{ pageSize: 10 }}
            filterSettings={{ type: 'Excel' }}
            height="400"
          >
            <ColumnsDirective>
              <ColumnDirective field="id" headerText="ID" width="100" textAlign="Center" />
              <ColumnDirective field="description" headerText="Description" width="200" textAlign="Left" />
              <ColumnDirective field="quantity" headerText="Quantity" width="120" textAlign="Right" />
              <ColumnDirective field="status" headerText="Status" width="120" textAlign="Center" />
              <ColumnDirective field="date" headerText="Date" width="150" textAlign="Center" />
            </ColumnsDirective>
            <Inject services={[Page, Sort, Filter]} />
          </GridComponent>
        </div>
      </DialogComponent>
    </div>
  );
};

export default CuttingDeliveryGrid;