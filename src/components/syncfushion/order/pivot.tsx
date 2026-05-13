
import * as React from 'react';
import {
  PivotViewComponent,
  Inject,
  FieldList,
  CalculatedField,
  Toolbar,
  PDFExport,
  ExcelExport,
  ConditionalFormatting,
  NumberFormatting,
  ToolbarItems,
  QueryCellInfoEventArgs,
  IDataSet
} from '@syncfusion/ej2-react-pivotview';
import { SwitchComponent } from '@syncfusion/ej2-react-buttons';
import { createElement } from '@syncfusion/ej2-base';

let pivotObj: PivotViewComponent;;

const dataSourceSettings = {
  enableSorting: true,
  columns: [{ name: 'buyer' }],
  valueSortSettings: { headerDelimiter: ' - ' },
  values: [{ name: 'slno', caption: 'Units Sold' }, { name: 'merch' }],
  rows: [{ name: 'jobno', expandAll: true }, { name: 'ordimg' }, { name: 'hex' }],
  formatSettings: [],
  expandAll: true,
  filters: [{ name: 'production_unit' }],
  showRowSubTotals: false 
};

function PivotTableExporting() {
  React.useEffect(
    () => {
      fetch('https://app.herofashion.com/ord_prn/').then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      }).then(data => {
        console.log('Fetched data:', data);
        if (pivotObj) {
          pivotObj.dataSourceSettings.dataSource = data;
        }
      }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
    }, []
  )

  const toolbarOptions: ToolbarItems[] = [
    'New', 'Save', 'SaveAs', 'Rename', 'Remove', 'Load',
    'Grid', 'Chart', 'Export', 'SubTotal', 'GrandTotal',
    'Formatting', 'FieldList'
  ];

  const saveReport = (args: any) => {
    let reports: any[] = [];
    let isSaved = false;

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reports = JSON.parse(localStorage.pivotviewReports);
    }

    if (args.report && args.reportName && args.reportName !== '') {
      reports.forEach(item => {
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

    reportCollection.forEach(item => reportList.push(item.reportName));
    args.reportName = reportList;
  };

  const loadReport = (args: any) => {
    let reportCollection: any[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportCollection.forEach(item => {
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

    reportCollection = reportCollection.filter(item => item.reportName !== args.reportName);
    localStorage.pivotviewReports = JSON.stringify(reportCollection);
  };

  const renameReport = (args: any) => {
    let reportsCollection: any[] = [];

    if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
      reportsCollection = JSON.parse(localStorage.pivotviewReports);
    }

    reportsCollection.forEach(item => {
      if (args.reportName === item.reportName) {
        item.reportName = args.rename;
      }
    });

    localStorage.pivotviewReports = JSON.stringify(reportsCollection);
  };

  const newReport = () => {
    if (pivotObj) {
      pivotObj.setProperties({ dataSourceSettings: { columns: [], rows: [], values: [], filters: [] } }, false);
    }
  };

  const beforeToolbarRender = (args: any) => {
    args.customToolbar.splice(6, 0, { type: 'Separator' });
    args.customToolbar.splice(9, 0, { type: 'Separator' });
  };

  const chartOnLoad = (args: any) => {
    let selectedTheme = location.hash.split("/")[1];
    selectedTheme = selectedTheme ? selectedTheme : "Material";
    args.chart.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1))
      .replace(/-dark/i, "Dark")
      .replace(/contrast/i, 'Contrast')
      .replace(/-highContrast/i, 'HighContrast');
  };

  const queryCellInfo = (args: QueryCellInfoEventArgs) => {
    let colIndex: number = Number((args.cell as Element).getAttribute('aria-colindex')) - 1;
    let currentCellData = (args.data as any)[colIndex];
    let currentCellElement: HTMLElement = args.cell as HTMLElement;
    if(!currentCellData || !currentCellElement) {
      return;
    }
    let datasource: IDataSet[] = (pivotObj).dataSourceSettings.dataSource as IDataSet[];
    // Get the current cell information here.
    let cell = (pivotObj).pivotValues[currentCellData.rowIndex][currentCellData.colIndex];
    // Get the last row header from the current cell information here to get the indexObject.
    let indexCell = (pivotObj).pivotValues[currentCellData.rowIndex][pivotObj.engineModule.rowMaxLevel];
    let indexObject: any = indexCell.indexObject;
    let indexes: any = Object.keys(indexObject);

    // Check for the first row field member.
    if (cell.axis === 'row') {
      if (cell.level === 0 && cell.hasChild) {
        // Customize the first row header to display multiple field names from its raw data.        
        ((currentCellElement as Element).querySelector('.e-cellvalue') as HTMLElement).innerHTML = `<div>${datasource[indexes[0]].jobno}</div><div>${datasource[indexes[0]].clrcomb}</div><div>${datasource[indexes[0]].buyer}</div>`;
      }
      if (cell.valueSort) {
        if (cell.valueSort.axis === 'ordimg') {
          let imgElement = createElement('img', {
            className: 'ecustom-cell',
            attrs: {
              'src': currentCellData.actualText || 'https://via.placeholder.com/50', // fallback
              'alt': 'No Img',
              'width': '50',
              'height': '50'
            },
          });
          if (currentCellElement.firstElementChild) {
            (currentCellElement.firstElementChild.querySelector('.e-cellvalue') as HTMLElement).textContent = '';
            currentCellElement.firstElementChild.appendChild(imgElement);
          }
        } else if (cell.valueSort.axis === 'hex') {
          let color = (currentCellElement.querySelector('.e-cellvalue') as HTMLElement).textContent;
          currentCellElement.style.background = color;
        }
      }
    } else if (cell.axis === 'value') {
      if (typeof currentCellData.value === 'number' && currentCellData.actualText === "slno" && !currentCellData.isGrandSum) {
        let imgElement = createElement('img', {
          className: 'ecustom-cell',
          attrs: {
            'src': (datasource[indexes[0]].ordimg as string) || 'https://via.placeholder.com/50', // fallback
            'alt': 'No Img',
            'width': '50',
            'height': '50'
          },
        });
        if (currentCellElement.firstElementChild) {
          currentCellElement.firstElementChild.textContent = '';
          currentCellElement.firstElementChild.appendChild(imgElement);
        }
      } else if (currentCellData.actualText === "slno" && currentCellData.isGrandSum) {
        if (currentCellElement.firstElementChild) {
          currentCellElement.firstElementChild.textContent = '';
        }
      }
    }
  }
 function onChange(args:any) {
      if(!args.checked)
      {
        pivotObj.gridSettings.layout = 'Compact';
      }
      else
      {
        pivotObj.gridSettings.layout = 'Tabular';
      }
        
    }

  return (
    <div style={{ height: '100vh'}}>
      <div id='pivot-table-section'>
        <div className="tabular-layout-switch">
                    <label id="layout-label" htmlFor="layout-switch">Classic Layout</label>
                    <SwitchComponent id="layout-switch" checked={true} cssClass="pivot-layout-switch" change={onChange}></SwitchComponent>
        </div>
        <div style={{ height:'95vh', overflow: 'hidden' }}>
        <PivotViewComponent
          id='PivotView'
          ref={(scope: any) => { pivotObj = scope; }}
          dataSourceSettings={dataSourceSettings}
          width={'100%'}
          gridSettings={{layout:'Tabular',columnWidth: 140, rowHeight: 80, queryCellInfo: queryCellInfo }}
          height={'100%'}
          showFieldList={true}
          allowExcelExport={true}
          allowNumberFormatting={true}
          allowConditionalFormatting={true}
          allowPdfExport={true}
          showToolbar={true}
          allowCalculatedField={true}
          displayOption={{ view: 'Table' }}
          toolbar={toolbarOptions}
          newReport={newReport}
          renameReport={renameReport}
          removeReport={removeReport}
          loadReport={loadReport}
          fetchReport={fetchReport}
          saveReport={saveReport}
          toolbarRender={beforeToolbarRender}
          chartSettings={{ title: 'Sales Analysis', load: chartOnLoad }}
        >
          <Inject services={[
            FieldList,
            CalculatedField,
            Toolbar,
            PDFExport,
            ExcelExport,
            ConditionalFormatting,
            NumberFormatting
          ]} />
        </PivotViewComponent>
      </div>
      </div>
    </div>
  );
}

export default PivotTableExporting;