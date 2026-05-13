import { ColumnDirective, ColumnsDirective, GridComponent, Inject, EditSettingsModel, ToolbarItems, FilterSettingsModel } from '@syncfusion/ej2-react-grids';
import { Filter, Sort, Edit, Toolbar, Page } from '@syncfusion/ej2-react-grids';
import { useEffect, useState, useRef } from 'react';
import { DataManager, WebApiAdaptor, Query } from '@syncfusion/ej2-data';

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


function Adaptive() {
 const [gridData, setGridData] = useState<OrderRow[]>([]);
 const [apiAvailable, setApiAvailable] = useState(true);

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

 const fetchData = () => {
    new DataManager({
      url: "https://app.herofashion.com/order_panda/",
      adaptor: new WebApiAdaptor()
    })
      .executeQuery(new Query())
      .then((e: any) => {
        const incoming = Array.isArray(e.result) ? e.result : gridData;
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
        const normalized = normalizeRows(gridData);
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
  

  const editSettings: EditSettingsModel = { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Dialog' };
  const toolbarOptions: ToolbarItems[] = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'Search'];
  const validationRule: Object = { required: true };
  const orderidRules: Object = { required: true, number: true };
  const filterOptions: FilterSettingsModel = { type: 'Excel' };
   const renderingMode = 'Vertical';
  let grid: GridComponent;
  const load = (): void => {
    grid = (document.getElementById('adaptivebrowser') as HTMLFormElement).ej2_instances[0];
    grid.adaptiveDlgTarget = document.getElementsByClassName('e-mobile-content')[0] as HTMLElement;
  }
   let menuFilter = { type: 'Menu' };
   let checkboxFilter = { type: 'CheckBox' };
      return (<div className="e-adaptive-demo e-bigger">
              <div className="e-mobile-layout">
                <div className="e-mobile-content">
                    <GridComponent id="adaptivebrowser" dataSource={gridData} height='100%' ref={gridRef} enableAdaptiveUI={true} allowFiltering={true} rowRenderingMode={renderingMode} allowSorting={true} allowPaging={true} filterSettings={filterOptions} toolbar={toolbarOptions} editSettings={editSettings} load={load}>
                      <ColumnsDirective>
                        <ColumnDirective field="jobno_oms" headerText="Job No" width="150" />
                            <ColumnDirective headerText="Image" template={imageTemplate} width="100" textAlign="Center" />
                            <ColumnDirective field="styleid" headerText="Style ID" width="140" type="number" />
                            <ColumnDirective field="company_name" headerText="Company" width="200" />
                            <ColumnDirective field="pono" headerText="PO No" width="120" />
                      </ColumnsDirective>
                      <Inject services={[Filter, Sort, Edit, Toolbar, Page]} />
                    </GridComponent>
                </div>
              </div>
             </div>
            )
}
export default Adaptive;