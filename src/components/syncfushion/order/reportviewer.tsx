/* eslint-disable */
import React, { useState } from 'react';
 
// ✅ Bold Reports styles
// import '@boldreports/javascript-reporting-controls/Content/v2.0/tailwind-light/bold.report-viewer.min.css';
 
// ✅ Bold Reports scripts
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.common.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/common/bold.reports.widgets.min';
import '@boldreports/javascript-reporting-controls/Scripts/v2.0/bold.report-viewer.min';
 
// ✅ React wrapper
import '@boldreports/react-reporting-components/Scripts/bold.reports.react.min';
 
// ✅ Declare viewer component
declare let BoldReportViewerComponent: any;
 
// ✅ Viewer styling
const viewerStyle = {
  height: '700px',
  width: '100%'
};
 
function Report() {
 
  // ✅ STATE: Selected report path
  const [reportPath, setReportPath] = useState(
    '7ba340e4-9a3a-43e9-8903-269f9f71fa2d'
  );
 
  return (
    <div>
 
      {/* ✅ Dropdown */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ marginRight: '8px', fontWeight: '500' }}>
          Select Report:
        </label>
 
        <select
          value={reportPath}
          onChange={(e) => setReportPath(e.target.value)}
          style={{ padding: '6px', minWidth: '250px' }}
        >
          <option value="7ba340e4-9a3a-43e9-8903-269f9f71fa2d">
            Sales Report
          </option>
          <option value="4b514d8b-233c-488a-867e-c227d35b8c99">
            Inventory Report
          </option>
          <option value="c9876543-4444-5555-6666-cccccccccccc">
            Purchase Report
          </option>
        </select>
      </div>
 
      {/* ✅ Report Viewer */}
      <div style={viewerStyle}>
        <BoldReportViewerComponent
 
          /* 🔴 IMPORTANT LINE 🔴
             Forces re‑initialization when reportPath changes */
          key={reportPath}
 
          id="reportviewer-container"
 
          reportServiceUrl="https://api.herofashion.com/reporting/reportservice/api/Viewer"
          reportServerUrl="https://api.herofashion.com/reporting/api/site/site3"
 
          serviceAuthorizationToken={
            'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHZlYWh0ZWNoLmNvbSIsIm5hbWVpZCI6IjEiLCJ1bmlxdWVfbmFtZSI6ImY0MDM5NmIzLTIzNDAtNDAzOC1iYTk2LWEwNTY0ZmVkY2MxMSIsIklQIjoiMTAuMS4yMS4xMyIsImlzc3VlZF9kYXRlIjoiMTc3NjE2OTk4MyIsIm5iZiI6MTc3NjE2OTk4MywiZXhwIjoxNzc2Nzk2MjAwLCJpYXQiOjE3NzYxNjk5ODMsImlzcyI6Imh0dHBzOi8vYXBpLmhlcm9mYXNoaW9uLmNvbS9yZXBvcnRpbmcvc2l0ZS9zaXRlMyIsImF1ZCI6Imh0dHBzOi8vYXBpLmhlcm9mYXNoaW9uLmNvbS9yZXBvcnRpbmcvc2l0ZS9zaXRlMyJ9.xdtWS_4E9CAcjaV-uHZrJcOBa943BXw0gt9dUbtfLkc'
      
          }
 
          reportPath={reportPath}
        />
      </div>
 
    </div>
  );
}
 
export default Report;