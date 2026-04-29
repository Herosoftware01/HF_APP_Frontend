import { Routes, Route } from "react-router-dom";
import Ad_login from "./ad_login";
import Admin from "./admin";
import Home_2 from "../pages/home";
import Request from "../pages/request";
import Statement from "../pages/statement";
import Approve from "../pages/approve";
import AttendanceDashboard from "../../reports/emp_att";


function Ad_main() {
    return (
        <Routes>
            <Route path="/" element={<Ad_login />} />
            <Route path="home" element={<Home_2 />} />
            <Route path="admin" element={<Admin />} />
            <Route path="request" element={<Request />} />
            <Route path="statement" element={<Statement />} />
            <Route path="approve" element={<Approve />} />

            {/* HR Report */}
            <Route path = "attendance" element={<AttendanceDashboard />} />
         
        </Routes>
    );
}
export default Ad_main;