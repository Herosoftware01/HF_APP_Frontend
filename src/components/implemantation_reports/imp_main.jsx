import { Route,Routes } from "react-router-dom";
import Imp_home from "../implemantation_reports/imp_home";
import Bundel from "../implemantation_reports/unit/unit";
import Lay from "../implemantation_reports/cutting/lay";
import Dyed from "../implemantation_reports/fabric/dyed";
import First from "../implemantation_reports/qc/first";
import Roving from "../implemantation_reports/qc/roving";


const ImpMain = () => {
    return (
         <Routes>
            <Route path="/" element={<Imp_home />} />
            <Route path="bundel" element={<Bundel />} />
            <Route path="lay" element={<Lay />} />
            <Route path="dyed" element={<Dyed />} />
            <Route path="first" element={<First />} />
            <Route path="roving" element={<Roving />} />
         </Routes>
    )
}

export default ImpMain;