import { Routes, Route } from "react-router-dom";

import In_login  from "../../Incentive&Debit/app/in_login";
import In_home from "../../Incentive&Debit/app/in_home";
import Request from "../../Incentive&Debit/app/request";
import Statement from "../../Incentive&Debit/app/statment";
import Approve from "../../Incentive&Debit/approve/approve";
import Admin from "../../Incentive&Debit/app/admin";



function In_main() {
    return (
        <Routes>
            <Route path="/" element={<In_login />} />
            <Route path="home" element={<In_home />} />
            <Route path="request" element={<Request />} />
            <Route path="statement" element={<Statement />} />
            <Route path="approve" element={<Approve />} />
            <Route path="admin" element={<Admin />} />
        </Routes>
    );
}

export default In_main;