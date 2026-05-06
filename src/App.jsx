import { HashRouter, Routes, Route } from "react-router-dom";
import { lazy, useEffect } from "react";
import { startSilentRefresh, getRefreshToken } from "./auth/auth";

import Login from "./login/Login";
import Dashboard from "./dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import User_list from "./components/user_control/User_list";
import ProtectedLayout from "./ProtectedLayout";
import MenuPage from "./components/user_control/MenuPage";
import SubMenuPermissionPage from "./components/user_control/SubMenuPermissionPage";
import QualityApp from "./components/quality_app/main/Quality_main"
import Qc_entry from "./components/quality_app/quality/Qc"
import Syncfushion from "./components/syncfushion/main/home";
import GreyRollChecking from "./components/GreyrollChecking/main/App";
import FabricForm from "./components/syncfushion/fabric/Fabric";
import Machine_Allocate from "./components/machine_allocate/main"
import Home_1 from "./components/reports/main";
import Ad_login from "./components/hr/advance/auth/ad_main";
import Sticker from "./components/Cutting/sticker production/App"
import Bitcheck from "./components/Cutting/bit checking/App"
import BitCheckingUI from "./components/Cutting/bit checking/BitcheckingPly";
import Home_hw from "./components/fininace/holdwage/entry/hw_main";
import In_login from "./components/Incentive&Debit/app/in_main";
import Emp from "../src/components/production/pro_main";
import Re_home from "../src/components/hr/reports/re_main";
const BoldBi = lazy(()=>import("./components/syncfushion/DashboardListing/DashboardListing")) 
const BoldReport = lazy(()=>import("./components/syncfushion/order/reportviewer")) 
import Cut_sample from "./components/cutting_sample/main/cut_main"
import Word from "./components/syncfushion/order/Word/Word"
import Pdf from "./components/syncfushion/order/Pdf/Pdf"
import Xlsheet from './components/syncfushion/order/Xlsheet/Xlsheet'
import GanttChart from "./components/syncfushion/order/Gantt Chart/GanttChart";
import Kanban from './components/syncfushion/order/Kanban/Kanban';
import Pivot from "./components/syncfushion/order/pivot/Pivotview";
import WebSocket from './components/syncfushion/order/web_order';
import BlockEditor from './components/syncfushion/order/BlockEditor/eblockeditor';
import Oms from './components/syncfushion/order/excel';
import Calendar from './components/syncfushion/order/Schedule'
import Form from './components/syncfushion/order/Form/Form'
import FormBuilder from './components/syncfushion/order/FormBuilder/formbuilder'
import Fi_home  from "./components/fininace/reports/fi_main";
import Del_home from "./components/Cutting/delivery/cut_main";

function App() {

  useEffect(() => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      startSilentRefresh(); // start refresh system when app loads
    }
  }, []);

  return (
    <HashRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* USER LIST */}
        <Route
          path="/user-list"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <User_list />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* MENU CONTROL */}
        <Route
          path="/menu-control"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <MenuPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        {/* SUBMENU CONTROL */}
        <Route
          path="/submenu-control"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SubMenuPermissionPage />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sy-order/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Syncfushion />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/allunit/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Emp />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/hr/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Re_home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        

        {/* <Route
          path="/ord_page/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Visuva />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/qc-admin/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <QualityApp />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/qc-entry/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Qc_entry />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alias/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <FabricForm />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/grey-app/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <GreyRollChecking />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/machine/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Machine_Allocate />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cutting-report/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home_1 />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/advance/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Ad_login />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
          <Route
          path="/stick-prod/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Sticker />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance_report/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Fi_home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cutdel/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Del_home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bit-checking/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Bitcheck />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bitchecking_ply/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <BitCheckingUI />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/holdwage/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home_hw />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/boldbi/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <BoldBi />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/boldreport/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <BoldReport />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cut_sample/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Cut_sample />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/word/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Word />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/xlsheet/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Xlsheet />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pdf/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Pdf />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/websocket/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <WebSocket />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sy-order/block_edit/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <BlockEditor/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sy-order/ganttchart/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <GanttChart/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sy-order/calendar/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Calendar/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sy-order/oms/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Oms/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pivot/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Pivot/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/kanban/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Kanban/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sy-order/formbuilder/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <FormBuilder/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sy-order/form_detail/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Form/>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </HashRouter>
  );
}

export default App;
