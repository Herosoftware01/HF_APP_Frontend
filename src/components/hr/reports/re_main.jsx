 import { Route, Routes } from "react-router-dom";
 
import AttendanceDashboard from "../reports/emp_att";
import Re_home from "../reports/re_home";
import ResignationDashboard from "../reports/resign";
import Resign from "../reports/resign";
import Join from "../reports/join";
import Staff_att from "../reports/staff_att";
import Staff_one from "../reports/staff_one";
import Emp_one from "../reports/emp_one";
import Sec from "../reports/sec";
import Emp_trend from "./emp_trend";
import Emp_trend1 from "../reports/emp_trend1";
 
 function Re_main() {
        return (
            <Routes>
 
            {/* HR Report */}
            <Route path="/" element={<Re_home />} />
            <Route path = "attendance" element={<AttendanceDashboard />} />
            <Route path = "staff" element={<Staff_att />} />
            <Route path = "resignation" element={<Resign/>} />
            <Route path = "joining" element={<Join/>} />
            <Route path = "staff_one" element={<Staff_one/>} />
            <Route path = "emp_one" element={<Emp_one/>} />
            <Route path = "sec" element={<Sec/>} />
            <Route path = "emp_trend" element={<Emp_trend/>} />
            <Route path = "emp_trend1" element={<Emp_trend1/>} />
            </Routes>
        );
    }   

export default Re_main;
           