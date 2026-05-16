import { Routes, Route } from "react-router-dom";
import Emp from "../production/emp";
import Empleave from "./reports/empleave";



function Pro_main() {
    return (
        <Routes>
            <Route path="/" element={<Emp />} />
            <Route path="/emp_reports/empleave" element={<Empleave />} />
        </Routes>
    );
}

export default Pro_main