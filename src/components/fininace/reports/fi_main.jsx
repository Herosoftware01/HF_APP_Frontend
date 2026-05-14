import { Route, Routes } from "react-router-dom";
import Fi_home from "../reports/fi_home";
import Bill from "../reports/bill";
import Pass from "../reports/pass";
import Approve from "../reports/approve";
import Bill_dash from "../reports/bill_dash";
import Bill_dash_de from "../reports/bill_dash_de";
import Pay_dash from "../reports/pay_dash";



const FiMain = () => {
  return (
    <Routes>      
      <Route path="/" element={<Fi_home />} />
      <Route path="bill" element={<Bill />} />
      <Route path="pass" element={<Pass />} />
      <Route path="approve" element={<Approve />} />
      <Route path="bill_dash" element={<Bill_dash />} />
      <Route path="bill_dash_de" element={<Bill_dash_de />} />
      <Route path="pay_dash" element={<Pay_dash />} />
    </Routes>
  );
};

export default FiMain;