 import { Route, Routes } from "react-router-dom";


 import Sec from "../security/sec";


 const Sec_main = () => {
   return (
     <Routes>
        <Route path = "/" element={<Sec/>} />
     </Routes>
   );
 };

 export default Sec_main;