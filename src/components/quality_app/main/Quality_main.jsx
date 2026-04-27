import { Routes, Route } from "react-router-dom";
import Quality_admin from "../admin_control/Quality_admin";
import Qc from "../quality/Qc";
import LineDetail from "../quality/LineDetail"
import ProductionDetails from "../quality/ProductDetails"
import DefectTabs from "../quality/Defects"
import Reving from "../quality/Roving"
import Roving_operator from "../quality/Roving_operator";
import Rowing_defects from "../quality/Rowing_defects";
import order_measurements from "../../cutting_sample/main/cut_main";

function Quality_main() {
  return (
    <Routes>
      <Route path="/" element={<Quality_admin />} />
      <Route path="qc" element={<Qc />} />
      <Route path="m_scan" element={<order_measurements />} />
      <Route path="line/:unit/:line" element={<LineDetail />} />
      <Route path="qc-entry/:unit/:line/first-piece" element={<ProductionDetails />} />
      <Route path="qc-entry/:unit/:line/roving-qc" element={<Reving />} />
      <Route path="/defects/:unit/:line" element={<DefectTabs />} />
      <Route path="/rowing_defects/:unit/:line" element={<Rowing_defects />} />
      <Route path="/roving/:unit/:line" element={<Roving_operator />} />
    </Routes>
  );
}

export default Quality_main;