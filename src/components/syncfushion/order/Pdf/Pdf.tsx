import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {
    PdfViewerComponent, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer,Inject
} from '@syncfusion/ej2-react-pdfviewer';
import './style.css';

function Default() {
    let viewer: PdfViewerComponent;
    return (<div>
        <div className='control-section'>
            {/* Render the PDF Viewer */}
            <PdfViewerComponent ref={(scope: any) => { viewer = scope; }} id="container" documentPath="https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf" resourceUrl = "https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib" style={{ 'height': '640px' }}>
                <Inject services={[Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner,PageOrganizer]} />
            </PdfViewerComponent>
        </div>
    </div>
    );
}
export default Default;