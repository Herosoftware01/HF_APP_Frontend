import { Routes, Route } from "react-router-dom";
import Cutdel from "../delivery/cutdel";
import Entry from "../delivery/entry";
import Del_home from "../delivery/del_home";
import Fab_cut from "../delivery/fab_cut";



function Cut_main() {
    return (
        <Routes>
            <Route path="/" element={<Del_home />} />
            <Route path="/cutdel" element={<Cutdel />} />
            <Route path="/entry" element={<Entry />} />
            <Route path="/fab_cut" element={<Fab_cut />} />
        </Routes>
    );
}

export default Cut_main;