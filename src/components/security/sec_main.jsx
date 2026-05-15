 import { Route, Routes } from "react-router-dom";


 import Sec from "./sec";


 const Sec_main = () => {
   return (
     <Routes>
        <Route path = "sec" element={<Sec/>} />
     </Routes>
   );
 };

 export default Sec_main;