import React from 'react';
import './App.css';
import DashboardListing from './DashboardListing/DashboardListing';
import Dashboard from './Dashboard/Dashboard';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboardlisting" element={<DashboardListing />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
