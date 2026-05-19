import { useState, useEffect } from 'react';
import {
    PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer, Inject,
    ToolbarSettingsModel
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
    PdfFontFamily,
    PdfVerticalAlignment,
    PdfPageNumberField,
    PdfPageCountField,
    PdfNumberStyle,
    PdfCompositeField,
} from '@syncfusion/ej2-pdf-export';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
function Default() {
    // API Base URL constant
    const API_BASE_URL = 'http://localhost:8080/api/pdfviewer';

    let viewer: PdfViewerComponent;
    // ✅ Store only names as strings (not the full objects)
    const [pdfList, setPdfList] = useState<string[]>([]);
    useEffect(() => {
        fetch('https://hfapi.herofashion.com/syncfushion/list-pdfs/')
            .then(res => res.json())
            // ✅ Extract ONLY the names from the response
            .then(data => {
                const names = data.map((item: any) => item.name);
                setPdfList(names);
            })
            .catch(err => console.error('Failed to load PDF list:', err));
    }, []);
    const toolbarSettings: ToolbarSettingsModel = {
        showTooltip: true, toolbarItems: ['OpenOption', 'UndoRedoTool', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'SelectionTool', 'CommentTool', 'SubmitForm', 'AnnotationEditTool', 'RedactionEditTool', 'FormDesignerEditTool', 'SearchOption', 'PrintOption', 'DownloadOption']
    };
    // ✅ Since pdfList is now just strings, we don't need remoteFields
    // const remoteFields: Object = { text: 'name', value: 'name' };
    async function fetchData() {
        const response = await fetch('https://app.herofashion.com/web_socket/');

        const data = await response.json(); // read raw text first
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
    async function addHeader() {
        try {
            // 1️⃣ Fetch JSON data from web_socket
            const response = await fetch(
                "https://app.herofashion.com/web_socket/"
            );

            const jsonData = await response.json();
            // jsonData will be:
            // [{ buyerid, buyername, orderno, date, guid, refresh }]

            // 2️⃣ Get PDF from viewer
            const blobData: Blob = await viewer.saveAsBlob();

            // 3️⃣ Convert PDF Blob → Base64
            const base64String = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blobData);
            });

            // 4️⃣ Build payload (NO manual JSON stringify tricks)
            const payload = {
                base64String: base64String,
                data: jsonData // ✅ directly pass fetched JSON
            };

            // 5️⃣ Call AddTemplate API
            const apiResponse = await fetch(
                `${API_BASE_URL}/AddTemplate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const updatedBase64 = await apiResponse.text();

            // 6️⃣ Load updated PDF back into viewer
            viewer.load(updatedBase64, "");

        } catch (error) {
            console.error("AddHeader failed:", error);
        }
    }
    async function performOCR() {
        try {
            // 1️⃣ Get PDF from Syncfusion Viewer as Blob
            const blobData: Blob = await viewer.saveAsBlob();

            // 2️⃣ Convert Blob → Base64
            const base64String = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blobData);
            });

            // 3️⃣ Prepare payload (MATCHES server)
            const payload = {
                base64String: base64String
            };

            // 4️⃣ Call PerformOCR API
            const response = await fetch(
                `${API_BASE_URL}/PerformOCR`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            // 5️⃣ Get OCR‑processed PDF (Base64)
            const updatedBase64 = await response.text();

            // 6️⃣ Load OCR PDF back into viewer
            viewer.load(updatedBase64, "");

        } catch (error) {
            console.error("OCR failed:", error);
        }
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
    async function onPdfSelect(args: any) {
        // ✅ Prevent default navigation
        if (args?.preventDefault) args.preventDefault();
        if (args?.stopPropagation) args.stopPropagation();

        if (!args?.value) return;

        try {
            const pdfName = args.value;

            const fullUrl = `https://hfapi.herofashion.com/syncfushion/get-pdf/${pdfName}`;

            // ✅ Fetch PDF as blob to prevent page navigation
            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            //load the PDF in Viewer
            viewer.documentPath = fullUrl;

        } catch (error) {
            console.error('PDF load error:', error);
            alert(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
            <button onClick={addHeader}>Add Header</button>
            <br />
            <button onClick={performOCR}>Perform OCR</button>
            <br />
            <button onClick={savePdf}>Save PDF to server</button>
            <br />
            <button onClick={goToBookmark}>Go to specific bookmark</button>
            {/* ✅ Dropdown now uses simple string array */}
            <DropDownListComponent
                id="customers"
                dataSource={pdfList}
                sortOrder="Ascending"
                placeholder="Select the PDF to load in Viewer"
                popupHeight="220px"
                change={(args: any) => onPdfSelect(args)}
            />
            {/* Render the PDF Viewer */}
            <PdfViewerComponent ref={(scope: any) => { viewer = scope; }} id="container" resourcesLoaded={fetchData} resourceUrl="https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib" toolbarSettings={toolbarSettings} style={{ 'height': '640px' }}>
                <Inject services={[Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer]} />
            </PdfViewerComponent>
        </div>
    </div>
    );
}
export default Default;