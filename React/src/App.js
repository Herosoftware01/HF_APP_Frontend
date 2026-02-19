import React from 'react';
// import logo from './logo.svg';
import './App.css';
import DashboardListing from './DashboardListing/DashboardListing';
import Dashboard from './Dashboard/Dashboard';

class App extends React.Component {
  render() {
    return (
      <div>
      {/* <DashboardListing/> */}
            <Dashboard/>
      </div>
    );
  }
}

export default App;
