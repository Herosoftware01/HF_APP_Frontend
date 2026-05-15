import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  Annotation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  TextSearch,
  FormFields,
  FormDesigner,
  Inject
} from '@syncfusion/ej2-react-pdfviewer';
import TopToolbar from './topToolbar';

function PdfViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const viewer = useRef<PdfViewerComponent | null>(null);

  /** Triggered when the PDF Viewer is created */
  const create = (): void => {
    if (viewer.current && data?.url) {
      // Delay to ensure viewer is fully initialized
      setTimeout(() => {
        viewer.current?.load(data.url, '');
      }, 1000);
    }
  };

  /** Handle back navigation */
  const handleBackClick = (): void => {
    if (viewer.current) {
      viewer.current.destroy();
    }

    const query = {
      preview: data.name,
      path: data.path
    };

    navigate('/sy-order/explor', { state: { query } });
  };

  /** Triggered when document loading is completed */
  const documentLoad = (): void => {
    if (!viewer.current) return;

    const fileName: string = data.name;
    const extension = fileName.split('.').pop();

    if (extension === 'pptx') {
      const pdfName = fileName.replace(/\.[^.]+$/, '.pdf');
      viewer.current.downloadFileName = pdfName;
    } else {
      viewer.current.downloadFileName = fileName;
    }
  };

  return (
    <div className="control-section">
      <TopToolbar onBackClick={handleBackClick} fileName={data.name} />

      <PdfViewerComponent
        id="container"
        ref={(scope: PdfViewerComponent | null) => {
          viewer.current = scope;
        }}
        resourceUrl="https://cdn.syncfusion.com/ej2/23.1.43/dist/ej2-pdfviewer-lib"
        height="calc(100vh - 70px)"
        created={create}
        documentLoad={documentLoad}
      >
        <Inject
          services={[
            Toolbar,
            Magnification,
            Navigation,
            Annotation,
            LinkAnnotation,
            BookmarkView,
            ThumbnailView,
            Print,
            TextSelection,
            TextSearch,
            FormFields,
            FormDesigner
          ]}
        />
      </PdfViewerComponent>
    </div>
  );
}

export default PdfViewer;