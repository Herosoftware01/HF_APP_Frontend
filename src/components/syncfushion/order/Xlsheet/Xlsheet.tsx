// import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
// export default function App() {
//     return (<SpreadsheetComponent />);
// }



import * as React from 'react';
import { SpreadsheetComponent, SheetsDirective, ColumnsDirective, ColumnDirective, SheetDirective, RangesDirective, RangeDirective } from '@syncfusion/ej2-react-spreadsheet';
import { createElement } from '@syncfusion/ej2-base';


function Spreadsheet() {

  const spreadsheetRef = React.useRef<SpreadsheetComponent>(null);
  const [data, setData] = React.useState<any[]>([]);

  // Fetch data on mount
  React.useEffect(() => {
    fetch('https://app.herofashion.com/web_socket/')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('API error:', err));
  }, []);


  // Triggers after the spreadsheet is created.
  const onCreated = () => {
    // Apply styles to the specified range in the active sheet.
    spreadsheetRef.current?.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }, 'A1:F1');
  }

  // Triggers before the save action begins in spreadsheet.
  const beforeSave = (args: any) => {
    args.needBlobData = true; // To trigger the saveComplete event.
    args.isFullPost = false; // Get the spreadsheet data as blob data in the saveComplete event
  }

  // Triggers once the save action completes in spreadsheet.
  const saveComplete = (args: any) => {
    console.log('Blob Data', args.blobData);
    let anchor: any = createElement('a', {
      attrs: { download: 'Sample.xlsx' },
    });
    const url = URL.createObjectURL(args.blobData);;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  }

  return (<SpreadsheetComponent
    ref={spreadsheetRef}
    height={600}
    openUrl="http://10.1.21.10:6002/api/spreadsheet/open"
    saveUrl="http://10.1.21.10:6002/api/spreadsheet/save"
    created={onCreated}
    // beforeSave={beforeSave}
    // saveComplete={saveComplete}
  >
    <SheetsDirective>
      <SheetDirective>
        <RangesDirective>
          <RangeDirective dataSource={data} startCell="A1" />
        </RangesDirective>
        <ColumnsDirective>
          <ColumnDirective width={100}></ColumnDirective>
          <ColumnDirective width={200}></ColumnDirective>
          <ColumnDirective width={100}></ColumnDirective>
          <ColumnDirective width={100}></ColumnDirective>
          <ColumnDirective width={250}></ColumnDirective>
          <ColumnDirective width={100}></ColumnDirective>
        </ColumnsDirective>
      </SheetDirective>
    </SheetsDirective>
  </SpreadsheetComponent>);
}

export default Spreadsheet;