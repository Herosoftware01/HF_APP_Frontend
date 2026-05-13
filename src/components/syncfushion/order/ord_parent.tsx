import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useContext } from "react";
import { UserContext } from "../../../UserContext";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  InfiniteScroll,
  Sort,
  Inject,
  Resize,
  Filter,
  Group,
  Reorder,
  // Search,
  // VirtualScroll,
  // ContextMenu,
  // ColumnMenu,
  Page,
  Toolbar,
  // ColumnChooser,
  // Freeze,
  Edit,
  // AddEventArgs,
  // SaveEventArgs,
  // EditEventArgs,
  // DeleteEventArgs,
  // ActionEventArgs,
  // Aggregate,
  // AggregateColumnsDirective,
  // AggregateColumnDirective,
  // AggregateDirective,
  // AggregatesDirective,
  // PdfExport,
  DetailRow,
  ExcelExport
} from '@syncfusion/ej2-react-grids';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import {Browser} from '@syncfusion/ej2-base';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, ChipListComponent } from '@syncfusion/ej2-react-buttons';
import { TabComponent } from '@syncfusion/ej2-react-navigations';

interface PrintingRow {
  jobno?: string;
  print_type?: string;
  print_description?: string;
  print_colours?: string | number;
  inside_outside_print_emb?: string;
  individual_part_print_emb?: string;
  print_screen_1?: string;
  print_screen_2?: string;
  print_screen_3?: string;
  top_bottom?: string;
  topbottom_des?: string;
  rgb?: string;
  sv?: string;
  mainimagepath?: string;
  prnfile1?: string;
  prnfile2?: string;
  image_tb?: string;
  print_img?: string;
  prnmeaimg?: string;
  clr?: string;
  [k: string]: any;
}

interface OrderData {
  slno1?: number;
  jobno_oms: string;
  company_name: string;
  buyer1: string;
  stylename: string;
  uom: string;
  final_delivery_date: string;
  merch: string;
  punit_sh: string;
  styleno: string;
  production_type_inside_outside: string;
  quantity: string;
  director_sample_order: string;
  reference: string;
  mainimagepath: string;
  finaldelvdate: string;
  Printing?: PrintingRow[];
  [k: string]: any;
}

interface SavedSetting {
  id: number;
  name: string;
  data: any;
  user: string;
}

// --- HELPERS ---

const firstTruthy = (...vals: Array<any>) =>
  vals.find((v) => typeof v === "string" && v.trim().length > 0) || "";

const showVal = (val: any): string => {
  if (val === null || val === undefined) return "–";
  if (typeof val === "string") {
    const t = val.trim();
    return t.length ? t : "–";
  }
  try { return String(val); } catch { return "–"; }
};
  const imageFieldTemplate = (field: 'mainimagepath' |'Print'| 'print_img' | 'prnmeaimg' | 'img_fpath'| 'Emb' | 'others1' | 'others2' | 'others3' | 'others4' | 'others5' | 'others6' | 'others7') => (p: OrderData) => { 
    if (!p[field]) return <div style={{ color: '#ccc', fontSize: '10px' }}>No Image</div>;
    return <img src={p[field]} alt="img" style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid #eee' }} />;
  };

const groupByPrint = (printing: PrintingRow[]) => {
  const map = new Map<string, any>();
  printing.forEach((item) => {
    const key = `${item.jobno ?? ""}_${item.print_type ?? ""}_${item.print_description ?? ""}`;
    if (!map.has(key)) {
      const primaryImage = firstTruthy(item.mainimagepath, item.prnfile1, item.print_img);
      const secondaryImage = firstTruthy(item.prnfile2, item.prnmeaimg);
      const imageTb = firstTruthy(item.image_tb, item.print_img);
      const image1 = secondaryImage && secondaryImage !== primaryImage ? secondaryImage : "";
      const image2 = imageTb && imageTb !== primaryImage && imageTb !== image1 ? imageTb : "";

      map.set(key, {
        jobno: item.jobno ?? "",
        print_type: item.print_type ?? "",
        print_description: item.print_description ?? "",
        print_colours: item.print_colours,
        inside_outside_print_emb: item.inside_outside_print_emb ?? "",
        individual_part_print_emb: item.individual_part_print_emb ?? "",
        print_screen_1: item.print_screen_1 ?? "",
        print_screen_2: item.print_screen_2 ?? "",
        print_screen_3: item.print_screen_3 ?? "",
        top_bottom: item.top_bottom ?? "",
        unit: item.sv ?? "",
        image: primaryImage,
        image1,
        image2,
        rows: [] as PrintingRow[]
      });
    }
    map.get(key).rows.push(item);
  });
  return Array.from(map.values());
};

const getUniqueColours = (rows: PrintingRow[]) => {
  const map = new Map<string, { colour: string; rgb: string }>();
  rows.forEach((r) => {
    const colour = r.topbottom_des ?? r.clr ?? "";
    const rgb = r.rgb ?? "";
    const key = `${colour}_${rgb}`;
    if (!map.has(key) && (colour || rgb)) {
      map.set(key, { colour, rgb });
    }
  });
  return Array.from(map.values());
};

// --- COMPONENT ---

const HeroFashionGrid13: React.FC = () => {
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState<string>('');
  const { username } = useContext(UserContext);

  const [savedSettings, setSavedSettings] = useState<SavedSetting[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<string>('');
  const [qualityControllers, setQualityControllers] = useState<any[]>([]);

  const settingNameRef = useRef<TextBoxComponent>(null);
  const dropdownRef = useRef<DropDownListComponent>(null);
  const tooltipRef = useRef<TooltipComponent>(null);
  const gridRef = useRef<GridComponent>(null);
  const searchTimeout = useRef<any>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); setError(null);
        const [orderResponse, printResponse, qcResponse] = await Promise.all([
          fetch('https://app.herofashion.com/order_panda'),
          fetch('https://app.herofashion.com/ord_prn/'),
          fetch('https://app.herofashion.com/get_quality_controllers/')
        ]);
        
        if (!orderResponse.ok || !printResponse.ok || !qcResponse.ok) throw new Error("Failed to fetch data");

        const orderData: OrderData[] = await orderResponse.json();
        const printData: PrintingRow[] = await printResponse.json();
        const qcData: any[] = await qcResponse.json();

        const printMap: Record<string, PrintingRow[]> = {};
        printData.forEach(p => {
          const key = p.jobno;
          if (key) {
            if (!printMap[key]) printMap[key] = [];
            printMap[key].push(p);
          }
        });

        const processedData = orderData
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
             const dateA = new Date(a.finaldelvdate || a.final_delivery_date || 0).getTime();
             const dateB = new Date(b.finaldelvdate || b.final_delivery_date || 0).getTime();
             return dateA - dateB;
          })
          .map((item, index) => ({
            ...item,
            slno1: index + 1,
            Printing: printMap[item.jobno_oms] || [] 
          }));

        setDataSource(processedData);
        setTotalCount(processedData.length);
        setShowingCount(processedData.length);
        setQualityControllers(qcData.slice(0, 10));
      } catch (err: any) {
        console.error("Fetch error:", err); 
        setError(`Network Error: ${err.message}. Please check backend connection.`);
      } finally { setLoading(false); }
    };
    fetchData();
    fetchSavedSettings();
  }, []);

  // --- Settings Logic ---
  const fetchSavedSettings = async () => {
    try {
      const res = await fetch('https://hfapi.herofashion.com/syncfushion/api/grid-settings/');
      const data = await res.json();
      setSavedSettings(data);
    } catch (e) { console.error('Failed to fetch settings', e); }
  };

  const saveSetting = async () => {
    const name = (settingNameRef.current?.value || '').trim();
    if (!name || !gridRef.current) return alert('Enter setting name');
    try {
      const persist = gridRef.current.getPersistData();
      const payload = { name, data: JSON.parse(persist), user: username };
      const existing = savedSettings.find(s => s.name === name);
      const method = existing ? 'PUT' : 'POST';
      const url = existing ? `https://hfapi.herofashion.com/syncfushion/api/grid-settings/${existing.id}/` : `https://hfapi.herofashion.com/syncfushion/api/grid-settings/`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed');
      await fetchSavedSettings();
      alert('Saved');
    } catch (e) { alert('Error saving'); }
  };

  const applySetting = () => {
    const key = dropdownRef.current?.value;
    if (!key || !gridRef.current) return;
    const setting = savedSettings.find(s => s.id === Number(key));
    if (setting) (gridRef.current as any).setProperties(setting.data, true);
  };

  const deleteSetting = async () => {
    const key = dropdownRef.current?.value;
    if (!key) return;
    const setting = savedSettings.find(s => s.id === Number(key));
    if (setting) {
      await fetch(`https://hfapi.herofashion.com/syncfushion/api/grid-settings/${setting.id}/`, { method: 'DELETE' });
      fetchSavedSettings();
    }
  };

  // --- Grid Logic ---
  const highlightText = (text: any) => {
    if (!searchKey || text === undefined || text === null) return text;
    const stringText = String(text);
    const escapedKey = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = stringText.split(new RegExp(`(${escapedKey})`, 'gi'));
    return <span>{parts.map((part, i) => part.toLowerCase() === searchKey.toLowerCase() ? <span key={i} className="custom-highlight">{part}</span> : part)}</span>;
  };

  const genericHighlighter = (field: keyof OrderData) => (props: OrderData) => <>{highlightText(props[field])}</>;

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

  const dataBound = () => {
    if (gridRef.current) {
      const records = gridRef.current.getFilteredRecords();
      setShowingCount(records ? (records as object[]).length : 0);
      if (gridRef.current.detailRowModule) {
        gridRef.current.detailRowModule.expandAll();
      }
    }
  };

    const rollnoTemplate = (props: any) => {
    let rollno = props.index
    if (rollno) {
      return (<span>{++rollno}</span>)
    }
  }

  const toolbarClick = (args: any) => {
    if (!gridRef.current) return;
    if (args.item.id === 'export_excel') gridRef.current.excelExport();
  };

  // --- TEMPLATES ---

  const photoTemplate = (props: OrderData) => {
    const src = firstTruthy(props.mainimagepath,props.Printing?.[0]?.mainimagepath);
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        {src ? (
          <img src={src} alt="photo" style={{ width: "85px", height: "85px", objectFit: "contain", border: "1px solid #ccc", borderRadius: "6px" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : <div style={{width:105, height:155, background:'#eee', borderRadius:6}}></div>}
      </div>
    );
  };
  
  const orderSummaryTemplate = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>OR:</b> {highlightText(p.jobno_oms)}<br />
      <b>Buy:</b> {highlightText(p.buyer1)}<br />
      <b>Mer:</b> {highlightText(p.merch)}<br />
      <b>Unit:</b> {highlightText(p.punit_sh)}
      <br />
      <b>Qty:</b> {highlightText(p.quantity)}
    </div>
  );

   const deliveryInfoTemplate = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>Fdt:</b> 
        {highlightText(p.Fdt || p.final_delivery_date)}<br />
      <b>Dir:</b> {highlightText(p.director_sample_order)}<br />
      <b>ST:</b> {highlightText(p.styleno)}<br />
      <b>Uom:</b> {highlightText(p.uom)}<br />
      <b>Type:</b> {highlightText(p.production_type_inside_outside)}
    </div>
  );

  const udf= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>1-Print:</b> {highlightText(p.printing_R)}<br />
      <b>3-Emb:</b> {highlightText(p.number_03_emb)}<br />
      <b>7:</b> {highlightText(p.u7)}<br />
      <b>8-Fab:</b> {highlightText(p.u8)}<br />
      <b>14-Fabdy:</b> {highlightText(p.u14)}<br />
    </div>
  );

  const udf11= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>25-week:</b> {highlightText(p.u25)}<br />
    </div>
  );
  const udf4 = (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      {/* <b>Fdt:</b> <span style={getDateStyle(p.Fdt || p.final_delivery_date)}>{highlightText(p.Fdt || p.final_delivery_date)}</span><br /> */}
      <b>Week_R:</b> {highlightText(p.Week_R)}<br />
      <b>ST:</b> {highlightText(p.styleno)}<br />
      <b>Uom:</b> {highlightText(p.uom)}<br />
      <b>Type:</b> {highlightText(p.production_type_inside_outside)}
    </div>
  );

  const udf2= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>31:</b> {highlightText(p.u31)}<br />
      <b>36-ITS:</b> {highlightText(p.u36)}<br />
      <b>u45:</b> {highlightText(p.u45)}<br />
      <b>u46:</b> {highlightText(p.u46)}<br />
      <b>u141:</b> {highlightText(p.u141)}<br />
    </div>
  );

  //   const deliveryInfoTemplate = (p: OrderData) => (
  //   <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
  //     {/* <b>Fdt:</b> <span style={getDateStyle(p.Fdt || p.final_delivery_date)}>{highlightText(p.Fdt || p.final_delivery_date)}</span><br /> */}
  //     <b>Dir:</b> {highlightText(p.director_sample_order)}<br />
  //     <b>ST:</b> {highlightText(p.styleno)}<br />
  //     <b>Uom:</b> {highlightText(p.uom)}<br />
  //     <b>Type:</b> {highlightText(p.production_type_inside_outside)}
  //   </div>
  // );


  const qualy= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>styleno:</b> {highlightText(p.styleno)}<br />
      <b>styledesc:</b> {highlightText(p.styledesc)}<br />
      <b>qcontr:</b> {highlightText(p.quality_controller)}<br />
      <b>order_follow_up:</b> {highlightText(p.order_follow_up)}<br />
  </div>
  );

  const prdty= (p: OrderData) => (
    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
      <b>ptype:</b> {highlightText(p.production_type_inside_outside)}<br />
      <b>dir_sam_ord:</b> {highlightText(p.director_sample_order)}<br />
      <b>comp:</b> {highlightText(p.company_name)}<br />
  </div>
  );

  // --- DETAIL TEMPLATE WITH TABS ---
  const detailTemplate = (props: OrderData) => {
    const printingRows = Array.isArray(props.Printing) ? props.Printing : [];
    const printGroups = groupByPrint(printingRows);
    
    // Helper for chips
    const chipTags = (tags: string[]) => {
        return (<ChipListComponent chips={tags} cssClass={'e-outline'} />);
    };

    return (
      <div>
        <TabComponent heightAdjustMode="Auto">
            <div className="e-tab-header">
                <div> Order Details </div>
                <div> Print Details </div>
                <div> NewData </div>
                <div> New OrdImageTab </div>
            </div>
            <div className="e-content">

                {/* TAB 1: ORDER DETAILS */}
                <div className='content-tab' style={{ padding: '5px' ,height:'80px' }}>
                    <div style={{ display: "grid", gridTemplateColumns: "0.2fr 0.2fr 0.2fr", columnGap: "2px", rowGap: "1px", fontSize: "14px",height:"80px" }}>
                      
                        <div><b>Job No:</b> {showVal(props.jobno_oms)}</div>
                        <div><b>Buyer:</b> {showVal(props.buyer1)}</div>
                        <div><b>Company:</b> {showVal(props.company_name)}</div>
                        {/* <div><b>ref:</b> {showVal(props.reference)}</div> */}

                        <div><b>Style Name:</b> {showVal(props.stylename)}</div>
                        <div><b>Style No:</b> {showVal(props.styleno)}</div>
                        <div><b>Merchandiser:</b> {showVal(props.merch)}</div>

                        <div><b>Quantity:</b> {showVal(props.quantity)}</div>
                        <div><b>Unit:</b> {showVal(props.punit_sh)}</div>
                        <div><b>Production Type:</b> {showVal(props.production_type_inside_outside)}</div>

                        <div><b>Delivery Date:</b> {showVal(props.final_delivery_date)}</div>
                        <div><b>Director Sample:</b> {showVal(props.director_sample_order)}</div>
                        <div><b>UOM:</b> {showVal(props.uom)}</div>
                    </div>
                </div>

                {/* TAB 2: PRINT DETAILS */}
                <div>
                    {printGroups.length === 0 && <div style={{color: '#999', textAlign: 'center',height:'30px', padding: '20px'}}>No Print Details Available</div>}
                    
                    {printGroups.map((grp: any, idx: number) => {
                        const colours = getUniqueColours(grp.rows);
                        const images = [grp.image, grp.image1, grp.image2].filter(Boolean);
                        
                        return (
                            <div key={idx} style={{ marginBottom: "20px", borderBottom: "2px solid #003399", paddingBottom: "20px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", columnGap: "30px", alignItems: "start" }}>
                                    
                                    {/* Left: Image */}
                                    <div style={{ border: '1px solid #eee', padding: '5px', background: '#fff' }}>
                                        {images.length > 0 ? (
                                            <img src={images[0]} alt="print" style={{ width: "100px", height: "100px", objectFit: "contain" }}
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                                        ) : (
                                            <div style={{width: '50%', height: '80px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc'}}>
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Data & Colors */}
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "0.4fr 0.4fr 0.4fr 0.4fr", columnGap: "1px", rowGap: "1px", fontSize: "13px", marginBottom: "15px" }}>
                                            <div><b>Job No:</b> {showVal(grp.jobno)}</div>
                                            <div><b>Print Type:</b> {showVal(grp.print_type)}</div>
                                            <div><b>Print Description:</b> {showVal(grp.print_description)}</div>

                                            <div><b>Inside / Outside:</b> {showVal(grp.inside_outside_print_emb)}</div>
                                            <div><b>Individual Part:</b> {showVal(grp.individual_part_print_emb)}</div>
                                            <div><b>Top / Bottom:</b> {showVal(grp.top_bottom)}</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {colours.map((c: any, i: number) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                                                            <div style={{ width: "16px", height: "16px", background: c.rgb || "#fff", border: "1px solid #ccc" }} />
                                                            <span style={{ fontSize: '12px' }}>{showVal(c.colour)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            
                                            <div><b>Print Screen 1:</b> {showVal(grp.print_screen_1)}</div>
                                            <div><b>Print Screen 2:</b> {showVal(grp.print_screen_2)}</div>
                                            <div><b>Print Screen 3:</b> {showVal(grp.print_screen_3)}</div>
                                        
                                        </div>

                                        {/* Colors Row */}
                                        {/* {colours.length > 0 && (
                                            <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                                <b style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Colours:</b>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {colours.map((c: any, i: number) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                                                            <div style={{ width: "16px", height: "16px", background: c.rgb || "#fff", border: "1px solid #ccc" }} />
                                                            <span style={{ fontSize: '12px' }}>{showVal(c.colour)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* TAB 3: NEWDATA (Product Card Style) */}
                  <div style={{ padding: '8px', background: '#f5f5f5', maxHeight: '150px', overflowY: 'auto'}}>
                    {/* <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>PRINTING MENU</h4> */}
                    
                    {printGroups.length === 0 && <div style={{color: '#999',width:'50px', textAlign: 'center', background: '#fff', borderRadius: '8px'}}>No Print Details Available</div>}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' }}>
                        {printGroups.map((grp: any, idx: number) => {
                            const tags = [grp.print_screen_1, grp.print_screen_2, grp.individual_part_print_emb].filter(t => t && t !== "–");

                            return (
                                <div key={idx} style={{ 
                                    background: '#fff', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    height: '100%'
                                }}>
                                    <div style={{ 
                                        width: '110px', 
                                        background: '#f9f9f9', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: '5px',
                                        borderRight: '1px solid #eee' 
                                    }}>
                                        {grp.image ? (
                                            <img src={grp.image} alt="print" style={{ width: "100%", height: "auto", maxHeight: "50px", objectFit: "contain", display: 'block' }}
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/100x80?text=No+Img'; }} />
                                        ) : (
                                            <div style={{color: '#ccc', fontSize: '10px', textAlign: 'center'}}>No Image</div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: '#ffc107',
                                            color: '#333',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            padding: '2px 8px',
                                            borderRadius: '10px'
                                        }}>
                                            {showVal(grp.reference)} ref
                                        </div>
                                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '2px', paddingRight: '80px' }}>
                                            {showVal(grp.jobno_oms)}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '2px', paddingRight: '80px' }}>
                                            {showVal(grp.print_type)}
                                        </div>
                                      
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                                            Size: {showVal(grp.inside_outside_print_emb)}
                                        </div>

                                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px', lineHeight: '1.3' }}>
                                            {showVal(grp.print_description)}
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {tags.map((t, i) => (
                                                <span key={i} style={{
                                                    background: '#e8f5e9',
                                                    color: '#2e7d32',
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #c8e6c9'
                                                }}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TAB 4: NEW ORDIMAGETAB (Exact Pizza Layout with Order Data) */}
                <div style={{ padding: '0' }}>
                    {/* Using the exact structure from reference */}
                    <div className="details e-pizza-cell">
                        <div className="e-pizza-info-container">
                          <div>
                            <h1>Hai</h1>
                          </div>
                            {/* Image Layout */}
                            <div className="e-pizza-image-layout">
                                {props.mainimagepath ? (
                                    <img className="e-pizza-image" src={props.mainimagepath} alt={props.stylename} 
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/100x80?text=No+Img'; }} />
                                ) : (
                                    <div style={{width: '100%', height: '100%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa'}}>No Image</div>
                                )}
                            </div>

                            {/* Info Layout */}
                            <div className="e-pizza-info-layout">
                                <div className="e-info-text-separator">
                                    <span className="e-pizza-title">{showVal(props.stylename)}</span>
                                    <span className="e-pizza-size">({showVal(props.styleno)} size)</span>
                                    {/* <span className="e-pizza-price-text">Ref &nbsp;</span> */}
                                    <span className="e-pizza-size">({showVal(props.reference)})</span>
                                </div>
                                <div className="e-info-text-separator">
                                    <span>{showVal(props.buyer1)} - {showVal(props.company_name)}</span>
                                </div>
                                {/* <div> <span className="e-pizza-size">({showVal(props.reference)})</span></div> */}
                               
                                {/* <div className="e-info-text-separator">
                                    {chipTags([showVal(props.punit_sh), showVal(props.production_type_inside_outside), showVal(props.director_sample_order)])}
                                </div> */}


                                  {/* <div className="e-pizza-price-min-layout e-info-text-separator">
                                    <span className="e-pizza-price-text">({showVal(props.reference)})</span>
                                  </div>
                                  */}
                                <div className="e-pizza-price-min-layout e-info-text-separator">
                                    <span className="e-pizza-price-text">Total Qty&nbsp;</span>
                                    <span className="e-pizza-price">{showVal(props.quantity)}</span>
                                    <span className="e-pizza-original-price">{showVal(props.uom)}</span>
                                </div>
                            </div>
                            
                            <div className="e-flex-grow"></div>
                            
                            {/* Right Price Layout */}
                            <div className="e-pizza-price-layout">
                                <div className="e-info-text-separator"><span className="e-pizza-price-text">Total Qty</span></div>
                                <div className="e-info-text-separator"><span className="e-pizza-price">{showVal(props.quantity)}</span></div>
                                <div className="e-info-text-separator"><span className="e-pizza-original-price">{showVal(props.uom)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TabComponent>
      </div>
    );
  };

  // --- RENDER ---
  
  const toolbarOptions: any[] = [ { text: 'Search', prefixIcon: 'e-icons e-search', id: 'Grid_search', align: 'Left' as any }, "Edit", "Delete", "Update", "Cancel", { type: 'Separator' }, { text: '', prefixIcon: 'e-excelexport', id: 'export_excel' }];
  const actionBegin = (args: any) => { /* Keep existing logic */ };
  const actionComplete = (args: any) => { /* Keep existing logic */ };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', minWidth: 0, overflow: 'hidden' }}>
      {/* CSS Styles */}
      <style>{`
        .custom-highlight { background-color: #fff9c4 !important; color: '#d32f2f' !important; font-weight: bold; }
        .e-rowcell { vertical-align: top !important; font-size: 12px !important; line-height: 1.3 !important; padding-top: 8px !important; }
        .e-detailrow .e-tab { border: none; }
        .e-dtdiagonal, .e-dtvertical { display: none !important; }

        .e-grid .e-rowcell
        {
          border-top:2px solid gray !important;
        }

        .e-grid .e-detailrowexpand{
          border-top:2px solid gray !important;
        }
          
        .e-grid .e-detailrowcollapse{
          border-top:2px solid gray !important;
        }

       .e-touch{
        height: 80px !important;
        }

        /* --- Pizza Menu Layout Styles (Ref Code) --- */
        .e-pizza-cell { 
            padding: 2px; 
            background: #fff;
        }
        .e-pizza-info-container {
            display: flex;
            align-items: center;
            min-height: 50px;
        }
        .e-pizza-image-layout {
            width: 120px;
            height: 120px;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .e-pizza-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .e-pizza-info-layout {
            padding: 10px 20px;
            flex-grow: 1;
        }
        .e-info-text-separator {
            margin-bottom: 8px;
        }
        .e-pizza-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-right: 5px;
        }
        .e-pizza-size {
            font-size: 14px;
            color: #888;
        }
        .e-pizza-price-min-layout {
            display: none; /* Hidden on larger screens */
        }
        .e-pizza-price-layout {
            padding: 20px;
            text-align: right;
            flex-shrink: 0;
        }
        .e-pizza-price-text {
            font-size: 12px;
            color: #888;
            display: block;
        }
        .e-pizza-price {
            font-size: 20px;
            font-weight: bold;
            color: #d62828;
            display: block;
        }
        .e-flex-grow { flex-grow: 1; }
        
        /* Chip styles */
        .e-chip-list.e-outline .e-chip { 
            border: 1px solid #e0e0e0; 
            background: transparent; 
            color: #666;
            padding: 0 8px;
            height: 24px;
            line-height: 22px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px;
        }

 /* --- Desktop Layout --- */
        .dashboard-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 5px 10px;
          background-color: #0ff180;
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
              margin-top: 40px !important
            }
            }
            
            /* --- Mobile Layout --- */
            @media (max-width: 768px) {
              .dashboard-header {
                flex-direction: column;
                padding: 0px;
                align-items: stretch;
                gap: 1px;             
                }

                .breadcromp{
                width:80%;
                font-size:50px;
                display: none
                }
                 
        
            .count-display {
            display:none
            }
          
                          .count-display1 {
            background: #e9ecef;
            color: #007bff;
            padding: 0px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            white-space: nowrap;
            border: 1px solid #dce1e6;
            display:block;
            width: 60px;
            float: right;
            }
            .count{
              margin-top: -45px;
              margin-left: 295px
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
      `}</style>

      {/* Header */}
      <div className="dashboard-header">
        <div className="count-display">
          {showingCount} / {totalCount}
        </div>

        <ol className="flex items-center whitespace-nowrap breadcromp">
          <li className="inline-flex items-center">
            <a className="flex items-center text-xs md:text-sm text-lg text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/dashboard">
              <svg className="shrink-0 me-3 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Dashboard
            </a>
            <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </li>
          <li className="inline-flex items-center">
            <a className="flex items-center text-xs md:text-sm text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/sy-order">
              <svg className="shrink-0 me-3 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1" /><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" /></svg>
              Order
              <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </a>
          </li>
          <li className="inline-flex items-center text-xs md:text-sm font-semibold text-foreground truncate" aria-current="page">
            Order Table
          </li>
        </ol>

        {/* <div className="header-controls bg-white">
          <input 
            type="text" 
            placeholder="Search all columns..."
            value={searchKey}
            onChange={onSearchChange}
            className="search-input"
          />
        </div> */}
        <div style={{ padding: '0px 5px', marginLeft: '5px', display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight:'bold' }}>
    <TextBoxComponent
      ref={settingNameRef}
      placeholder="setting name"
      style={{ width: '80px' }}
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
    placeholder="Select setting"
    style={{ width: '80px' }}
    change={() => setSelectedSetting(dropdownRef.current?.value as string)}
  />
</div>

  <ButtonComponent
    onClick={applySetting}
    cssClass="e-outline"
    style={{ padding: '3px 6px', fontSize: '15px' }}
  >
   ✔
  </ButtonComponent>

  <ButtonComponent
    onClick={deleteSetting}
    cssClass="e-outline e-danger"
    style={{ padding: '3px 6px', fontSize: '15px' }}
  >
    🗑
  </ButtonComponent>
        <div className='count'>

          <div className="count-display1">
            {showingCount} / {totalCount}
          </div>
        </div>
</div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {error && (
            <div style={{ padding: '20px', margin: '20px', background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', borderRadius: '4px', textAlign: 'center' }}>
                <h3>Network Error</h3>
                <p>{error}</p>
            </div>
        )}
        {loading ? <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div> : (
          <GridComponent
            id="Grid"
            ref={gridRef}
            dataSource={dataSource}
            dataBound={dataBound}
            // pageSettings={{ pageSize: 10 }}
            // allowPaging={true}
            enableInfiniteScrolling={true}
            statelessTemplates={['directiveTemplates']}
            height="700px"
            width="100%"
            allowSorting={true}
            allowFiltering={true}
            filterSettings={{ type: 'Menu' }}
            allowResizing={true}
            allowGrouping={true}
            groupSettings={{showDropArea : !Browser.isDevice}}
            enableAdaptiveUI={true}
            adaptiveUIMode={'Mobile'}
            allowReordering={true}
            gridLines='Both'
            searchSettings={{  operator: 'contains', ignoreCase: true }}
            toolbar={toolbarOptions}
            editSettings={{ allowEditing: true, allowDeleting: true, mode: 'Dialog' }}
            actionBegin={actionBegin}
            actionComplete={actionComplete}
            created={created}
            toolbarClick={toolbarClick}
            detailTemplate={detailTemplate}
          >
            <ColumnsDirective>
              <ColumnDirective field="jobno_oms" headerText="Order Info" width="100" template={orderSummaryTemplate} isPrimaryKey={true} customAttributes={{ class: 'editCss' }} />
              <ColumnDirective headerText="Photo" width="150" template={photoTemplate} textAlign="Center" allowFiltering={false} />
              <ColumnDirective field="Fdt" headerText="DELIVERY INFO" width="180" maxWidth="150" template={deliveryInfoTemplate} customAttributes={{ class: 'editCss' }}/>
              <ColumnDirective headerText='fsn' width="30" textAlign="Left" allowFiltering={false} template={rollnoTemplate} allowEditing={false} />
              <ColumnDirective field="Print" headerText="Print" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Print')} allowEditing={false} customAttributes={{ class: 'img' }}/>
              <ColumnDirective field="Emb" headerText="Emb" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Emb')} allowEditing={false} customAttributes={{ class: 'img' }}/>
              <ColumnDirective field="others1" headerText="imgs1" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('others1')} allowEditing={false} customAttributes={{ class: 'img' }}/>
              <ColumnDirective field="others2" headerText="imgs2" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('others2')} allowEditing={false} customAttributes={{ class: 'img' }} />
              <ColumnDirective field="printing_R" headerText="udf" width="150" maxWidth="150" template={udf} customAttributes={{ class: 'editCss' }}/>
              <ColumnDirective field="styleno" headerText="udf2" width="150" maxWidth="150" template={udf2} customAttributes={{ class: 'editCss' }}/>
              <ColumnDirective field="udf4" headerText="udf4" width="150" maxWidth="150" template={udf4} customAttributes={{ class: 'editCss' }}/>
              <ColumnDirective field="prdty" headerText="prdty" width="150" maxWidth="250" template={prdty} customAttributes={{ class: 'editCss' }}/>
              <ColumnDirective field="qualy" headerText="qualy" width="120" template={qualy} customAttributes={{ class: 'editCss' }}/>
              <ColumnDirective field="Fdt" headerText="Delivery Info" width="100" template={deliveryInfoTemplate}  />
              <ColumnDirective field="print_img" headerText="PRN IMG" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('print_img')} />
              <ColumnDirective field="prnmeaimg" headerText="MEAS IMG" width="120" maxWidth="120" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('prnmeaimg')} />
              <ColumnDirective field="Print" headerText="Print" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Print')} allowEditing={false} />
              <ColumnDirective field="Emb" headerText="Emb" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('Emb')} allowEditing={false} />
              <ColumnDirective field="others1" headerText="others1" width="100" textAlign="Center" allowFiltering={false} template={imageFieldTemplate('others1')} allowEditing={false} />
              {/* <ColumnDirective field="printing_R" headerText="udf1" width="100" template={udf} />
              <ColumnDirective field="udf2" headerText="udf2" width="100" template={udf2} />
              <ColumnDirective field="qualy" headerText="qualy" width="120" template={qualy} />
              <ColumnDirective field="prdty" headerText="prdty" width="120" template={prdty} /> */}
              <ColumnDirective field="udf" headerText="udf" width="120" template={udf11} customAttributes={{ class: 'editCss' }} /> 
              {/* <ColumnDirective field="quantity" headerText="Qty" width="90" textAlign="Right" template={genericHighlighter('quantity')} />
              <ColumnDirective field="final_delivery_date" headerText="Fdt" width="120" template={genericHighlighter('final_delivery_date')} />
              <ColumnDirective field="production_type_inside_outside" headerText="Type" width="120" template={genericHighlighter('production_type_inside_outside')} /> */}
            </ColumnsDirective>
            <Inject services={[Sort, Filter, Resize, Page, Toolbar, Edit, DetailRow, ExcelExport, Reorder, InfiniteScroll, Group]} />
          </GridComponent>
        )}
      </div>
    </div>
  );
};

export default HeroFashionGrid13;