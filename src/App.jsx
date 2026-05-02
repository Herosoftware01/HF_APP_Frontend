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
// import Syncfushion from "./components/syncfushion/main/home"
const Syncfushion = lazy(() =>
  import("./components/syncfushion/main/home")
);
import Visuva from "./components/syncfushion/order/ord_pagination";
import GreyRollChecking from "./components/GreyrollChecking/main/App";
import FabricForm from "./components/syncfushion/fabric/Fabric";
import Machine_Allocate from "./components/machine_allocate/main"
import Home_1 from "./components/reports/main";
import Ad_login from "./components/hr/advance/auth/ad_main";
import Sticker from "./components/Cutting/sticker production/App"
import Bitcheck from "./components/Cutting/bit checking/App"
import BitCheckingUI from "./components/Cutting/bit checking/BitcheckingPly";
import Home_hw from "./components/fininace/holdwage/entry/hw_main";
const BoldBi = lazy(()=>import("./components/syncfushion/DashboardListing/DashboardListing")) 
const BoldReport = lazy(()=>import("./components/syncfushion/order/reportviewer")) 
import Cut_sample from "./components/cutting_sample/main/cut_main"

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
          path="/ord_page/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Visuva />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

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
      </Routes>
    </HashRouter>
  );
}

export default App;
