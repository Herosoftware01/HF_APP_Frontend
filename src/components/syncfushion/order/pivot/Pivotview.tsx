/* Syncfusion Pivot Table - Order Management Dashboard
   Features: Sort, Filter, Group, Export, Conditional Formatting */
import * as React from "react";
import { useState } from "react";
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
    { name: "img1" },
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

function PivotTableExporting() {
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

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

  // Toolbar buttons - reorder or remove items as needed
  const toolbarOptions: ToolbarItems[] = [
    "New", "Save", "SaveAs", "Rename", "Remove", "Load", "Grid", "Chart", "Export",
    "SubTotal", "GrandTotal", "Formatting", "FieldList",
  ];

  // Save report to localStorage
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

  // Get saved report names for Load dropdown
  const fetchReport = (args: any) => {
    let reportCollection: any[] = [];
    let reportList: string[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportCollection.forEach((item) => reportList.push(item.reportName));
    args.reportName = reportList;
  };

  // Load selected report from localStorage
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

  // Remove report from localStorage
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

  // Rename saved report
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

  // Reset pivot to empty state
  const newReport = () => {
    if (pivotObj) {
      pivotObj.setProperties(
        { dataSourceSettings: { columns: [], rows: [], values: [], filters: [] } }, false
      );
    }
  };

  // Add separator lines in toolbar at positions 6 and 9
  const beforeToolbarRender = (args: any) => {
    args.customToolbar.splice(6, 0, { type: "Separator" });
    args.customToolbar.splice(9, 0, { type: "Separator" });
  };

  // Set chart theme based on URL hash, default to Material
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


  // Custom cell rendering - modifies row headers and value cell display
  const queryCellInfo = (args: QueryCellInfoEventArgs) => {
    if (pivotObj) {
      let colIndex: number = Number((args.cell as Element).getAttribute("aria-colindex")) - 1;
      let currentCellData = (args.data as any)[colIndex];
      let currentCellElement: HTMLElement = args.cell as HTMLElement;
      if (!currentCellData || !currentCellElement) { return; }
      let datasource: IDataSet[] = pivotObj.dataSourceSettings.dataSource as IDataSet[];
      let cell = pivotObj.pivotValues[currentCellData.rowIndex][currentCellData.colIndex];
      let indexCell = pivotObj.pivotValues[currentCellData.rowIndex][pivotObj.engineModule.rowMaxLevel - 1];
      let indexObject: any = indexCell.indexObject;
      let indexes: any = Object.keys(indexObject || {});
      const valuesArray = (pivotObj.dataSourceSettings.values as any[]) || [];
      const lastValueFieldName = valuesArray.length > 0 ? valuesArray[valuesArray.length - 1].name : null;
      if (cell.axis === "row") {
        if (cell.rowSpan) {
          const element: HTMLElement = currentCellElement.firstElementChild as HTMLElement;
          // Apply border to value header cells (last value field) to visually separate groups
          if (cell.type === 'value' && cell.actualText === lastValueFieldName) {
            (args.cell as HTMLElement).style.borderBottom = '2px solid #d32f2f';
            (args.cell as HTMLElement).style.background = 'aliceblue';
            (args.cell as HTMLElement).style.fontWeight = 'bold';
          }

          // Check if this cell contains an image URL (img1 field)
          const cellText = cell.formattedText || cell.actualText || '';
          const isImageUrl = (cellText as string).toLowerCase().includes('http') &&
            ((cellText as string).toLowerCase().includes('.jpg') ||
              (cellText as string).toLowerCase().includes('.jpeg') ||
              (cellText as string).toLowerCase().includes('.png') ||
              (cellText as string).toLowerCase().includes('.gif'));
          // Inserting image element for img1 field, styled to fit within cell
          if (isImageUrl && element) {
            element.innerHTML = '';
            element.textContent = '';
            const img = document.createElement('img');
            img.src = cellText as string;
            img.alt = "Order Image";
            img.width = 75;
            img.height = 75;
            img.style.borderRadius = "4px";
            img.style.objectFit = "cover";
            img.onerror = function () { img.src = 'https://via.placeholder.com/75?text=No+Image'; };
            element.appendChild(img);
            element.style.display = "flex";
            element.style.flexDirection = "column";
            element.style.justifyContent = "center";
            element.style.alignItems = "center";

            // Apply border-bottom only to img1 level
            (args.cell as HTMLElement).style.borderBottom = '2px solid #d32f2f';
            (args.cell as HTMLElement).style.background = 'transparent';
          }
          else if (cell.level === 0) {
            if (element) {
              element.innerHTML = '';
              element.textContent = cell.formattedText as string;
              element.style.color = "#007bff";
              element.style.fontWeight = "bold";
              element.style.display = "flex";
              element.style.flexDirection = "column";
              element.style.justifyContent = "center";
              element.style.alignItems = "center";
            }
            // Apply border-bottom to parent group level
            (args.cell as HTMLElement).style.borderBottom = '2px solid #d32f2f';
            (args.cell as HTMLElement).style.background = 'transparent';
          }
          else if (cell.level === 1) {
            const idx = indexes[0];
            const data = datasource[idx];
            const formatDate = (dateStr: any) => {
              if (!dateStr) return 'N/A';
              const date = new Date(dateStr);
              return date.toLocaleDateString('en-GB');
            };
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
            // Apply border-bottom to Order Details row to align with image
            (args.cell as HTMLElement).style.borderBottom = '2px solid #d32f2f';
            (args.cell as HTMLElement).style.background = 'aliceblue';
          }
        } else {
          // Child rows - no border, light background
          (args.cell as HTMLElement).style.background = 'aliceblue';
        }
      }
      // Value cells: append units (Kgs/%) to numeric values
      else if (cell.axis === "value") {
        if (!cell?.actualText || !args?.cell) {
          return;
        }
        const field = cell.actualText as string;
        let value = (cell.formattedText as string) || '-';
        if (value !== '-') {
          if (field.includes('Qty')) {
            value += ' Kgs';
          } else if (field.includes('Per')) {
            value += ' %';
          }
        }
        const element = args.cell.querySelector('.e-cellvalue') as HTMLElement;
        if (element) {
          element.textContent = value;
        }
        (args.cell as HTMLElement).style.background = 'aliceblue';

        // Get all row axis cells to find parent group boundaries
        const rowAxisColumns = pivotObj.engineModule.rowMaxLevel;
        const rowIndexInfo = pivotObj.pivotValues[currentCellData.rowIndex][rowAxisColumns - 1];
        const nextRowData = pivotObj.pivotValues[currentCellData.rowIndex + 1];

        // Check if this is the last row of a parent group
        let isLastRowOfGroup = false;

        if (nextRowData) {
          const nextRowIndexInfo = nextRowData[rowAxisColumns - 1];
          // Get the parent level info (img1 or level 0)
          const currentParent = pivotObj.pivotValues[currentCellData.rowIndex][0];
          const nextParent = nextRowData[0];

          // If parent cell is different, we're at group boundary
          if (currentParent && nextParent && currentParent.formattedText !== nextParent.formattedText) {
            isLastRowOfGroup = true;
          }
        } else {
          // Last row in table
          isLastRowOfGroup = true;
        }

        if (isLastRowOfGroup) {
          (args.cell as HTMLElement).style.borderBottom = '2px solid #d32f2f';
        }
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

  // Set column width for second column
  const columnRender = (args: ColumnRenderEventArgs) => {
    if (args && args.columns && args.columns[1]) {
      args.columns[1].width = 220;
    }
  }

  // Toggle between Compact and Tabular layout
  function onChange(args: any) {
    if (!args.checked) {
      pivotObj.gridSettings.layout = "Compact";
    } else {
      pivotObj.gridSettings.layout = "Tabular";
    }
  }

  // Toggle tooltip visibility
  function onTooltipToggle(args: any) {
    if (pivotObj) {
      pivotObj.showTooltip = args.checked;
    }
  }

  return (
    <div style={{ height: "100vh" }}>
      <div id="pivot-table-section">
        <div className="tabular-layout-switch" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label id="layout-label" htmlFor="layout-switch">Classic Layout</label>
            <SwitchComponent id="layout-switch" checked={true}
              cssClass="pivot-layout-switch" change={onChange}>
            </SwitchComponent>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label id="tooltip-label" htmlFor="tooltip-switch">Show Tooltip</label>
            <SwitchComponent id="tooltip-switch" checked={showTooltip}
              cssClass="pivot-tooltip-switch" change={onTooltipToggle}>
            </SwitchComponent>
          </div>
        </div>
        <div style={{ height: "95vh", overflow: "hidden" }}>
          <PivotViewComponent id="PivotView" ref={(scope: any) => { pivotObj = scope; }}
            dataSourceSettings={dataSourceSettings} width={"100%"} height={"100%"}
            showFieldList={true} showToolbar={true} showTooltip={showTooltip}
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

export default PivotTableExporting;