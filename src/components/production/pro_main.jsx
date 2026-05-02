import { Routes, Route } from "react-router-dom";
import Emp from "../production/emp";



function Pro_main() {
    return (
        <Routes>
            <Route path="/" element={<Emp />} />
        </Routes>
    );
}

export default Pro_main