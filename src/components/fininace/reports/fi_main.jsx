import { Route, Routes } from "react-router-dom";
import Fi_home from "../reports/fi_home";
import Bill from "../reports/bill";
import Pass from "../reports/pass";
import Approve from "../reports/approve";



const FiMain = () => {
  return (
    <Routes>      
      <Route path="/" element={<Fi_home />} />
      <Route path="bill" element={<Bill />} />
      <Route path="pass" element={<Pass />} />
      <Route path="approve" element={<Approve />} />
    </Routes>
  );
};

export default FiMain;