import { Routes, Route } from "react-router-dom";
import M_scan from "../pages/order_m_scan";
import Mes_details from "../pages/mes_details";


function Cut_main() {
  return (
   
    <Routes>
      <Route path="/" element={<M_scan />} />
      <Route path="mes_details" element={<Mes_details />} />
      
    </Routes>
  
  );
}

export default Cut_main;