import { Routes, Route } from "react-router-dom";
import Admin from "./admin";
import Request from "../pages/request";
import Statement from "../pages/statement";
import Approve from "../pages/approve";



function Ad_main() {
    return (
        <Routes>
            <Route path="admin" element={<Admin />} />
            <Route path="request" element={<Request />} />
            <Route path="statement" element={<Statement />} />
            <Route path="approve" element={<Approve />} />
        </Routes>
    );
}
export default Ad_main;