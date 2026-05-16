import { Routes, Route } from "react-router-dom";

import Empleave from "../../production/reports/empleave";



const Emp_re_main = () => {
    return (
        <Routes>
            <Route path="/" element={<Empleave />} />
        </Routes>
    );
};

export default Emp_re_main;