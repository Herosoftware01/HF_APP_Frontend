import React from 'react';
// import '../index';
import { BoldBI } from '@boldbi/boldbi-embedded-sdk';

//ASP.NET Core application would be run on https://localhost:5001; http://localhost:5000, which needs to be set as `apiHost`
// const apiHost = "http://localhost:8000";
const apiHost = "https://hfapi.herofashion.com"

//Url of the TokenGeneration action in views.py of the backend application
const tokenGenerationUrl = "/tokenGeneration";

//var BoldBiObj;
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toke: undefined,
      items: [],
      embedConfig: {},
    };
    this.BoldBiObj = new BoldBI();
  };

  getEmbedToken() {
      return fetch(apiHost + tokenGenerationUrl, { // Backend application URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
        .then(response => {
          if (!response.ok) throw new Error("Token fetch failed");
          return response.text();
        });
    }
  
    renderDashboard(data) {
      this.getEmbedToken()
        .then(accessToken => {
          const dashboard = BoldBI.create({
            serverUrl: data.ServerUrl + "/" + data.SiteIdentifier,
            mode: BoldBI.Mode.Design, 
            dashboardId: data.DashboardId,
            embedContainerId: "dashboard",
            embedToken: accessToken
          });
  
          // dashboard.loadDashboard();
           
           dashboard.loadDesigner();

 
        })
        .catch(err => {
          console.error("Error rendering dashboard:", err);
        });
    };

  render() {
    return (
      <div id="DashboardListing">
        <div id="container">
        </div>
          <div id="dashboard"></div>
      </div>
    );
  }

  async componentDidMount() {
    try {
      const response = await fetch(apiHost + '/getdetails');
      const data = await response.json();
       // Transform camelCase keys to PascalCase
       const transformedEmbedConfigData = {
        DashboardId: data.DashboardId,
        EmbedType: data.EmbedType,
        Environment: data.Environment,
        ServerUrl: data.ServerUrl,
        SiteIdentifier: data.SiteIdentifier
      };
      this.setState({ embedConfig: transformedEmbedConfigData }, () => {
        this.renderDashboard(this.state.embedConfig);
      });
    } catch (error) {
      console.log(error);
      this.setState({ toke: "error", items: "error" });
    }
  }
}
export default Dashboard;
