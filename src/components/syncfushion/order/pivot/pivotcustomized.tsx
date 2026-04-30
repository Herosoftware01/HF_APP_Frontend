/* Syncfusion Pivot Table - Order Management Dashboard
   Features: Sort, Filter, Group, Export, Conditional Formatting */
import * as React from "react";
import { PivotViewComponent, Inject, FieldList, CalculatedField, Toolbar, ToolbarItems, PDFExport, ExcelExport } from "@syncfusion/ej2-react-pivotview";
import { ConditionalFormatting, NumberFormatting, IDataSet, FieldOptions, ColumnRenderEventArgs, DataSourceSettings } from "@syncfusion/ej2-react-pivotview";
import { SwitchComponent } from "@syncfusion/ej2-react-buttons";
import { HeaderCellInfoEventArgs, QueryCellInfoEventArgs } from '@syncfusion/ej2-grids'

let pivotObj: PivotViewComponent;

const dataSourceSettings: DataSourceSettings = {
  enableSorting: true,
  columns: [{ name: "Process" }],
  valueSortSettings: { headerDelimiter: " - " },
  rows: [
    { name: "OrderNo", caption: "Order" },
    { name: "Buyer", caption: "Order Details" }
  ],
  values: [
    { name: "ReqQty", caption: "Req Qty" },
    { name: "PoDcQty", caption: "Po / Dc Qty" },
    { name: "InwQty", caption: "In Qty" },
    { name: "RetQty", caption: "Ret Qty" },
    { name: "WIPQty", caption: "WIP Qty" },
    { name: "WIPPer", caption: "WIP (%)" },
    { name: "DcBalQty", caption: "Bal Qty" },
    { name: "DcBalPer", caption: "Bal (%)" }
  ],
  // Filter: Show only these orders - modify items array as needed
  filterSettings: [
    { name: "OrderNo", items: ["J7031A", "J6946A", "J6959A", "J7174A"] }
  ],
  formatSettings: [
    { name: 'ReqQty', format: 'N2' },
    { name: 'PoDcQty', format: 'N2' },
    { name: 'InwQty', format: 'N2' },
    { name: 'RetQty', format: 'N2' },
    { name: 'WIPQty', format: 'N2' },
    { name: 'WIPPer', format: 'N2' },
    { name: 'DcBalQty', format: 'N2' },
    { name: 'DcBalPer', format: 'N2' }
  ],
  expandAll: true,
  showSubTotals: false,
  showGrandTotals: false,
  valueAxis: "row",
  // Color coding based on value ranges - modify thresholds/colors as needed
  conditionalFormatSettings: [
    { value1: 1000, value2: 2000, conditions: 'Between', style: { backgroundColor: '#FEF8C3' } },
    { value1: 2000, conditions: 'GreaterThan', style: { backgroundColor: '#F9933E' } },
    { value1: 100, conditions: 'LessThan', style: { backgroundColor: '#FAFBFD' } },
    { value1: 100, value2: 1000, conditions: 'Between', style: { backgroundColor: '#CDFBF1' } }
  ]
} as DataSourceSettings;

function Pivot() {
  // Fetch order data from API - Change URL to your endpoint
  React.useEffect(() => {
    fetch("https://app.herofashion.com/pivot_dtls/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        if (pivotObj) {
          pivotObj.dataSourceSettings.dataSource = data;
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  const toolbarOptions: ToolbarItems[] = [
    "New", "Save", "SaveAs", "Rename", "Remove", "Load", "Grid", "Chart", "Export",
    "SubTotal", "GrandTotal", "Formatting", "FieldList",
  ];

  const saveReport = (args: any) => {
    let reports: any[] = [];
    let isSaved = false;

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reports = JSON.parse(localStorage.pivotviewReports);
    }

    if (args.report && args.reportName && args.reportName !== "") {
      reports.forEach((item) => {
        if (args.reportName === item.reportName) {
          item.report = args.report;
          isSaved = true;
        }
      });
      if (!isSaved) {
        reports.push({ reportName: args.reportName, report: args.report });
      }
      localStorage.pivotviewReports = JSON.stringify(reports);
    }
  };

  const fetchReport = (args: any) => {
    let reportCollection: any[] = [];
    let reportList: string[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportCollection.forEach((item) => reportList.push(item.reportName));
    args.reportName = reportList;
  };

  const loadReport = (args: any) => {
    let reportCollection: any[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportCollection.forEach((item) => {
      if (args.reportName === item.reportName) {
        args.report = item.report;
      }
    });

    if (args.report && pivotObj) {
      pivotObj.dataSourceSettings = JSON.parse(args.report).dataSourceSettings;
    }
  };

  const removeReport = (args: any) => {
    let reportCollection: any[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportCollection = reportCollection.filter(
      (item) => item.reportName !== args.reportName,
    );
    localStorage.pivotviewReports = JSON.stringify(reportCollection);
  };

  const renameReport = (args: any) => {
    let reportsCollection: any[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportsCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportsCollection.forEach((item) => {
      if (args.reportName === item.reportName) {
        item.reportName = args.rename;
      }
    });

    localStorage.pivotviewReports = JSON.stringify(reportsCollection);
  };

  const newReport = () => {
    if (pivotObj) {
      pivotObj.setProperties(
        { dataSourceSettings: { columns: [], rows: [], values: [], filters: [] } }, false
      );
    }
  };

  const beforeToolbarRender = (args: any) => {
    args.customToolbar.splice(6, 0, { type: "Separator" });
    args.customToolbar.splice(9, 0, { type: "Separator" });
  };

  const chartOnLoad = (args: any) => {
    let selectedTheme = location.hash.split("/")[1];
    selectedTheme = selectedTheme ? selectedTheme : "Material";
    args.chart.theme = (
      selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
    )
      .replace(/-dark/i, "Dark")
      .replace(/contrast/i, "Contrast")
      .replace(/-highContrast/i, "HighContrast");
  };

  // Order product images - replace with your image URLs
  const imageUrl = [
    'https://app.herofashion.com/order_image/7045.jpg',
    'https://app.herofashion.com/order_image/7055-AOP.jpg',
    'https://app.herofashion.com/order_image/7063_AOP.jpg',
    'https://app.herofashion.com/order_image/7064-AOP.jpg'
  ]
  let imageIndex = 0;

  // Custom cell rendering - modifies row headers and value cell display
  const queryCellInfo = (args: QueryCellInfoEventArgs) => {
    if (pivotObj) {
      // Extract cell's column index from aria-colindex attribute (zero-based after subtraction)
      let colIndex: number = Number((args.cell as Element).getAttribute("aria-colindex")) - 1;
      // Get cell data from the row's data array using column index
      let currentCellData = (args.data as any)[colIndex];
      // Cast cell element to HTMLElement for DOM manipulation
      let currentCellElement: HTMLElement = args.cell as HTMLElement;
      // Guard: exit early if cell data or element is missing
      if (!currentCellData || !currentCellElement) { return; }
      // Get the full datasource from pivot component for retrieving record details
      let datasource: IDataSet[] = pivotObj.dataSourceSettings.dataSource as IDataSet[];

      // Retrieve pivot cell object from pivotValues 2D array using row and column indices
      let cell = pivotObj.pivotValues[currentCellData.rowIndex][currentCellData.colIndex];

      // Get index mapping cell at the deepest row level to map row headers to datasource records
      let indexCell = pivotObj.pivotValues[currentCellData.rowIndex][pivotObj.engineModule.rowMaxLevel - 1];
      // indexObject contains mapping of level values to their corresponding datasource indices
      let indexObject: any = indexCell.indexObject;
      // Extract all available index keys from indexObject for level-based data lookup
      let indexes: any = Object.keys(indexObject || {});

      if (cell.axis === "row") {
        if (cell.rowSpan) {
          // Get the first child element of the cell for content rendering
          const element: HTMLElement = currentCellElement.firstElementChild as HTMLElement;

          // Level 0: Order number cell - displays order number link and product image
          // Cycles through imageUrl array using imageIndex to show each order's product picture
          if (cell.level === 0) {
            if (element) {
              // Render order number as clickable link with product image below
              element.innerHTML = `<div>
                <a href="#" target="_blank"style="display:block;margin-bottom:5px;color:#007bff">${cell.formattedText}</a>
                <img src="${imageUrl[imageIndex]}" alt="No Img" width="75" height="75" />
              </div>`;
              // Style container as centered flex column for image and link alignment
              element.style.display = "flex";
              element.style.flexDirection = "column";
              element.style.justifyContent = "center";
              element.style.alignItems = "center";
            }
            // Advance image index modulo 4 to cycle through available product images
            imageIndex = (imageIndex + 1) % 4;
          }
          // Level 1: Order details card - shows comprehensive order info in formatted layout
          // Displays buyer, team, season, quantities, dates, and status indicators
          else if (cell.level === 1) {
            // Retrieve corresponding data record from datasource using index mapping
            const idx = indexes[0];
            const data = datasource[idx];
            // formatDate: Converts ISO date string to dd-mm-yyyy display format
            const formatDate = (dateStr: any) => {
              if (!dateStr) return 'N/A';
              const date = new Date(dateStr);
              return date.toLocaleDateString('en-GB');
            };
            // Render order details card with buyer, team, season, qty, dates, overdue status
            // Uses fallback values (e.g., 'Buyer 18', 'Team 4') when data fields are missing
            element.innerHTML = `
              <div style="padding:5px;border:1px solid #ccc;text-align:center;">
                <div>Buyer :<br/><span style="margin-left:10px;word-wrap:break-word;word-break:break-word;">${data?.Buyer || 'Buyer 18'}</span></div>
                <div>Team : ${data?.Merchandiser || 'Team 4'}</div>
                <div>Season : ${data?.Season || 'WINTER 26'}</div>
                <div>Qty :${data?.Qty || '5149'} / Sec</div>
                <div style="margin:3px 0;border-bottom:1px solid #ccc;"></div>
                <div>Ord Date :${formatDate(data?.OrderDate) || '03-12-2025'}</div>
                <div>Del Date :${formatDate(data?.OurDelvDate) || '08-01-2026'}</div>
                <div style="color:#d9534f;font-weight:bold;">5 Days on Overdue</div>
                <div style="margin:3px 0;border-bottom:1px solid #ccc;"></div>
                <div>Y/F : ${data?.ReqQty ? '1/1/1' : '1/1/1'}</div>
                <div>Acc : ${data?.InwQty ? '0/1/1' : '0/1/1'}</div>
                <div>Q/P : ${data?.WIPQty ? '0/1/1' : '0/1/1'}</div>
                <div><a href="#" style="color:#007bff;font-weight:bold;">Comments (3)</a></div>
              </div>
            `;
          }
        }
        // Apply aliceblue background to all row header cells for visual grouping
        (args.cell as HTMLElement).style.background = 'aliceblue';
      }
      // Value cells: append units (Kgs/%) to numeric values
      else if (cell.axis === "value") {
        // Guard: exit early if cell data is missing
        if (!cell?.actualText || !args?.cell) {
          return;
        }
        // Get the field name and formatted value from the cell
        const field = cell.actualText as string;
        let value = (cell.formattedText as string) || '-';
        // Append appropriate unit suffix based on field name
        if (value !== '-') {
          if (field.includes('Qty')) {
            value += ' Kgs';
          } else if (field.includes('Per')) {
            value += ' %';
          }
        }
        // Update the cell display element with formatted value and unit
        const element = args.cell.querySelector('.e-cellvalue') as HTMLElement;
        if (element) {
          element.textContent = value;
        }
        // Apply background color to value cells for visual distinction
        (args.cell as HTMLElement).style.background = 'aliceblue';
      }
    }
  };

  // Customize header cell appearance and text
  const headerCellInfo = (args: HeaderCellInfoEventArgs) => {
    if (args && args.node && args.cell && args.cell.colIndex < 2 && pivotObj && pivotObj.dataSourceSettings.dataSource) {
      const headerElement: HTMLElement = (args.node.querySelector('.e-headercell-container') as HTMLElement);
      headerElement.innerHTML = "";
      headerElement.textContent = (pivotObj.dataSourceSettings.rows as FieldOptions[])[args.cell.colIndex].caption;
      headerElement.style.borderRight = "1px solid #ccc";
      headerElement.style.display = "block";
      headerElement.style.textAlign = "center";
      headerElement.style.width = "100%";
    }
  }

  // Set column width for row header
  const columnRender = (args: ColumnRenderEventArgs) => {
    if (args && args.columns && args.columns[1]) {
      args.columns[1].width = 220;
    }
  }

  function onChange(args: any) {
    if (!args.checked) {
      pivotObj.gridSettings.layout = "Compact";
    } else {
      pivotObj.gridSettings.layout = "Tabular";
    }
  }

  return (
    <div style={{ height: "100vh" }}>
      <div id="pivot-table-section">
        <div className="tabular-layout-switch">
          <label id="layout-label" htmlFor="layout-switch">Classic Layout</label>
          <SwitchComponent id="layout-switch" checked={true}
            cssClass="pivot-layout-switch" change={onChange}>
          </SwitchComponent>
        </div>
        <div style={{ height: "95vh", overflow: "hidden" }}>
          <PivotViewComponent id="PivotView" ref={(scope: any) => { pivotObj = scope; }}
            dataSourceSettings={dataSourceSettings} width={"100%"} height={"100%"}
            showFieldList={true} showToolbar={true}
            allowExcelExport={true} allowPdfExport={true}
            allowNumberFormatting={true} allowConditionalFormatting={true}
            allowCalculatedField={true}
            displayOption={{ view: "Table" }}
            toolbar={toolbarOptions} toolbarRender={beforeToolbarRender}
            newReport={newReport} renameReport={renameReport}
            removeReport={removeReport} loadReport={loadReport}
            fetchReport={fetchReport} saveReport={saveReport}
            chartSettings={{ title: "Sales Analysis", load: chartOnLoad }}
            gridSettings={{
              layout: "Tabular",
              columnWidth: 140,
              rowHeight: 20,
              columnRender: columnRender,
              headerCellInfo: headerCellInfo,
              queryCellInfo: queryCellInfo
            }}>
            <Inject services={[
              FieldList, CalculatedField, Toolbar, PDFExport, ExcelExport,
              ConditionalFormatting, NumberFormatting
            ]} />
          </PivotViewComponent>
        </div>
      </div>
    </div>
  );
}

export default Pivot;