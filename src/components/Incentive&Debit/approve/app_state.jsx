import React, { useEffect, useState } from "react";

const App_state = () => {
  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState({
    approvedStaff: [],
    approvedEmployee: [],
    rejectedStaff: [],
    rejectedEmployee: []
  });

  const apiUrl = "https://app.herofashion.com/incentive/api/incdeb-status/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        // Adjust these keys (status/is_staff) based on your actual API response
        setStatements({
          approvedStaff: result.filter(item => item.status === 'Approve' && item.is_staff),
          approvedEmployee: result.filter(item => item.status === 'Approve' && !item.is_staff),
          rejectedStaff: result.filter(item => item.status === 'Reject' && item.is_staff),
          rejectedEmployee: result.filter(item => item.status === 'Reject' && !item.is_staff),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const TableLayout = ({ title, data, type }) => {
    const isReject = type === "reject";
    const accentColor = isReject ? "#ef4444" : "#10b981"; // Red for reject, Green for approve

    return (
      <div style={styles.card}>
        <div style={{...styles.cardHeader, borderLeft: `4px solid ${accentColor}`}}>
          <h3 style={styles.cardTitle}>{title}</h3>
          <span style={{...styles.badge, backgroundColor: isReject ? "#fee2e2" : "#d1fae5", color: accentColor}}>
            {data.length} entries
          </span>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>SL.NO</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Dept</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((item, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{item.date}</td>
                  <td style={{...styles.td, fontWeight: '600'}}>{item.code}</td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}><span style={styles.deptTag}>{item.dept}</span></td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}>{item.purpose}</td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#374151'}}>₹{item.amount}</td>
                  <td style={{...styles.td, fontStyle: 'italic', fontSize: '12px'}}>{item.reason}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={styles.noData}>No records found for this section.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <div style={styles.loading}>Generating Weekly Statement...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Weekly Incentive Statement</h1>
        <p style={styles.subtitle}>Reviewing approved and rejected claims for the current period.</p>
      </header>

      <section>
        <div style={styles.sectionDivider}>
          <span style={styles.dividerText}>APPROVED CLAIMS</span>
        </div>
        <TableLayout title="Staff Approvals" data={statements.approvedStaff} type="approve" />
        <TableLayout title="Employee Approvals" data={statements.approvedEmployee} type="approve" />
      </section>

      <section style={{marginTop: '50px'}}>
        <div style={styles.sectionDivider}>
          <span style={{...styles.dividerText, color: '#ef4444'}}>REJECTED CLAIMS</span>
        </div>
        <TableLayout title="Staff Rejections" data={statements.rejectedStaff} type="reject" />
        <TableLayout title="Employee Rejections" data={statements.rejectedEmployee} type="reject" />
      </section>
    </div>
  );
};

const styles = {
  container: { padding: "40px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: "30px", textAlign: "center" },
  mainTitle: { fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: "0" },
  subtitle: { color: "#64748b", marginTop: "5px" },
  sectionDivider: { borderBottom: "2px solid #e2e8f0", marginBottom: "20px", display: "flex", justifyContent: "center" },
  dividerText: { backgroundColor: "#f8fafc", padding: "0 15px", position: "relative", top: "12px", fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", color: "#10b981" },
  card: { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: "25px", overflow: "hidden" },
  cardHeader: { padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#334155", margin: 0 },
  badge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 20px", backgroundColor: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "600", textAlign: "left", textTransform: "uppercase" },
  td: { padding: "14px 20px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "#334155" },
  tr: { transition: "background-color 0.2s" },
  deptTag: { padding: "2px 8px", backgroundColor: "#e2e8f0", borderRadius: "4px", fontSize: "11px", fontWeight: "600" },
  noData: { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "14px" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#64748b", fontSize: "18px" }
};

export default App_state;