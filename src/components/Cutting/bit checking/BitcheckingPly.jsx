import React, { useState, useEffect, useRef } from "react";

export default function BitCheckingUI() {

  // 🔹 API states
  const [stickData, setStickData] = useState([]);
  const [bitData, setBitData] = useState([]);
  const [qrValue, setQrValue] = useState("");
  // const [detPart, setDetPart] = useState("");

  const [isExisting, setIsExisting] = useState(false);
  const [totalPcs, setTotalPcs] = useState(100); // default
  const columns = 22 ;
  const qrInputRef = useRef();

  const [empValue, setEmpValue] = useState("");
  const [empData, setEmpData] = useState([]);
  const [filteredEmp, setFilteredEmp] = useState([]);
  const [empName, setEmpName] = useState("");

  useEffect(() => {
    fetch("https://app.herofashion.com/stick/")
      .then(res => res.json())
      .then(data => setEmpData(data));
  }, []);

  const handleEmpChange = (value) => {
    setEmpValue(value);
    const result = empData.filter(item =>
      String(item.code).includes(value)
    );
    setFilteredEmp(result);
  };

  const handleEmpSelect = (item) => {
    setEmpValue(item.code);       
    setEmpName(item.employee);    
    setFilteredEmp([]);         
  };

  // 🔹 Dynamic tabs
  const [tabs, setTabs] = useState(["front", "back"]);
  const [activeTab, setActiveTab] = useState("front");

  const [selected, setSelected] = useState({});

  // 🔹 Fetch APIs
  useEffect(() => {
    fetch("https://app.herofashion.com/stick_list/")
      .then(res => res.json())
      .then(data => setStickData(data));

    fetch("https://app.herofashion.com/bitcheck/")
      .then(res => res.json())
      .then(data => setBitData(data));
  }, []);


  // QR Scan Logic
const handleQrScan = async (qr) => {
  setQrValue(qr);

  try {
    const res = await fetch(`https://app.herofashion.com/bit_ply/`);
    const data = await res.json();

    const filteredData = data.filter(
      item => String(item.qr_id) === String(qr)
    );

    if (filteredData.length > 0) {
      setIsExisting(true);

      setEmpValue(filteredData[0].emp_id)
      const empMatch = empData.find(
        emp => String(emp.code) === String(filteredData[0].emp_id)
      );

      if (empMatch) {
        setEmpName(empMatch.employee);
      }
      const tabSet = new Set();
      const newSelected = {};

      filteredData.forEach(item => {
        const [tab, values] = item.category.split("-");
        const cleanTab = tab.trim().toLowerCase();
        const nums = values
          ? values.split(",").map(n => Number(n.trim()))
          : [];

        tabSet.add(cleanTab);
        newSelected[cleanTab] = nums;
      });

      setTabs(Array.from(tabSet));
      setSelected(newSelected);
      setActiveTab(Array.from(tabSet)[0]);
      setTotalPcs(filteredData[0].total_pcs);
      return;
    }

    setIsExisting(false);
    setEmpName("");
    setEmpValue("");

    const stickItem = stickData.find(
      item => item.sl === Number(qr)
    );

    if (!stickItem) return;
    const { planno, topbott_id, pc } = stickItem;
    setTotalPcs(pc);
    const matchedParts = bitData.filter(
      item =>
        item.planno === planno &&
        item.topbottom_id === topbott_id
    );

    const tabSet = new Set();

    matchedParts.forEach(item => {
      const part = item.det_part.trim().toLowerCase();

      if (part === "sleeve") {
        tabSet.add("sleeve left");
        tabSet.add("sleeve right");
      } else {
        tabSet.add(part);
      }
    });

    const finalTabs = Array.from(tabSet);

    setTabs(finalTabs);
    setActiveTab(finalTabs[0]);
    setSelected({}); // reset

  } catch (error) {
    console.error("QR check error:", error);
  }
};
  const handleSave = async () => {

    if(!empValue){
      alert("Please Select Employee ID");
      return
    }

    if(!qrValue){
      alert("Please Scan QR ID");
      return
    }

    if (!totalPcs) {
      alert("Total PCS Missing");
      return;
    }

    try {
       const requests = tabs.map((tab) => {

        const values = (selected[tab] || []).filter(
          v => v !== undefined && v !== null && v !== 0
        );

        const outValues = unique.filter(
          num => !values.includes(num)
        );

        const payload = {
          emp_id: empValue,
          qr_id: qrValue,
          total_pcs: totalPcs,
          category: tab,
          mistake_ply: values.length > 0 ? values.join(",") : "0",
          result: unique.join(","), 
          final_tpcs: unique.length,
          out_ply: `${outValues.join(",")}`,
          mistake_pcs: values.length,
          ok_pcs: outValues.length
        };

        return fetch("https://app.herofashion.com/bit_ply/", {   
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      });

      const responses = await Promise.all(requests);
      const hasError = responses.some(res => !res.ok);

      if (hasError) {
        alert("Save Failed ❌");
      } else {
        alert("Saved Successfully ✅");
      }

      setQrValue(""); 

      if(qrInputRef.current){
        qrInputRef.current.value=""
      }

    } catch (error) {
      console.error(error);
      alert("Error saving ❌");
    }
  };

  const handleClear = () => {
    setSelected({});
    setQrValue("");
    setTotalPcs(0);
    setTabs([]);
    setActiveTab("");
    setEmpName("");
    setEmpValue("");
    if(qrInputRef.current){
      qrInputRef.current.value=''
    }
  };

  // 🔹 Generate grid
  const getGrid = () => {
    const rows = Math.ceil(totalPcs / columns);
    const grid = [];
    let num = 1;

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        if (num <= totalPcs) row.push(num++);
      }
      grid.push(row);
    }

    return grid;
  };

  const grid = getGrid();

  // 🔹 Toggle (UNCHANGED as you requested)
  const toggleSelect = (num) => {
    setSelected((prev) => {
      const current = prev[activeTab] || [];
      const exists = current.includes(num);
      let updated;
      if (exists) {
        updated = current.filter((v) => v !== num);
      } else {
        updated = [...current, num];
      }
      //SORT HERE
      updated.sort((a, b) => a - b);
      return {
        ...prev,
        [activeTab]: updated
      };
    });
  };

  // 🔹 Final result
  const allSelected = Object.values(selected).flat();
  const unique = [...new Set(allSelected)].sort((a, b) => a - b);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">

      {/* 🔹 QR INPUT (no UI change style, simple add) */}
      <div className="mb-4 bg-white rounded-xl">
        <input
          type="text"
          placeholder="Scan QR"
          ref={qrInputRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleQrScan(e.target.value);
            }
           }}
          className="border p-2 w-full focus:border-transparent outline-none border-none"
        />
      </div>
    
      {/* HEADER */}
      <div className="bg-white shadow-md rounded-2xl pl-4 pr-4 pt-2 mb-4 flex justify-between">
        <div>
          <p className="text-md text-gray-500">Employee Code</p>
          <input
              type="text"
              placeholder="Enter Emp ID"
              value={empValue}
              onChange={(e) => handleEmpChange(e.target.value)}
              className="text-lg font-semibold p-2 rounded w-full outline-none focus:border-transparent"
            />
              {empValue && filteredEmp.length > 0 && (
                <div className="bg-white shadow rounded mt-2 max-h-40 overflow-auto absolute z-10 w-full border">
                  {filteredEmp.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => handleEmpSelect(item)}
                    >
                      {item.code} - {item.employee}
                    </div>
                  ))}
                </div>
              )}
        </div>

        <div>
          <p className="text-md text-gray-500">Employee Name</p> 
          <p className="font-semibold text-lg mt-2">{empName}</p>
        </div>

        <div>
          <p className="text-md text-gray-500">QR ID</p>
          <p className="font-semibold text-lg">{qrValue}</p>
        </div>

        <div>
          <p className="text-md text-gray-500">Total PCS</p>
          <p className="font-semibold text-lg">{totalPcs}</p>
        </div>
      </div>

      {/* 🔵 TABS */}
      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 rounded-lg capitalize font-md text-md ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {tab === "left"
              ? "Sleeve Left"
              : tab === "right"
              ? "Sleeve Right"
              : tab}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="bg-white shadow-md rounded-2xl p-4 overflow-auto">
        {grid.map((row, i) => (
          <div key={i} className="flex gap-2 mb-2">
            {row.map((num) => (
              <div
                key={num}
                onClick={() => toggleSelect(num)}
                className={`w-10 h-10 md:w-15 md:h-15 lg:w-20 lg:h-20 flex items-center justify-center border-none rounded cursor-pointer text-sm
                  ${
                    selected[activeTab]?.includes(num)
                      ? "bg-yellow-400"
                      : "bg-gray-100"
                  }`}
              >
                {num}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {tabs.map(tab => {
          const currentValues = selected[tab] || [];
          const outValues = unique.filter(
            num => !currentValues.includes(num)
          );
          return (
            <div key={tab} className="bg-white p-3 rounded-2xl shadow">
              <p className="text-gray-500 text-sm capitalize">{tab} :<span className="font-semibold text-black">{" "}{currentValues.join(", ")}</span>
              <span className="font-semibold text-grey float-right">Mistake pcs : {currentValues.length}</span></p><br />
              <p className="text-gray-500 text-sm capitalize">Out {tab} :<span className="font-semibold text-black">{" "}{outValues.join(", ")}</span>
              <span className="font-semibold text-grey float-right">Ok Pcs : {outValues.length}</span></p>
            </div>
          );
        })}
      </div>

      {/* RESULT */}
      <div className="mt-4 bg-blue-600 text-white p-3 rounded-2xl shadow flex justify-between text-sm">
        <p>Total PCS: {unique.length}</p>
        <p>{unique.join(", ")}</p>
      </div>

      <div className="mt-4 flex gap-4">
        {!isExisting && (
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-1 rounded-lg"
              >
                Save
              </button>
        )}
        <button
          onClick={handleClear}
          className="bg-red-600 text-white px-4 py-1 rounded-lg"
          >
          Clear
        </button>
      </div>
    </div>
  );
}