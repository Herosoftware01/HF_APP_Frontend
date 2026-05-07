import { Route,Routes } from "react-router-dom";
import Imp_home from "../implemantation_reports/imp_home";
import Bundel from "../implemantation_reports/unit/unit";
import Lay from "../implemantation_reports/cutting/lay";
import Dyed from "../implemantation_reports/fabric/dyed";


const ImpMain = () => {
    return (
         <Routes>
            <Route path="/" element={<Imp_home />} />
            <Route path="bundel" element={<Bundel />} />
            <Route path="lay" element={<Lay />} />
            <Route path="dyed" element={<Dyed />} />
         </Routes>
    )
}

export default ImpMain;