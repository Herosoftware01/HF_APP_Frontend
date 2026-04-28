import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {
    PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer, Inject
} from '@syncfusion/ej2-react-pdfviewer';
import './style.css';
import {
    PdfDocument,
    PdfGrid,
    PdfGridLayoutFormat,
    PdfLayoutBreakType,
    PdfLayoutType,
    PdfStandardFont,
    RectangleF,
    PointF,
    PdfFontFamily,
    PdfBrushes,
    PdfSolidBrush,
    PdfColor,
    PdfPageTemplateElement,
} from '@syncfusion/ej2-pdf-export';

function Default() {
    let viewer: PdfViewerComponent;
    async function fetchData() {
        const response = await fetch('https://app.herofashion.com/web_socket/');

        const data = await response.json(); // read raw text first

        console.log(data);
        const document = new PdfDocument();
        const page = document.pages.add();
        let hfont = new PdfStandardFont(2, 13);
        let brush = new PdfSolidBrush(new PdfColor(0, 0, 0));
        let bounds = new RectangleF(0, 0, 515, 50);
        let headerEntry = new PdfPageTemplateElement(bounds);
        let entry = null;
        (headerEntry.graphics as any).drawString(
            'Hero Fashion',
            hfont,
            entry,
            brush,
            200,
            0,
            100,
            50,
            entry
        );
        const grid = new PdfGrid();
        const columns = [
            'Buyer ID',
            'Buyer Name',
            'Order No',
            'Date',
            'GUID',
            'Refresh',
        ];

        grid.columns.add(columns.length);
        grid.headers.add(1);
        const header = grid.headers.getHeader(0);
        const headerFont = new PdfStandardFont(2, 10);

        for (let i = 0; i < columns.length; i++) {
            const cell = header.cells.getCell(i);
            cell.value = columns[i];
            cell.style.font = headerFont;
        }
        data.forEach((item: any) => {
            const row = grid.rows.addRow();

            row.cells.getCell(0).value = String(item.buyerid ?? '');
            row.cells.getCell(1).value = item.buyername ?? '';
            row.cells.getCell(2).value = item.orderno ?? '';
            row.cells.getCell(3).value = item.date
                ? new Date(item.date).toLocaleDateString()
                : '';

            row.cells.getCell(4).value = item.guid ?? '';
            row.cells.getCell(5).value = item.refresh ?? '';
        });
        const layoutFormat = new PdfGridLayoutFormat();
        layoutFormat.break = PdfLayoutBreakType.FitPage;
        layoutFormat.layout = PdfLayoutType.Paginate;
        layoutFormat.paginateBounds = new RectangleF(
            0,
            20,
            page.getClientSize().width,
            page.getClientSize().height
        );
        document.template.top = headerEntry;
        grid.draw(page, new PointF(0, 0), layoutFormat);
        //document.save();
        document.save().then((xlBlob) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(xlBlob.blobData);

            reader.onload = () => {
                if (reader.readyState === FileReader.DONE) {
                    const arrayBuffer = reader.result;

                    const byteArray = new Uint8Array(arrayBuffer as ArrayBuffer);

                    //load the created PDF in Viewer
                    viewer.load(byteArray, '');
                }
            };
        });

        document.destroy();
    }

    return (<div>
        <div className='control-section'>
            {/* Render the PDF Viewer */}
            <PdfViewerComponent ref={(scope: any) => { viewer = scope; }} id="container" resourcesLoaded={fetchData} resourceUrl="https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib" style={{ 'height': '640px' }}>
                <Inject services={[Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer]} />
            </PdfViewerComponent>
        </div>
    </div>
    );
}
export default Default;