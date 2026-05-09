import React from 'react'

import { Routes, Route } from "react-router-dom";
import Scan from "../pages/scan";
import Cut_mes from "../pages/cut_mes";

function main() {
  return (
    <Routes>
      <Route path="/" element={<Scan />} />
      <Route path="cut_mes" element={<Cut_mes />} />
    </Routes>
  )
}

export default main
