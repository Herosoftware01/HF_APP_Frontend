import '../order/style/style.css'
import '../../../App.css'

import {  Routes, Route, } from 'react-router-dom';
import HeroFashionGrid13 from "../order/ord_order.tsx"
import IframeBold from "../order/sync_iframe.jsx"
import HrReportGrid from "../order/ord1 ok.tsx"
import TallyBalanceReport from "../order/tally.tsx"
import OrdPagination from "../order/ord_pagination.tsx"
import PrnReportGrid from "../order/Print.tsx"
import CardGrid from './Card.jsx';
import Card1 from '../order/card/Card.jsx';
import Card2 from '../order/card/Card2.jsx';
import Sample from '../order/Sample.tsx';
import StoreGrid from '../order/StoreGrid.tsx';
import MultiQuality from '../order/MultiQuality.jsx';
import PRN from '../order/ord_prn.tsx';
import TemplateGallery from '../order/BlockEditor/eblockeditor.tsx';
import Excel from '../order/excel.tsx';
import FabricForm from '../fabric/Fabric.jsx';
import Signin1 from '../layout/Signup.tsx';
import OrderOms from "../order/Order_oms.tsx";
import HeroFashionGrid131 from "../order/ord_parent.tsx";
import Schedule from "../order/Schedule.tsx"
import GanttChart from '../order/Gantt_Chart/GanttChart.tsx';
import OrderDetails from '../order/OrderDetails.tsx';
import ForeignKeyColumn from '../order/SyncForignkey.tsx';
import Pivot from '../order/pivot/Pivotview.tsx'; 
import Adaptive from '../order/AdaptiveCardSync.tsx';
import Kanban from '../order/Kanban/Kanban.jsx';
import Quary from '../order/sync_quarybuilder.tsx';
import Form from "../order/Form/Form.tsx";
import Websocket from "../order/websocket.jsx"
import Weborder from "../order/web_order.tsx"
import "../order/Global.tsx"
import Formbuilder from '../order/FormBuilder/formbuilder.tsx'; 
import Dashboard from '../DashboardListing/DashboardListing.jsx'
import Embedd from '../DashboardListing/Dashboardnew.jsx'
import Pdf from "../order/Pdf/Pdf.tsx"
import HeroFashionGrid1311 from '../order/PrintingSync.jsx'
import Optimize from '../order/ord_order_opt.tsx'
import Spreadsheet from '../order/Spreadsheet/Spreadsheet.tsx'
import Word from '../order/Word/Word.tsx'
import Smartpaste from '../order/Smart_Paste/Smartpaste.tsx'
import Speech from '../order/Speak/Speech.tsx'
// import Explorer from '../order/DocumentExplorer/ShowCase.tsx';
import Explorer from '../order/DocumentExplorer/Explorer.tsx';
import Floor from '../order/Floor_Plan/Floor.tsx';
import ImageEditor from '../order/Image_Editor/ImageEditor.tsx';
import LogicCircut from '../order/Logic_Circut/LogicCircut.tsx';
import Webmail from '../order/Web_Mail/Webmail.tsx';
import Rk from '../order/Rk.tsx';
import CuttingDeliveryGrid from '../order/CuttingGrid/CuttingGrid.tsx';

function Home() {
  return (
    <Routes>
        <Route path="/" element={<CardGrid />} />
        <Route path="/order" element={<HeroFashionGrid13 />} />
        <Route path="/sync_iframe" element={<IframeBold />} />
        <Route path="/HrReportGrid" element={<HrReportGrid />} /> 
        <Route path="/OrdPagination" element={<OrdPagination />} /> 
        <Route path='/store' element= {<StoreGrid />} />
        <Route path="/TallyBalanceReport" element={<TallyBalanceReport />} /> 
        <Route path="/PrnReportGrid" element={<PrnReportGrid />} /> 
        <Route path="/card1" element={<Card1 />} /> 
        <Route path="/card2" element={<Card2 />} /> 
        <Route path="/sample" element={<Sample />} /> 
        <Route path="/mulitquality" element={<MultiQuality/>} />
        <Route path="/Schedule" element={<Schedule />} /> 
        <Route path="/PRN" element={<PRN />} /> 
        <Route path="/Excel" element={<Excel />} />
        <Route path="/TemplateGallery" element={<TemplateGallery />} /> 
        <Route path="/fabric" element={<FabricForm />} /> 
        <Route path='/signup' element={<Signin1 />} />
        <Route path='/order_oms' element={<OrderOms />} />
        <Route path='/HeroFashionGrid131' element={<HeroFashionGrid131 />} />
        <Route path='/chart' element={<GanttChart />} />
        <Route path='/order_detail' element={<OrderDetails />} />
        <Route path='/forign' element={<ForeignKeyColumn />} />
        <Route path='/pivot' element={<Pivot />} />
        <Route path='/adaptive' element={<Adaptive />} />
        <Route path='/kanban' element={<Kanban />} />
        <Route path='/quary' element={<Quary />} />
        <Route path='/websocket' element={<Websocket />} />
        <Route path='/Weborder' element={<Weborder />} />
        <Route path='/form' element={<Form />} />
        <Route path='/Formbuilder' element={<Formbuilder />} />
        <Route path='/Embedd' element={<Embedd />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/pdf' element={<Pdf />} />
        <Route path='/HeroFashionGrid1311' element={<HeroFashionGrid1311 />} />
        <Route path='/optimize' element={<Optimize />} />
        <Route path='/spreadsheet' element={<Spreadsheet />} />
        <Route path='/word' element={<Word />} />
        <Route path='/smart' element={<Smartpaste />} />
        <Route path='/speak' element={<Speech />} />
        <Route path='/explor' element={<Explorer />} />
        <Route path='/floor' element={<Floor />} />
        <Route path='/imgedit' element={<ImageEditor />} />
        <Route path='/circut' element={<LogicCircut />} />
        <Route path='/webmail' element={<Webmail />} />
        <Route path='/rk' element={<Rk />} />
        <Route path='/cutting-delivery' element={<CuttingDeliveryGrid />} />
        
    </Routes>
  );
}

export default Home;
