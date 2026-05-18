
import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import './ShowCase.css';
import '../../../../App.css';
import Layout from './ShowCase/layout';
import ImageViewer from './ShowCase/imageEditor';
import SpreadSheet from './ShowCase/excel';
import DocEditor from './ShowCase/docEditor';
import PdfViewer from './ShowCase/pdfViewer';
import About from './ShowCase/about';

function ShowCase() {
  
return (
    <Routes>
      <Route path="/" element={<Layout />} />
      <Route path="imageViewer" element={<ImageViewer />} />
      <Route path="spreadSheet" element={<SpreadSheet />} />
      <Route path="docEditor" element={<DocEditor />} />
      <Route path="pdfViewer" element={<PdfViewer />} />
      <Route path="about" element={<About />} />
    </Routes>
  );

}

export default ShowCase;