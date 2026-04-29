import React from 'react';
import '../../../index.css';
import './site.css';
import { BoldBI } from '@boldbi/boldbi-embedded-sdk';
import Axios from 'axios';

//ASP.NET Core application would be run on http://localhost:61377/, which needs to be set as `apiHost`
// const apiHost = "http://localhost:8000"
// const apiHost = "http://127.0.0.1:8000"
const apiHost = "https://hfapi.herofashion.com"

//Url of the TokenGeneration action in views.py of the backend application
const tokenGenerationUrl = "/tokenGeneration";

// Optional fallback credentials (not recommended for production)
const userEmail= "";
const embedSecret= "";

class DashboardListing extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toke: undefined, items: [], search: '' };
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
          // dashboardId: data.DashboardId ? data.DashboardId : data.Id,
          dashboardId: "4a51bdb3-8bc6-4185-9294-593ed902388a",
          embedContainerId: "viewer",
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
      <div id="mainLayout">
        <aside id="sidebar">
          <div className="brand">
            <div className="logo" title="Dashboards">BI</div>
            <div className="title">Dashboards</div>
          </div>

          <div className="search" title="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <input id="search" type="text" placeholder="Search dashboards..." value={this.state.search} onChange={(e) => this.setState({search: e.target.value})} />
          </div>

            <div className="sections" id="sections">
              <div className="section-list" id="panel">
                { (this.state.items || []).filter(el => {
                    const name = (el.Name || el.name || '').toLowerCase();
                    const q = (this.state.search || '').toLowerCase();
                    return q === '' || name.indexOf(q) !== -1;
                  }).map((el) => {
                  const id = el.Id || el.id;
                  const name = el.Name || el.name || 'Dashboard';
                  return (
                    <div key={String(id)} className="dash-item" title={name} data-id={String(id)} onClick={() => this.renderDashboard(el)}>
                      <div className="item-row">
                        <span className="item-title">{name}</span>
                        <span className="item-actions" />
                      </div>
                    </div>
                  );
                })}
                {(!this.state.items || this.state.items.length === 0) && (
                  <div className="dash-item" style={{opacity:.6}}>No dashboards found</div>
                )}
              </div>
          </div>

        </aside>

        <section id="content">
          <div className="topbar">
            <div className="left">
              <div className="menu-button" id="menuBtn">☰</div>
              <strong>Bold BI Portal</strong>
            </div>
            <div className="right selector-group">
              <label htmlFor="siteSelect">Site</label>
              <select id="siteSelect"></select>
              <label htmlFor="userSelect">User</label>
              <select id="userSelect"></select>
            </div>
          </div>

          <div className="viewer-wrap">
            <div id="viewerCard">
              <div id="viewerHeader">
                <span id="viewerTitle"></span>
                <div className="viewer-actions"></div>
              </div>
              <div id="viewer"></div>
              <iframe id="designerFrame" title="Designer"></iframe>
            </div>
          </div>
        </section>
      </div>
    );
  }

  async componentDidMount() {
    try {
      const response = await fetch(apiHost + '/getdetails');
      const data = await response.json();

      // Transform camelCase keys to PascalCase and include server info
      const transformedEmbedConfigData = {
        DashboardId: data.DashboardId,
        EmbedType: data.EmbedType,
        Environment: data.Environment,
        ServerUrl: data.ServerUrl,
        SiteIdentifier: data.SiteIdentifier
      };
      this.setState({ embedConfig: transformedEmbedConfigData });

      // Use UserEmail and EmbedSecret returned by the backend (sample only)
      const userEmailFromServer = data.UserEmail || userEmail || '';
      const embedSecretFromServer = data.EmbedSecret || embedSecret || '';

      // Validate server values before calling Bold BI REST API
      if (!data.ServerUrl || !data.SiteIdentifier) {
        console.error('Missing ServerUrl or SiteIdentifier in /getdetails response', data);
        this.setState({ items: [] });
        return;
      }

      // Request dashboards from our backend which performs the Bold BI REST calls server-side
      try {
        const dashResp = await Axios.get(apiHost + '/dashboards');
        let arrayOfObjects = [];
        if (Array.isArray(dashResp && dashResp.data ? dashResp.data : null)) {
          arrayOfObjects = dashResp.data;
        } else if (dashResp && dashResp.data && Array.isArray(dashResp.data.Data)) {
          arrayOfObjects = dashResp.data.Data;
        } else if (dashResp && dashResp.data && Array.isArray(dashResp.data.all)) {
          arrayOfObjects = dashResp.data.all;
        }

        this.setState({ items: arrayOfObjects });
        if (arrayOfObjects.length > 0) this.renderDashboard(arrayOfObjects[0]);
      } catch (e) {
        console.error('Failed to load dashboards from backend:', e);
        this.setState({ items: [] });
      }

    } catch (error) {
      console.error('DashboardListing boot error:', error);
      // keep `items` as array to avoid render errors
      this.setState({ toke: undefined, items: [] });
    }
  }
}
export default DashboardListing;