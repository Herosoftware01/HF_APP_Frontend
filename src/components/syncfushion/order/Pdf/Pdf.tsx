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
    PdfSolidBrush,
    PdfColor,
    PdfPageTemplateElement,
    PdfTextAlignment,
    PdfFontFamily,
    PdfVerticalAlignment,
    PdfPageNumberField,
    PdfPageCountField,
    PdfNumberStyle,
    PdfCompositeField,
} from '@syncfusion/ej2-pdf-export';

function Default() {
    let viewer: PdfViewerComponent;
    async function fetchData() {
        const response = await fetch('https://app.herofashion.com/web_socket/');

        const data = await response.json(); // read raw text first

        console.log(data);
        const document = new PdfDocument();
        const page = document.pages.add();
        let hfont = new PdfStandardFont(2, 20);
        let brush = new PdfSolidBrush(new PdfColor(0, 0, 0));
        let bounds = new RectangleF(0, 0, 515, 50);
        let bounds1: RectangleF = new RectangleF(
            0,
            0,
            document.pages.getPageByIndex(0).getClientSize().width,
            100
        );
        let headerEntry = new PdfPageTemplateElement(bounds1);
        let entry: any = null;
        headerEntry.graphics.drawString(
            'Hero Fashion',
            hfont,
            entry,
            brush,
            200,
            0,
            300,
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
        grid.repeatHeader = true;
        const header = grid.headers.getHeader(0);

        const headerFont = new PdfStandardFont(2, 20);

        for (let i = 0; i < columns.length; i++) {
            const cell = header.cells.getCell(i);
            cell.value = columns[i];
            cell.style.font = headerFont;
        }
        data.forEach((item: any) => {
            const row = grid.rows.addRow();
            row.height = 350;
            row.cells.getCell(0).stringFormat.lineAlignment =
                PdfVerticalAlignment.Middle;
            row.cells.getCell(1).stringFormat.lineAlignment =
                PdfVerticalAlignment.Middle;
            row.cells.getCell(2).stringFormat.lineAlignment =
                PdfVerticalAlignment.Middle;
            row.cells.getCell(3).stringFormat.lineAlignment =
                PdfVerticalAlignment.Middle;
            row.cells.getCell(4).stringFormat.lineAlignment =
                PdfVerticalAlignment.Middle;
            row.cells.getCell(5).stringFormat.lineAlignment =
                PdfVerticalAlignment.Middle;

            row.cells.getCell(0).style.font = new PdfStandardFont(
                PdfFontFamily.Helvetica,
                20
            );
            row.cells.getCell(1).style.font = new PdfStandardFont(
                PdfFontFamily.Helvetica,
                20
            );
            row.cells.getCell(2).style.font = new PdfStandardFont(
                PdfFontFamily.Helvetica,
                20
            );
            row.cells.getCell(3).style.font = new PdfStandardFont(
                PdfFontFamily.Helvetica,
                20
            );
            row.cells.getCell(4).style.font = new PdfStandardFont(
                PdfFontFamily.Helvetica,
                20
            );
            row.cells.getCell(5).style.font = new PdfStandardFont(
                PdfFontFamily.Helvetica,
                20
            );
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
        let brushes: PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
        let footer: PdfPageTemplateElement = new PdfPageTemplateElement(bounds1);
        let pageNumber: PdfPageNumberField = new PdfPageNumberField(
            headerFont,
            brushes
        );
        let pageCount: PdfPageCountField = new PdfPageCountField(headerFont);
        pageNumber.numberStyle = PdfNumberStyle.Numeric;
        let compositeField: PdfCompositeField = new PdfCompositeField(
            headerFont,
            brush,
            'Page {0} of {1}',
            pageNumber,
            pageCount
        );
        compositeField.bounds = footer.bounds;
        compositeField.draw(footer.graphics, new PointF(200, 40));
        document.template.bottom = footer;
        grid.draw(page, new PointF(0, 0), layoutFormat);
        //document.save();
        document.save().then((xlBlob) => {
            const reader = new FileReader();
            reader.readAsArrayBuffer(xlBlob.blobData);

            reader.onload = () => {
                if (reader.readyState === FileReader.DONE) {
                    const arrayBuffer = reader.result;

                    // ✅ Convert to byte array
                    const byteArray = new Uint8Array(arrayBuffer as ArrayBuffer);

                    // ✅ Pass byteArray to load API
                    viewer.load(byteArray, '');
                }
            };
        });

        document.destroy();
    }
    function loadPdf() {
        //load PDF using Server API
        viewer.load('https://hfapi.herofashion.com/syncfushion/get-pdf/SKM_306i26012812130.pdf/', '')
    }
    async function savePdf() {
        //get the loaded PDF in Viewer
        viewer.saveAsBlob().then((blobData) => {
            const formData = new FormData();

            formData.append("file", blobData, "document.pdf");

            fetch("https://hfapi.herofashion.com/syncfushion/upload-pdf/", {
                method: "POST",
                body: formData
            })
                .then(res => res.json())
                .then(data => alert(data.message))
                .catch(err => alert(`Upload error: ${err}`));
        });
    }
    function goToBookmark() {
        //this will works only if PDF has bookmarks
        const bookmarksData = viewer.bookmark.getBookmarks();

        const bookmarkList = bookmarksData?.bookmarks?.bookMark;
        const destinationList = bookmarksData?.bookmarksDestination?.bookMarkDestination;
        if (!bookmarkList || !destinationList) {
            alert('PDF has no bookmarks!')
            return;
        }
        //pass the required bookmark text to navigate
        findAndNavigate(bookmarkList, destinationList, 'What is Hive?');
    }
    function findAndNavigate(
        bookmarks: any[],
        destinationList: any[],
        targetTitle: string
    ): boolean {
        for (const bookmark of bookmarks) {
            // Match title
            if (bookmark.Title === targetTitle) {
                const destination = destinationList[bookmark.Id];
                if (destination) {
                    //navigate to specific bookmark 
                    viewer.bookmark.goToBookmark(
                        destination.PageIndex,
                        destination.Y
                    );
                    return true; // stop traversal
                }
            }
            // Traverse children if present
            if (bookmark.HasChild && Array.isArray(bookmark.Child)) {
                const found = findAndNavigate(
                    bookmark.Child,
                    destinationList,
                    targetTitle
                );
                if (found) {
                    return true;
                }
            }
        }
        return false;
    }
    return (<div>
        <div className='control-section'>
            <button onClick={loadPdf}>Load PDF from server</button>
            <br />
            <button onClick={savePdf}>Save PDF to server</button>
            <br />
            <button onClick={goToBookmark}>Go to specific bookmark</button>
            {/* Render the PDF Viewer */}
            <PdfViewerComponent ref={(scope: any) => { viewer = scope; }} id="container" resourcesLoaded={fetchData} resourceUrl="https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib" style={{ 'height': '640px' }}>
                <Inject services={[Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer]} />
            </PdfViewerComponent>
        </div>
    </div>
    );
}
export default Default;