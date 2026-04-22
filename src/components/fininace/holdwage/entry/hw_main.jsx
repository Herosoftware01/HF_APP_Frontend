// src/components/fininace/holdwage/entry/hw_main.jsx

import { Routes, Route } from "react-router-dom";

import Home_hw from "./home_hw";
import Hold from "./hold";
import Hw_report from "../reports/hw_report";
import Paid_report from "../reports/paid_report";

function Hw_main() {
  return (
    <Routes>
      {/* /holdwage */}
      <Route index element={<Home_hw />} />

      {/* /holdwage/hold */}
      <Route path="hold" element={<Hold />} />

      {/* /holdwage/home */}
      <Route path="home" element={<Home_hw />} />

      {/* /holdwage/reports/hw_report */}
      <Route path="reports/hw_report" element={<Hw_report />} />

      {/* /holdwage/reports/paid_report */}
      <Route path="reports/paid_report" element={<Paid_report />} />
    </Routes>
  );
}

export default Hw_main;