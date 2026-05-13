import * as React from 'react';
import { SpreadsheetComponent, SheetsDirective, ColumnsDirective, ColumnDirective, SheetDirective, RangesDirective, RangeDirective } from '@syncfusion/ej2-react-spreadsheet';
import { createElement } from '@syncfusion/ej2-base';


function Spreadsheet() {

  const spreadsheetRef = React.useRef<SpreadsheetComponent>(null);
  const [data, setData] = React.useState<any[]>([]);
  const [topOffset, setTopOffset] = React.useState<number>(45);

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

  React.useEffect(() => {
    const updateOffset = () => {
      const hdr = document.querySelector('header');
      if (!hdr) {
        return;
      }
      //Calculate the header element height.
      const offset = hdr ? Math.ceil((hdr as HTMLElement).getBoundingClientRect().height) : 56;
      setTopOffset(offset + 6);
    };
    //Update margin top for the parent element of Spreadsheet based on header element height.
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  return (<div style={{ marginTop: topOffset, height: `calc(100vh - ${topOffset}px)`, overflow: 'auto' }}>
    <SpreadsheetComponent
    ref={spreadsheetRef}
    openUrl="http://localhost:6002/api/spreadsheet/open"
    saveUrl="http://localhost:6002/api/spreadsheet/save"
    created={onCreated}
    beforeSave={beforeSave}
    saveComplete={saveComplete}
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
  </SpreadsheetComponent>
</div>);
}

export default Spreadsheet;