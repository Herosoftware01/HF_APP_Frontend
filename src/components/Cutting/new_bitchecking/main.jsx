import React from 'react'
import { Routes, Route } from "react-router-dom";
import Checking from './Checking'

function main() {
  return (
    <Routes>
      <Route path="/" element={<Checking />} />
      {/* <Route path="qc" element={<Qc />} /> */}
      
    </Routes>
  )
}

export default main
