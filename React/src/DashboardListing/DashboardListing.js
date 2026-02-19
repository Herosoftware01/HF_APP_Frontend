import React from 'react';
import '../index.css';
import '../index';
import { BoldBI } from '@boldbi/boldbi-embedded-sdk';
import Axios from 'axios';

//ASP.NET Core application would be run on http://localhost:61377/, which needs to be set as `apiHost`
const apiHost = "http://localhost:8000"

//Url of the TokenGeneration action in views.py of the backend application
const tokenGenerationUrl = "/tokenGeneration";

//Enter your BoldBI credentials here
const userEmail= "";
const embedSecret= "";

class DashboardListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toke: undefined, items: [] };
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
          serverUrl: this.state.embedConfig.ServerUrl + "/" + this.state.embedConfig.SiteIdentifier,
          dashboardId: data.DashboardId ? data.DashboardId : data.Id,
          embedContainerId: "dashboard",
          embedToken: accessToken
        });

        dashboard.loadDashboard();
      })
      .catch(err => {
        console.error("Error rendering dashboard:", err);
      });
  };

  render() {
    return (
      <div id="DashboardListing">
        <div id="container">
          <div className="header-section">
            <div id="grid-title">All Dashboards</div>
          </div>
          <div id="panel">
            {this.state.items.map((el) =>
              <button
                key={el.Id}
                className="dashboard-item"
                attr-name={el.Name}
                attr-id={el.Id}
                value={el}
                onClick={() => this.renderDashboard(el)}
              >
                {el.Name}
              </button>
            )}
          </div>
        </div>
        <div id="viewer-section">
          <div id="dashboard"></div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    const response = await fetch(apiHost + '/getdetails');
    const data = await response.json();
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
      });
    } catch (error) {
      console.log(error);
      this.setState({ toke: "error", items: "error" });
    }

    var querystring = require('querystring');
    var token = "";
    Axios.post(data.ServerUrl + '/api/' + data.SiteIdentifier + '/token',
      querystring.stringify({
        username: userEmail,
        embed_secret: embedSecret,
        grant_type: "embed_secret"
      }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(response => {
      var result = response;
      token = result.data.access_token;
      this.setState({ toke: token });
      //Get Dashboards
      Axios.get(data.ServerUrl + '/api/' + data.SiteIdentifier + '/v2.0/items?ItemType=2',
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Authorization": 'bearer ' + this.state.toke
          }
        }).then(res => {
          var arrayOfObjects = res.data;
          this.setState({ items: arrayOfObjects });
          this.renderDashboard(arrayOfObjects[0]);
        },
          error => {
            this.setState({ items: "error" });
          });
    },
      error => {
        this.setState({ toke: "error" });
      });
  }
}
export default DashboardListing;