import React, { useEffect, useState } from "react";

const BASE = "https://hfapi.herofashion.com/imp_reports";

const Bundel = () => {
  // ── API data ──
  // receivePendingApi  ← unit_bundle/           (Receive Pending section only)
  // bundleDataApi      ← get_unit_bundle_data/  (Pending cards scan=0 + Complete scan=1)
  const [receivePendingApi, setReceivePendingApi] = useState([]);
  const [bundleDataApi, setBundleDataApi]         = useState([]);

  const [unitSummaries, setUnitSummaries]     = useState([]);
  const [allUnits, setAllUnits]               = useState([]);
  const [selectedUnit, setSelectedUnit]       = useState(null);
  const [modalFilter, setModalFilter]         = useState("pending");
  const [searchUnit, setSearchUnit]           = useState("All");
  const [loading, setLoading]                 = useState(true);

  const [modalPendingRows, setModalPendingRows]     = useState([]);
  const [modalCompletedRows, setModalCompletedRows] = useState([]);

  const [receivePendingRows, setReceivePendingRows]       = useState([]);
  const [receivePendingUnit, setReceivePendingUnit]       = useState(null);
  const [receivePendingSummary, setReceivePendingSummary] = useState([]);

  const [unitModalCounts, setUnitModalCounts] = useState({});

  const todayISO = () => new Date().toISOString().split("T")[0];
  const today    = new Date().toISOString().split("T")[0];

  // Empty string = no date filter (show all time)
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd,   setFilterEnd]   = useState("");

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { buildRows(); },               [bundleDataApi, searchUnit, filterStart, filterEnd, allUnits]);
  useEffect(() => { buildReceivePending(); },     [receivePendingApi, searchUnit, filterStart, filterEnd]);
  useEffect(() => { buildModalRows(); },          [bundleDataApi, filterStart, filterEnd, selectedUnit]);
  useEffect(() => { buildAllUnitModalCounts(); }, [bundleDataApi, filterStart, filterEnd, allUnits]);

  // ─────────────────────────────────────────────────────────────
  // FIXED UNIT MAP  unit_id → display label
  // ─────────────────────────────────────────────────────────────
  const UNIT_ID_MAP = {
    1:   "UNIT-1",
    53:  "UNIT-2",
    4:   "UNIT-3",
    6:   "UNIT-4",
    162: "UNIT-5",
  };

  // Always show exactly these 5 units in this order
  const FIXED_UNITS = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4", "UNIT-5"];

  // ─────────────────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [res1, res2] = await Promise.all([
        fetch(`${BASE}/unit_bundle/`),           // → receivePendingApi (Receive Pending only)
        fetch(`${BASE}/get_unit_bundle_data/`),  // → bundleDataApi (pending cards + complete)
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();
      const arr1  = Array.isArray(data1) ? data1 : [];
      const arr2  = Array.isArray(data2) ? data2 : [];

      setReceivePendingApi(arr1);
      setBundleDataApi(arr2);

      // Always use the fixed 5 units — no dynamic discovery needed
      setAllUnits(FIXED_UNITS);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  const normaliseUnit = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    // Numeric unit_id: resolve via fixed map
    if (/^\d+$/.test(s)) {
      return UNIT_ID_MAP[Number(s)] || null;
    }
    const up = s.toUpperCase();
    if (/^UNIT-\d+$/.test(up)) return up;
    const m = up.match(/UNIT[\s-]*(\d+)/);
    if (m) return `UNIT-${m[1]}`;
    return null;
  };

  const parseDate = (val) => {
    if (!val) return null;
    const s = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    if (/^\d{2}-\d{2}-\d{4}/.test(s)) { const [d,m,y]=s.split("-"); return `${y}-${m}-${d}`; }
    if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) { const [d,m,y]=s.split("/"); return `${y}-${m}-${d}`; }
    const dt = new Date(val);
    return isNaN(dt) ? null : dt.toISOString().split("T")[0];
  };

  const fmt = (iso) => {
    if (!iso) return "-";
    const [y,m,d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const ageingDays = (fromISO, toISO) => {
    if (!fromISO) return null;
    const to   = toISO ? new Date(toISO) : new Date();
    const from = new Date(fromISO);
    const d    = Math.floor((to - from) / 86400000);
    return d >= 0 ? d : null;
  };

  const ageing = (fromISO, toISO) => {
    const d = ageingDays(fromISO, toISO);
    return d !== null ? `${d}d` : "-";
  };

  const risk = (fromISO, toISO) => {
    const d = ageingDays(fromISO, toISO);
    if (d === null) return "Normal";
    if (d > 5)  return "High Risk";
    if (d >= 2) return "Risk";
    return "Normal";
  };

  // ─────────────────────────────────────────────────────────────
  // buildRows — drives the unit card grid
  // Source: bundleDataApi only
  //   scan=0 → Pending
  //   scan=1 → Complete
  // ─────────────────────────────────────────────────────────────
  const buildRows = () => {
    const summaries = {};

    const ensureUnit = (unit, job) => {
      if (!summaries[unit]) summaries[unit] = {
        unitName: unit, totalPending: 0, todayCompleted: 0,
        sumMasterPending: 0, sumSubPending: 0,
        sumMasterComp: 0, sumSubComp: 0,
        jobs: new Set(), daily: {},
      };
      if (job) summaries[unit].jobs.add(String(job));
    };

    const addSummary = (unit, date, type, mst, sub, job) => {
      ensureUnit(unit, job);
      const s = summaries[unit];
      if (!s.daily[date]) s.daily[date] = { pending: 0, completed: 0 };
      if (type === "pending") {
        s.totalPending++;
        s.sumMasterPending += mst;
        s.sumSubPending    += sub;
        s.daily[date].pending++;
      } else {
        s.todayCompleted++;
        s.sumMasterComp += mst;
        s.sumSubComp    += sub;
        s.daily[date].completed++;
      }
    };

    // ── Pending: bundleDataApi where scan=0 ──
    bundleDataApi.forEach(item => {
      if (String(item.scan) !== "0") return;

      const dt = parseDate(item.s_date || item.date);
      if (!dt) return;
      if (filterStart && dt < filterStart) return;
      if (filterEnd   && dt > filterEnd)   return;

      const unit = normaliseUnit(item.unitname || item.unit_name || item.unit_id);
      if (!unit) return;
      if (searchUnit !== "All" && searchUnit !== unit) return;

      const sub = Number(item.total_bundles || 0);
      const pcs = Number(item.pcs_count || 0);
      const job = item.job_no || item.jobno;

      addSummary(unit, dt, "pending", pcs, sub, job);
    });

    // ── Complete: bundleDataApi where scan=1 ──
    bundleDataApi.forEach(item => {
      if (String(item.scan) !== "1") return;

      const sDate = parseDate(item.s_date || item.date);
      if (!sDate) return;
      if (filterStart && sDate < filterStart) return;
      if (filterEnd   && sDate > filterEnd)   return;

      const unit = normaliseUnit(item.unitname || item.unit_name || item.unit_id);
      if (!unit) return;
      if (searchUnit !== "All" && searchUnit !== unit) return;

      const sub = Number(item.total_bundles || item.pcs_count || 0);
      const pcs = Number(item.pcs_count || item.total_bundles || 0);
      const job = item.job_no || item.jobno;

      addSummary(unit, sDate, "complete", pcs, sub, job);
    });

    const finalSummaries = allUnits.map(unit => {
      const existing = summaries[unit];
      if (existing) {
        return {
          ...existing,
          jobs: [...existing.jobs].filter(Boolean).join(", "),
        };
      }
      return {
        unitName: unit, totalPending: 0, todayCompleted: 0,
        sumMasterPending: 0, sumSubPending: 0,
        sumMasterComp: 0, sumSubComp: 0,
        jobs: "", daily: {},
      };
    });

    setUnitSummaries(finalSummaries);
  };

  // ─────────────────────────────────────────────────────────────
  // buildReceivePending — uses receivePendingApi (unit_bundle/) ONLY
  // ─────────────────────────────────────────────────────────────
  const buildReceivePending = () => {
    const byUnit   = {};
    const seenBunids = new Set();

    receivePendingApi.forEach(item => {
      const scanVal = item.mbappr ?? item.scan;
      if (String(scanVal) !== "0" && scanVal !== null && scanVal !== undefined && scanVal !== "") return;

      const mbunidRaw = item.mbunid;
      const unitRaw   = item.unitname || item.unit_name;
      if (!mbunidRaw || !unitRaw) return;

      const bunidKey = String(mbunidRaw);
      if (seenBunids.has(bunidKey)) return;
      seenBunids.add(bunidKey);

      const unit = normaliseUnit(unitRaw);
      if (!unit) return;
      if (searchUnit !== "All" && searchUnit !== unit) return;

      const rdtRaw = item.r_dt || item.created_at || item.c_dt || item.entry_date || item.date;
      const dt     = parseDate(rdtRaw) || null;
      if (!dt) return;
      if (filterStart && dt < filterStart) return;
      if (filterEnd   && dt > filterEnd)   return;

      const mst = Number(item.totmastbdl || 0);
      const sub = Number(item.totbdl || 0);
      const pcs = Number(item.pcs_count || 0);
      const job = item.jobno || "-";
      const bid = item.b_id || "-";

      if (!byUnit[unit]) byUnit[unit] = [];
      byUnit[unit].push({
        unit, job_no: job, b_id: String(bid),
        master: mst, sub, bundle: bunidKey, pcs_count: pcs,
        receiveDate: fmt(dt), _rdtISO: dt,
        ageing: ageing(dt), risk: risk(dt),
      });
    });

    const sortedKeys = Object.keys(byUnit).sort(
      (a, b) => Number(a.replace("UNIT-", "")) - Number(b.replace("UNIT-", ""))
    );

    const summaries = sortedKeys.map(unitName => {
      const rows = byUnit[unitName];
      return {
        unitName,
        totalCount: rows.length,
        sumMaster:  rows.reduce((a, r) => a + r.pcs_count, 0),
        sumSub:     rows.reduce((a, r) => a + r.sub, 0),
        jobs:       [...new Set(rows.map(r => r.job_no).filter(j => j !== "-"))].join(", "),
      };
    });

    setReceivePendingSummary(summaries);
    setReceivePendingRows(Object.values(byUnit).flat());
  };

  // ─────────────────────────────────────────────────────────────
  // buildAllUnitModalCounts — uses bundleDataApi only
  // scan=0 → pending counts   |   scan=1 → complete counts
  // ─────────────────────────────────────────────────────────────
  const buildAllUnitModalCounts = () => {
    const counts = {};

    // ── PENDING: scan=0 ──
    bundleDataApi.forEach(item => {
      if (String(item.scan) !== "0") return;

      const unit = normaliseUnit(item.unitname || item.unit_name || item.unit_id);
      if (!unit) return;

      const dt = parseDate(item.s_date || item.date);
      if (!dt) return;
      if (filterStart && dt < filterStart) return;
      if (filterEnd   && dt > filterEnd)   return;

      const sub = Number(item.total_bundles || 0);
      const pcs = Number(item.pcs_count || 0);

      if (!counts[unit]) counts[unit] = { pending: 0, complete: 0, mstPending: 0, subPending: 0, mstComplete: 0, subComplete: 0 };
      counts[unit].pending++;
      counts[unit].subPending += sub;
      counts[unit].mstPending += pcs;
    });

    // ── COMPLETE: scan=1 ──
    bundleDataApi.forEach(item => {
      if (String(item.scan) !== "1") return;

      const unit = normaliseUnit(item.unitname || item.unit_name || item.unit_id);
      if (!unit) return;

      const sDateISO = parseDate(item.s_date || item.date);
      if (!sDateISO) return;
      if (filterStart && sDateISO < filterStart) return;
      if (filterEnd   && sDateISO > filterEnd)   return;

      const sub = Number(item.total_bundles || item.pcs_count || 0);
      const pcs = Number(item.pcs_count || item.total_bundles || 0);

      if (!counts[unit]) counts[unit] = { pending: 0, complete: 0, mstPending: 0, subPending: 0, mstComplete: 0, subComplete: 0 };
      counts[unit].complete++;
      counts[unit].subComplete += sub;
      counts[unit].mstComplete += pcs;
    });

    setUnitModalCounts(counts);
  };

  // ─────────────────────────────────────────────────────────────
  // buildModalRows — uses bundleDataApi only
  // scan=0 → pending table rows   |   scan=1 → complete table rows
  // ─────────────────────────────────────────────────────────────
  const buildModalRows = () => {
    const mPending  = [];
    const mComplete = [];

    // ── PENDING rows: scan=0 ──
    bundleDataApi.forEach(item => {
      if (String(item.scan) !== "0") return;

      const unit = normaliseUnit(item.unitname || item.unit_name || item.unit_id);
      if (!unit) return;
      if (selectedUnit && unit !== selectedUnit) return;

      const sDateISO = parseDate(item.s_date || item.date);
      if (!sDateISO) return;
      if (filterStart && sDateISO < filterStart) return;
      if (filterEnd   && sDateISO > filterEnd)   return;

      const rDateISO = parseDate(item.r_date) || sDateISO;
      const subBdl   = Number(item.total_bundles || 0);
      const pcsCount = Number(item.pcs_count || 0);
      const jobNo    = item.job_no || item.jobno || "-";
      const bid      = item.id || item.b_id || "-";
      const mbundleId = item.mbundle_id || item.mbunid || "-";

      mPending.push({
        unit,
        job_no:      jobNo,
        b_id:        String(bid),
        master:      pcsCount,
        sub:         subBdl,
        bundle:      String(mbundleId),
        pcs_count:   pcsCount,
        receiveDate: fmt(rDateISO),
        scannedDate: "-",
        ageing:      ageing(rDateISO),
        risk:        risk(rDateISO),
        _rdtISO:     rDateISO,
      });
    });

    // ── COMPLETE rows: scan=1 ──
    bundleDataApi.forEach(item => {
      if (String(item.scan) !== "1") return;

      const unit = normaliseUnit(item.unitname || item.unit_name || item.unit_id);
      if (!unit) return;
      if (selectedUnit && unit !== selectedUnit) return;

      const sDateISO = parseDate(item.s_date || item.date);
      if (!sDateISO) return;
      if (filterStart && sDateISO < filterStart) return;
      if (filterEnd   && sDateISO > filterEnd)   return;

      const rDateISO  = parseDate(item.r_date) || null;
      const subBdl    = Number(item.total_bundles || item.pcs_count || 0);
      const pcs       = Number(item.pcs_count || item.total_bundles || 0);
      const jobNo     = item.job_no || item.jobno || "-";
      const bid       = item.id || item.b_id || "-";
      const mbundleId = item.mbundle_id || item.mbunid || "-";

      mComplete.push({
        unit,
        job_no:      jobNo,
        b_id:        String(bid),
        master:      pcs,
        sub:         subBdl,
        bundle:      String(mbundleId),
        pcs_count:   pcs,
        receiveDate: fmt(rDateISO),
        scannedDate: fmt(sDateISO),
        ageing:      rDateISO ? ageing(rDateISO, sDateISO) : ageing(sDateISO),
        risk:        rDateISO ? risk(rDateISO, sDateISO)   : risk(sDateISO),
        _rdtISO:     rDateISO,
      });
    });

    setModalPendingRows(mPending);
    setModalCompletedRows(mComplete);
  };

  // ─────────────────────────────────────────────────────────────
  // TABLE HELPERS
  // ─────────────────────────────────────────────────────────────
  const rowSpans = (rows, key) => rows.map((r, i) => {
    if (i > 0 && rows[i][key] === rows[i - 1][key]) return 0;
    let c = 1;
    for (let j = i + 1; j < rows.length; j++) { if (rows[j][key] === r[key]) c++; else break; }
    return c;
  });

  const activeRows = modalFilter === "pending" ? modalPendingRows : modalCompletedRows;

  const normalCount   = activeRows.filter(r => r.risk === "Normal").length;
  const riskCount     = activeRows.filter(r => r.risk === "Risk").length;
  const highRiskCount = activeRows.filter(r => r.risk === "High Risk").length;

  const riskBadge = (r) => ({
    "High Risk": "bg-red-100 text-red-600",
    "Risk":      "bg-orange-100 text-orange-600",
    "Normal":    "bg-green-100 text-slate-700",
    "Complete":  "bg-emerald-100 text-emerald-600",
  }[r] || "bg-yellow-100 text-yellow-700");

  const renderRows = (rows) => {
    if (!rows.length) return (
      <tr>
        <td colSpan={modalFilter === "complete" ? 10 : 9}
          className="p-10 text-center text-slate-400 text-sm font-semibold">
          No records found for this date range.
        </td>
      </tr>
    );

    const sortedRows = [...rows].sort((a, b) =>
      String(a.job_no).localeCompare(String(b.job_no))
    );

    const rs = rowSpans(sortedRows, "receiveDate");
    const us = rowSpans(sortedRows, "unit");
    const js = rowSpans(sortedRows, "job_no");
    const bs = rowSpans(sortedRows, "b_id");

    return sortedRows.map((row, i) => (
      <tr key={i} className="border-b border-slate-200/60 hover:bg-slate-50/80 text-center text-[11px]">
        {rs[i] > 0 && <td rowSpan={rs[i]} className="p-3 border border-gray-300 bg-blue-50/40 font-bold text-blue-700 align-middle">{row.receiveDate}</td>}
        {us[i] > 0 && <td rowSpan={us[i]} className="p-3 border border-gray-300 bg-white font-semibold text-slate-800 align-middle">{row.unit}</td>}
        {js[i] > 0 && <td rowSpan={js[i]} className="p-3 border border-gray-300 bg-white font-semibold text-slate-800 align-middle">{row.job_no}</td>}
        {bs[i] > 0 && <td rowSpan={bs[i]} className="p-3 border border-gray-300 bg-blue-50/40 font-bold text-blue-700 align-middle">{row.b_id}</td>}
        <td className="p-3 text-slate-500 border border-gray-300">{row.sub}</td>
        <td className="p-3 font-mono text-slate-600 border border-gray-300">{row.bundle}</td>
        <td className="p-3 font-mono text-slate-600 border border-gray-300">{row.pcs_count}</td>
        {modalFilter === "complete" && <td className="p-3 text-emerald-600 font-semibold border border-gray-300">{row.scannedDate}</td>}
        <td className="p-3 font-bold text-slate-600 border border-gray-300">{row.ageing}</td>
        <td className="p-3 border border-gray-300">
          <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${riskBadge(row.risk)}`}>
            {row.risk}
          </span>
        </td>
      </tr>
    ));
  };

  const getRpSortedRows = (rows) => {
    const riskOrder = { "High Risk": 1, "Risk": 2, "Normal": 3 };
    return [...rows].sort((a, b) => {
      if (a._rdtISO !== b._rdtISO) return new Date(a._rdtISO) - new Date(b._rdtISO);
      if (riskOrder[a.risk] !== riskOrder[b.risk]) return riskOrder[a.risk] - riskOrder[b.risk];
      return String(a.job_no).localeCompare(String(b.job_no));
    });
  };

  const sortedUnitSummaries = [...unitSummaries]
    .filter(u => searchUnit === "All" || u.unitName === searchUnit)
    .sort(
      (a, b) =>
        Number(a.unitName.replace("UNIT-", "")) -
        Number(b.unitName.replace("UNIT-", ""))
    );

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="p-8 bg-[#fdfdfd] min-h-screen font-sans text-slate-900">
      <div className="max-w-screen-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Unit Bundle Tracking Dashboard</h1>
            <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full"/>
            <p className="text-slate-500 text-sm mt-3 font-medium tracking-wide uppercase">Operational Throughput Control</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-white shadow-sm border border-slate-200 p-2 rounded-2xl">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 px-1 mb-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Range Filter</span>
                {!filterStart && !filterEnd && (
                  <span className="text-[9px] font-black text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">All Time</span>
                )}
              </div>
              <div className="flex items-center bg-slate-50 rounded-xl px-3 py-1">
                <span className="text-slate-400 text-[11px] font-bold mr-2 uppercase">From:</span>
                <input type="date" value={filterStart} min="2026-05-06" max={today} onChange={e => setFilterStart(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold p-2 outline-none text-slate-600"/>
                <span className="text-slate-400 text-[11px] font-bold mx-2 uppercase">To:</span>
                <input type="date" value={filterEnd} min="202630-05-06" max="{today}" onChange={e => setFilterEnd(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold p-2 outline-none text-slate-600"/>
              </div>
            </div>
            <select value={searchUnit} onChange={e => setSearchUnit(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer font-bold text-slate-700 outline-none text-xs">
              <option value="All">All Units</option>
              {allUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 cursor-pointer py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
              ↺ Refresh
            </button>
            <button onClick={() => { setFilterStart(""); setFilterEnd(""); setSearchUnit("All"); }}
              className="bg-slate-900 hover:bg-blue-700 text-white px-5 cursor-pointer py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
              Reset
            </button>
            <button onClick={() => window.history.back()}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm font-semibold text-slate-700 hover:bg-slate-50">
              ← Back
            </button>
          </div>
        </div>

        {/* ── Risk Legend ── */}
        <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase">
          <span className="text-slate-400 tracking-widest">Risk Scale:</span>
          <span className="px-2.5 py-1 rounded-md bg-yellow-100 text-yellow-700">Normal (0–2d)</span>
          <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-600">Risk (2–5d)</span>
          <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-600">High Risk (&gt;5d)</span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-600">Complete</span>
        </div>

        {loading && <div className="loader"></div>}

        {!loading && sortedUnitSummaries.length === 0 && receivePendingSummary.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-2xl font-black mb-2">No Data</p>
            <p className="text-sm font-semibold">No records match the selected filters.</p>
          </div>
        )}

        {/* ── Receive Pending Summary Cards ── */}
        {receivePendingSummary.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-sm font-black text-amber-700 uppercase tracking-widest">Receive Pending Overview</h2>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full">
                {receivePendingRows.length} Total Pending
              </span>
              <span className="text-[9px] text-slate-400 font-semibold">
                {(filterStart || filterEnd ? `${filterStart ? fmt(filterStart) : "…"} — ${filterEnd ? fmt(filterEnd) : "…"}` : "All Time")}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {receivePendingSummary.map((s, i) => (
                <div key={i}
                  onClick={() => setReceivePendingUnit(s.unitName)}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:bg-amber-100 hover:shadow-md transition-all group">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{s.unitName}</p>
                  <p className="text-3xl font-black text-amber-600 group-hover:scale-105 transition-transform">{s.totalCount}</p>
                  <div className="flex gap-2 mt-2 text-[10px] font-bold text-amber-700">
                    <span>SUB:{s.sumSub}</span>
                    <span>PCS:{s.sumMaster}</span>
                  </div>
                  <p className="text-[9px] text-amber-400 mt-1 truncate">{s.jobs || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Unit Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedUnitSummaries.map((unit, idx) => {
            const mc = unitModalCounts[unit.unitName] || {
              pending: 0, complete: 0,
              mstPending: 0, subPending: 0,
              mstComplete: 0, subComplete: 0,
            };
            return (
              <div key={idx}
                onClick={() => { setSelectedUnit(unit.unitName); setModalFilter("pending"); }}
                className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{unit.unitName}</h3>
                    <p className="text-[10px] text-blue-600 font-bold uppercase mt-1 tracking-widest">Active Batch</p>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-500 uppercase">Live</div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mb-4 uppercase truncate bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Jobs: <span className="text-slate-700">{unit.jobs || "No Data"}</span>
                </p>
                <div className="mb-1">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">
                    Today's Summary&nbsp;
                    <span className="text-blue-400">
                      {(filterStart || filterEnd ? `${filterStart ? fmt(filterStart) : "…"} — ${filterEnd ? fmt(filterEnd) : "…"}` : "All Time")}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-red-400 text-[9px] font-bold uppercase">Pending</p>
                      <div className="flex gap-2 text-[15px] font-black text-red-700">
                        <span>SUB:{mc.subPending}</span>
                        <span>PCS:{mc.mstPending}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-red-600">{mc.pending}</p>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-emerald-400 text-[9px] font-bold uppercase">Complete</p>
                      <div className="flex gap-2 text-[15px] font-black text-emerald-700">
                        <span>SUB:{mc.subComplete}</span>
                        <span>PCS:{mc.mstComplete}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-emerald-600">{mc.complete}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Receive Pending Unit Modal ── */}
        {receivePendingUnit && (() => {
          const rows   = receivePendingRows.filter(r => r.unit === receivePendingUnit);
          const sorted = getRpSortedRows(rows);
          const rs = rowSpans(sorted, "receiveDate");
          const js = rowSpans(sorted, "job_no");
          const bs = rowSpans(sorted, "b_id");

          const normalCount   = sorted.filter(r => r.risk === "Normal").length;
          const riskCount     = sorted.filter(r => r.risk === "Risk").length;
          const highRiskCount = sorted.filter(r => r.risk === "High Risk").length;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">

                {/* Header */}
                <div className="px-8 py-5 flex justify-between items-center bg-amber-50/50 border-b border-amber-200">
                  <div className="flex items-center gap-5">
                    <button onClick={() => setReceivePendingUnit(null)}
                      className="h-10 w-10 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{receivePendingUnit}</h2>
                      <p className="text-amber-600 font-bold text-[10px] uppercase tracking-widest mt-1">
                        Receive Pending — {(filterStart || filterEnd ? `${filterStart ? fmt(filterStart) : "…"} — ${filterEnd ? fmt(filterEnd) : "…"}` : "All Time")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 px-5 py-2 rounded-xl text-center">
                    <p className="text-[9px] font-black text-amber-500 uppercase">Total Pending</p>
                    <p className="text-xl font-black text-amber-600">{rows.length}</p>
                  </div>
                  <button onClick={() => setReceivePendingUnit(null)}
                    className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 flex items-center justify-center font-bold text-slate-400">✕</button>
                </div>

                {/* Risk Summary Bar */}
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 flex-wrap">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Totals:</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 border border-green-200">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Normal</span>
                    <span className="text-[15px] font-black text-green-700">{normalCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-200">
                    <span className="text-[10px] font-black text-orange-500 uppercase">Risk</span>
                    <span className="text-[15px] font-black text-orange-700">{riskCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 border border-red-200">
                    <span className="text-[10px] font-black text-red-500 uppercase">High Risk</span>
                    <span className="text-[15px] font-black text-red-700">{highRiskCount}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 border border-amber-200">
                    <span className="text-[10px] font-black text-amber-500 uppercase">Total</span>
                    <span className="text-[15px] font-black text-amber-700">{sorted.length}</span>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        <th className="p-4 border border-gray-200 bg-white/90">Received Date</th>
                        <th className="p-4 border border-gray-200 bg-white/90">Unit</th>
                        <th className="p-4 border border-gray-200 bg-white/90">Job No</th>
                        <th className="p-4 border border-gray-200 bg-white/90">DC ID</th>
                        <th className="p-4 border border-gray-200 bg-white/90">Master Bundle ID</th>
                        <th className="p-4 border border-gray-200 bg-white/90">Sub</th>
                        <th className="p-4 border border-gray-200 bg-white/90">PCS</th>
                        <th className="p-4 border border-gray-200 bg-white/90">Ageing</th>
                        <th className="p-4 border border-gray-200 bg-white/90">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-10 text-center text-slate-400 text-sm font-semibold">No records found.</td>
                        </tr>
                      ) : sorted.map((row, i) => (
                        <tr key={i} className="border-b border-slate-200/60 hover:bg-amber-50/40 text-center text-[11px]">
                          {rs[i] > 0 && <td rowSpan={rs[i]} className="p-3 border border-gray-300 bg-amber-50/60 font-bold text-amber-700 align-middle">{row.receiveDate}</td>}
                          {rs[i] > 0 && <td rowSpan={rs[i]} className="p-3 border border-gray-300 bg-blue-50/60 font-bold text-blue-700 align-middle">{row.unit}</td>}
                          {js[i] > 0 && <td rowSpan={js[i]} className="p-3 border border-gray-300 bg-white font-semibold text-slate-800 align-middle">{row.job_no}</td>}
                          {bs[i] > 0 && <td rowSpan={bs[i]} className="p-3 border border-gray-300 bg-amber-50/60 font-bold text-amber-700 align-middle">{row.b_id}</td>}
                          <td className="p-3 font-mono text-slate-600 border border-gray-300">{row.bundle}</td>
                          <td className="p-3 text-slate-500 border border-gray-300">{row.sub}</td>
                          <td className="p-3 font-mono text-slate-600 border border-gray-300">{row.pcs_count}</td>
                          <td className="p-3 font-bold text-slate-600 border border-gray-300">{row.ageing}</td>
                          <td className="p-3 border border-gray-300">
                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${riskBadge(row.risk)}`}>
                              {row.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Main Unit Modal ── */}
        {selectedUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
              <div className="px-8 py-5 flex justify-between items-center bg-slate-50/50 border-b border-slate-200">
                <div className="flex items-center gap-5">
                  <button onClick={() => setSelectedUnit(null)}
                    className="h-10 w-10 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedUnit}</h2>
                    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-1">
                      {(filterStart || filterEnd ? `${filterStart ? fmt(filterStart) : "…"} — ${filterEnd ? fmt(filterEnd) : "…"}` : "All Time")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl text-center">
                    <p className="text-[9px] font-black text-red-400 uppercase">Pending</p>
                    <p className="text-xl font-black text-red-600">{modalPendingRows.length}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-center">
                    <p className="text-[9px] font-black text-emerald-400 uppercase">Complete</p>
                    <p className="text-xl font-black text-emerald-600">{modalCompletedRows.length}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUnit(null)}
                  className="h-10 w-10 rounded-full hover:bg-red-50 hover:text-red-500 flex items-center justify-center font-bold text-slate-400">✕</button>
              </div>

              <div className="flex gap-1 p-2 bg-slate-100/50 border-b border-slate-200">
                {["pending", "complete"].map(type => (
                  <button key={type} onClick={() => setModalFilter(type)}
                    className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      modalFilter === type
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                        : "text-slate-400 hover:text-slate-600"
                    }`}>
                    {type} ({type === "pending" ? modalPendingRows.length : modalCompletedRows.length})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 flex-wrap">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Totals:</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 border border-green-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Normal</span>
                  <span className="text-[15px] font-black text-green-700">{normalCount}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-200">
                  <span className="text-[10px] font-black text-orange-500 uppercase">Risk</span>
                  <span className="text-[15px] font-black text-orange-700">{riskCount}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 border border-red-200">
                  <span className="text-[10px] font-black text-red-500 uppercase">High Risk</span>
                  <span className="text-[15px] font-black text-red-700">{highRiskCount}</span>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 border border-blue-200">
                  <span className="text-[10px] font-black text-blue-500 uppercase">Total</span>
                  <span className="text-[15px] font-black text-blue-700">{activeRows.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-white">
                <table className="w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      <th className="p-4 border-x bg-white/90">Received Date</th>
                      <th className="p-4 bg-white/90">Unit</th>
                      <th className="p-4 border-x bg-white/90">Job No</th>
                      <th className="p-4 bg-white/90">DC ID</th>
                      <th className="p-4 border-x bg-white/90">Sub</th>
                      <th className="p-4 border-x bg-white/90">Master Bundle ID</th>
                      <th className="p-4 border-x bg-white/90">PCS</th>
                      {modalFilter === "complete" && <th className="p-4 border-x bg-white/90">Scanned Date</th>}
                      <th className="p-4 border-x bg-white/90">Ageing</th>
                      <th className="p-4 border-x bg-white/90">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRows(modalFilter === "pending" ? modalPendingRows : modalCompletedRows)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Bundel;