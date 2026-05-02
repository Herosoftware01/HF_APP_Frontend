/* eslint-disable */
import React, { useEffect, useState } from 'react';

// ✅ jQuery import + GLOBAL expose
import $ from 'jquery'
window.$ = window.jQuery = $

// ✅ Bold Reports styles
import '@boldreports/javascript-reporting-controls/Content/v2.0/material-light/bold.report-viewer.min.css';

// ✅ Bold Reports scripts
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';

// ✅ React wrapper
import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';

declare let BoldReportViewerComponent: any;

const viewerStyle = {
  height: '800px',
  width: '100%',
  padding: '10px'
};

function Report() {
  const [reportPath, setReportPath] = useState('');
  const [reports, setReports] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ SINGLE INIT (parallel calls)
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const [tokenRes, reportsRes] = await Promise.all([
          fetch('https://hfapi.herofashion.com/syncfushion/token/'),
          fetch('https://hfapi.herofashion.com/syncfushion/reports/')
        ]);

        const tokenData = await tokenRes.json();
        const reportsData = await reportsRes.json();

        // ✅ token
        if (tokenData.success) {
          setToken(tokenData.data.access_token);
        }

        // ✅ reports
        const reportList = reportsData.data || reportsData;
        setReports(reportList);

        // ✅ default report (only once)
        if (reportList.length > 0) {
          setReportPath(reportList[0].ReportId);
        }

      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <div>

      {/* ✅ DROPDOWN */}
      <div style={{ marginBottom: '12px', padding: '5px' }}>
        <label style={{ marginRight: '8px', fontWeight: '500' }}>
          Select Report:
        </label>

        <select
          value={reportPath}
          onChange={(e) => setReportPath(e.target.value)}
          style={{ padding: '6px', minWidth: '250px' }}
          disabled={loading}
        >
          {reports.map((report: any) => (
            <option key={report.ReportId} value={report.ReportId}>
              {report.Name}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ VIEWER */}
      <div style={viewerStyle}>
        {loading && <p>Loading reports...</p>}

        {!loading && token && reportPath && (
          <BoldReportViewerComponent
            key={reportPath} // ✅ only depend on report change
            id="reportviewer-container"
            reportServiceUrl="https://api.herofashion.com/reporting/reportservice/api/Viewer"
            reportServerUrl="https://api.herofashion.com/reporting/api/site/site3"
            serviceAuthorizationToken={`bearer ${token}`}
            reportPath={reportPath}
          />
        )}
      </div>

    </div>
  );
}

export default Report;