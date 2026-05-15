import { useEffect, useState, useRef, } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Toolbar,
  Filter,
  Group,
  Page,
  Sort,
  Search,
  FilterSettingsModel,
  Edit,
  toolbarClick
} from "@syncfusion/ej2-react-grids";
import { DataManager, WebApiAdaptor, Query } from "@syncfusion/ej2-data";
import { ClickEventArgs } from "@syncfusion/ej2-react-navigations/src";

interface OrderRow {
  jobno_oms: string;
  styleid: number | string;
  company_name: string;
  pono: string;
  reference: string;
  mainimagepath: string;
  shipmentcompleted: boolean;
  podate?: Date | null;
  final_delivery_date?: Date | null;
  ourdeldate?: Date | null;
  vessel_dt?: Date | null;
  ddays?: number;
  fdays?: number;
  insdays?: number;
  hasImage?: boolean;
  validationStatus?: "OK" | "Pending";
  validationNotes?: string;
}
// Fallback data if API fails
const sampleDataRaw = [
  {
    jobno_oms_id: "H12778A",
    styleid: "9198",
    company_name: "HERO FASHION",
    pono: "6987",
    reference: "APPROVAL PENDING",
    mainimagepath: "/placeholder.png",
    final_delivery_date: "1995-08-15",
    ourdeldate: "2095-08-10",
    podate: "2024-10-03",
    vessel_dt: "2095-08-10",
    shipmentcompleted: false,
    ddays: -450,
    fdays: 25433,
    insdays: 0
  }
];

const toDate = (v: any): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const toNumber = (v: any): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

const normalizeRows = (rows: any[]): OrderRow[] =>
  rows.map((r: any) => {
    const job = r.jobno_oms ?? r.jobno_oms_id ?? "";
    const styleRaw = r.styleid ?? r.style_id ?? "";
    const styleNum = toNumber(styleRaw);
    const company = r.company_name ?? r.company ?? "";
    const po = r.pono ?? r.poNo ?? "";
    const ref = r.reference ?? r.ref ?? "";
    const img = r.mainimagepath ?? r.image ?? "/placeholder.png";

    const statusBool =
      typeof r.shipmentcompleted === "boolean"
        ? r.shipmentcompleted
        : String(r.status ?? "").toLowerCase() === "completed";

    const errors: string[] = [];
    if (!job) errors.push("Job No missing");
    if (!company) errors.push("Company missing");
    if (styleNum === null) errors.push("Style ID invalid");

    const isValid = errors.length === 0;

    return {
      jobno_oms: job,
      styleid: styleNum ?? styleRaw,
      company_name: company,
      pono: po,
      reference: ref,
      mainimagepath: img,
      shipmentcompleted: statusBool,
      podate: toDate(r.podate),
      final_delivery_date: toDate(r.final_delivery_date),
      ourdeldate: toDate(r.ourdeldate),
      vessel_dt: toDate(r.vessel_dt),
      ddays: toNumber(r.ddays) ?? undefined,
      fdays: toNumber(r.fdays) ?? undefined,
      insdays: toNumber(r.insdays) ?? undefined,
      hasImage: !!img && img !== "/placeholder.png",
      validationStatus: isValid ? "OK" : "Pending",
      validationNotes: errors.join(", ")
    };
  });

function Sample() {
  const [gridData, setGridData] = useState<OrderRow[]>([]);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Row count states
  const [rowCount, setRowCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const gridRef = useRef<GridComponent>(null);
  const updateRowCounts = () => {
    const g = gridRef.current as any;
    if (!g) return;

    const currentView =
      typeof g.getCurrentViewRecords === "function"
        ? g.getCurrentViewRecords()
        : g.currentViewData || [];

    const filtered =
      typeof g.getFilteredRecords === "function"
        ? g.getFilteredRecords()
        : currentView;

    const ds = g.dataSource || gridData;
    const total = Array.isArray(ds) ? ds.length : 0;

    setRowCount(filtered.length);
    setTotalCount(total);
  };

  const fetchData = () => {
    new DataManager({
      url: "https://app.herofashion.com/order_panda/",
      adaptor: new WebApiAdaptor()
    })
      .executeQuery(new Query())
      .then((e: any) => {
        const incoming = Array.isArray(e.result) ? e.result : sampleDataRaw;
        const normalized = normalizeRows(incoming);
        setGridData(normalized);
        setApiAvailable(Array.isArray(e.result));

        if (gridRef.current) {
          gridRef.current.dataSource = normalized;
          gridRef.current.refresh();
        }
        updateRowCounts();
      })
      .catch(() => {
        const normalized = normalizeRows(sampleDataRaw);
        setGridData(normalized);
        setApiAvailable(false);
        if (gridRef.current) {
          gridRef.current.dataSource = normalized;
          gridRef.current.refresh();
        }
        updateRowCounts();
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateRowCounts();
  }, [gridData]);

  const imageTemplate = (props: OrderRow) => {
    const [imgSrc, setImgSrc] = useState(props.mainimagepath);
    
    return (
      <img
        src={imgSrc}
        width={50}
        height={50}
        style={{ display: 'block' }}
        onError={(e: any) => {
          e.target.onerror = null; 
          setImgSrc('/placeholder.png');
        }}
        alt=""
      />
    );
  };

  const statusTemplate = (props: OrderRow) => (
    <span
      className={`e-badge ${
        props.shipmentcompleted ? "e-badge-success" : "e-badge-danger"
      }`}
    >
      {props.shipmentcompleted ? "Completed" : "Pending"}
    </span>
  );

  const RowCountBadge = () => (
    <div
      className="row-count-badge"
      aria-label={`Rows: ${rowCount} of ${totalCount}`}
      title={`Rows: ${rowCount} / ${totalCount}`}
    >
      Rows:&nbsp;<span className="row-count-number">{rowCount}</span>
      <span className="row-count-sep"> / </span>
      <span className="row-count-total">{totalCount}</span>
    </div>
  );

  const merchTemplate=(props:OrderRow) =>{
    return (
        <span>
           { props.company_name}-{props.pono}
        </span>
    )
  }

  const toolbarOptions: any[] = [
    "Search",
    {
      id: "row-count",
      align: "Right",
      template: RowCountBadge
    },
      'Add',
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
      'ColumnChooser',
  ];

  const toolbarClick =(args: ClickEventArgs) =>{
    console.log(args)
    if (args.item.id === "clearsorting_icon"){
      gridRef.current?.clearSorting()
    }
  }  
  const filterSettings: FilterSettingsModel = { type: "Excel" };
  const onDataBound = () => updateRowCounts();
  const onActionComplete = () => updateRowCounts();

  return (
    <div id="assistive-grid" style={{ padding: "12px" }}>

      {!apiAvailable && (
        <div className="api-banner">
          API unreachable — using local data
          <button className="api-retry" onClick={fetchData}>Retry</button>
        </div>
      )}

      <GridComponent
        ref={gridRef}
        dataSource={gridData}
        height={650}
        allowPaging={true}
        allowFiltering={true}
        allowTextWrap={true}
        allowReordering={true}
        allowResizing={true}
        allowSorting={true}
        showColumnChooser={true}      
        allowGrouping={true}
            editSettings={{
                    allowDeleting: true,
                    allowEditing: true,
                    allowEditOnDblClick:false,
                    allowAdding: true,
                }}
        filterSettings={filterSettings}
        toolbar={toolbarOptions}
        toolbarClick={toolbarClick}
        dataBound={onDataBound}
        actionComplete={onActionComplete}
      >
        <ColumnsDirective>
          <ColumnDirective field="jobno_oms" headerText="Job No" width="150" />
          <ColumnDirective headerText="Image" template={imageTemplate} width="100" textAlign="Center" />
          <ColumnDirective field="styleid" headerText="Style ID" width="140" type="number" />
          <ColumnDirective field="company_name" headerText="Company" width="200" />
          <ColumnDirective field="pono" headerText="PO No" width="120" />
          <ColumnDirective headerText="Company name and pono" template={merchTemplate} width="200" />
          <ColumnDirective field="reference" headerText="Reference" width="250" />
          <ColumnDirective field="validationStatus" headerText="Data Quality" width="130" />
          {/* <ColumnDirective field="validationNotes" headerText="Issues" width="250" /> */}
          <ColumnDirective field="podate" headerText="PO Date" freeze="Right" width="140" type="date" format="yMd" />
          <ColumnDirective
            field="final_delivery_date"
            headerText="Final Delivery"
            width="150"
            type="date"
            format="yMd"
          />

          {/* Status */}
          <ColumnDirective
            field="shipmentcompleted"
            headerText="Status"
            template={statusTemplate}
            width="120"
          />
        </ColumnsDirective>

        <Inject services={[Toolbar, Filter, Group, Page, Search, Edit, Sort]} />
      </GridComponent>
    </div>
  );
}

export default Sample;