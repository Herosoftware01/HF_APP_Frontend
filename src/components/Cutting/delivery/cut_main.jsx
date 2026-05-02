import { Routes, Route } from "react-router-dom";
import Cutdel from "../delivery/cutdel";
import Entry from "../delivery/entry";



function Cut_main() {
    return (
        <Routes>
            <Route path="/" element={<Cutdel />} />
            <Route path="/entry" element={<Entry />} />
        </Routes>
    );
}

export default Cut_main;