import React from 'react'
import { useParams, useLocation, useNavigate } from "react-router-dom";

function cut_mes() {
    const location = useLocation();


    const {
    bundleNo,
    jobNo,
    product,
    colour,
    size,
    pieces,
    bundle_id,
     
  } = location.state || {};
  return (
    <div>

        <h1 className="text-[28px] font-bold text-[#0F172A]">Cut Part MMST</h1>
      
    </div>
  )
}

export default cut_mes
