import { Routes, Route } from "react-router-dom";

import In_login  from "../app/in_login";
import In_home from "../app/in_home";



function In_main() {
    return (
        <Routes>
            <Route path="/" element={<In_login />} />
            <Route path="home" element={<In_home />} />
        </Routes>
    );
}

export default In_main;