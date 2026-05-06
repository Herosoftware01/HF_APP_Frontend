import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Sticker = () => {
  // --- States ---
  const [employees, setEmployees] = useState([]);
  const [stickList, setStickList] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [selectedEmp, setSelectedEmp] = useState({ name: '', photo: '' });

  const qrInputRef = useRef(null);
  const empInputRef = useRef(null);
  const navigate = useNavigate();

  const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [scanTime, setScanTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const updateTime = () => setScanTime(getCurrentDateTime());
    updateTime(); // immediate
    const interval = setInterval(updateTime, 1000); // every second
    return () => clearInterval(interval);
  }, []);

  const [formData, setFormData] = useState({
    jobno: '',
    topbottom_des: '',
    clrcombo: '',
    size: '',
    lotno: '',
    ratio: '',
    sizeid: '',
    porid: '',
    pordesc: ''
  });

  const [isTabletOrBelow, setIsTabletOrBelow] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsTabletOrBelow(window.innerWidth <= 1100); 
      // 1024px = tablet breakpoint (adjust if needed)
    };

    checkScreen(); // run on load
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleQrButtonClick = () => {
    if (!qrInputRef.current) return;

    const fakeEvent = {
      target: { value: qrInputRef.current.value }
    };

    handleQrChange(fakeEvent);
  };

  const [tableData, setTableData] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const [newRows, setNewRows] = useState([]);

  // --- Derived ---
  const noOfRows = tableData.length;
  const totalPc = tableData.reduce((sum, item) => sum + (Number(item.pc) || 0), 0);

  // --- Fetch API Data ---
  useEffect(() => {
    fetch('https://app.herofashion.com/stick/')
      .then(res => res.json())
      .then(data => setEmployees(Array.isArray(data) ? data : [data]));

    fetch('https://app.herofashion.com/stick_list/')
      .then(res => res.json())
      .then(data => setStickList(Array.isArray(data) ? data : [data]));
  }, []);

  // auto focus on employee ID
  useEffect(() => {
    if (empInputRef.current) {
      empInputRef.current.focus();
    }
  }, []);

  // --- Handlers ---
  const handleIdChange = (e) => {
    const value = e.target.value;
    setSearchCode(value);

    const match = employees.find(emp => emp.code.toString() === value);

    if (match) {
      setSelectedEmp({ name: match.employee, photo: match.photo });

      // 👉 move focus to QR
      setTimeout(() => {
        qrInputRef.current?.focus();
      }, 100);
    } else {
      setSelectedEmp({ name: '', photo: '' });
    }
  };

  const handleQrChange = async (e) => {
    const val = e.target.value.trim();

    const match = stickList.find(item =>
      item.sl.toString() === val || item.sizeid?.toString() === val
    );

    if (!match) {
      toast.warn("Invalid QR Code");
      qrInputRef.current.value = "";
      return;
    }

    try {
      const res = await fetch("https://app.herofashion.com/check_ratio/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratio_id: match.sl })
      });

      const data = await res.json();

      if (data.status === "duplicate") {
        toast.error(`Ratio QR already exists: ${val}`);
        qrInputRef.current.value = "";
        return;
      }

      const alreadyExists = tableData.some(
        row => row.sl === match.sl
      );

      if (alreadyExists) {
        toast.warn("Duplicate QR - Already Scanned");
        qrInputRef.current.value = "";
        return;
      }

      // ✅ Safe → Add to table
      setFormData({
        jobno: match.jobno,
        topbottom_des: match.topbottom_des,
        clrcombo: match.clrcombo,
        size: match.size,
        lotno: match.lotno,
        ratio: match.ratio,
        sizeid: match.sizeid,
        porid: match.porid,
        pordesc: match.pordesc
      });

      setTableData(prev => [...prev, match]);
      setNewRows(prev => [...prev, match]);

    } catch {
      toast.error("Server error");
    }

    qrInputRef.current.value = "";
  };


  const handleClearForm = () => {
     // clear date
    setScanTime(getCurrentDateTime());

    // clear employee
    setSearchCode("");
    setSelectedEmp({ name: "", photo: "" });

    // clear form fields
    setFormData({
      jobno: "",
      topbottom_des: "",
      clrcombo: "",
      size: "",
      lotno: "",
      ratio: "",
      sizeid: "",
      pordesc: "",
      porid: ""
    });

    // clear update lock
    setIsUpdated(false);
    setTableData([]);

    // clear QR input (uncontrolled)
    if (qrInputRef.current) {
      qrInputRef.current.value = "";
    }

    setTimeout(() => {
      empInputRef.current?.focus();
    }, 100);
  };

  // --- UPDATE LOGIC (ONE TIME ONLY) ---
  const handleUpdate = async () => {

    if (!newRows.length) {
      toast.warn("No data to update");
      return;
    }

    let savedCount = 0;
    let duplicateCount = 0;

    try {

      for (const row of newRows) {

        const payload = {
          ratio_id: row.sl,
          planno: row.planno,
          jobno: row.jobno,
          topbott_id: row.topbott_id,
          clrcombo: row.clrcombo,
          colour: row.colour,
          lotno: row.lotno,
          sc: row.sc,
          plansl: row.plansl,
          sizeid: row.sizeid,
          ratio_no: row.ratio,
          pc: row.pc,
          time: scanTime,
          employee_id: searchCode,
          employee_name: selectedEmp.name,
          topbottom_des: row.topbottom_des,
          size: row.size,
          porid: row.porid,
          pordesc: row.pordesc
        };

        const res = await fetch("https://app.herofashion.com/stick_dtls/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === "duplicate") {
          duplicateCount++;
          continue;
        }

        if (!res.ok) throw new Error();

        savedCount++;
      }

      // ✅ Final messages
      if (savedCount > 0) {
        toast.success(`Update completed (${savedCount} saved)`);
      } 
      else if (duplicateCount > 0) {
        toast.warn("Already updated");
      } 
      else {
        toast.warn("No data updated");
      }

      setNewRows([]);
      setFormData({
        jobno: "",
        topbottom_des: "",
        clrcombo: "",
        size: "",
        lotno: "",
        ratio: "",
        sizeid: "",
        pordesc: "",
        porid: ""
      });
      setTableData([]);
      setSearchCode("");
      setSelectedEmp({ name: "", photo: "" });
      setScanTime(getCurrentDateTime());

    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 font-sans text-xs pb-20">
      <div className="flex flex-wrap gap-8 mb-4">

        {/* Left Column */}
        <div className="flex flex-col lg:gap-4 sm:gap-3 xs:gap-2 min-w-[250px]">
          <div>
            <label className="block text-blue-700 font-bold mb-1">Date</label>
            <input
              type="datetime-local"
              value={scanTime || ""}
              onChange={(e) => setScanTime(e.target.value)}
              className="w-full border border-gray-300 p-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-blue-700 font-bold mb-1 uppercase">Ratio Qr Code Id</label>
            <input
              type="text"
              ref={qrInputRef}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleQrChange(e);
                }
              }}
              className="w-full border border-blue-400 p-3 mb-2 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          {isTabletOrBelow && (
            <div>
              <button
                onClick={handleQrButtonClick}
                className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 mb-2"
              >
                Check the QR
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 border-2 border-blue-800 rounded-sm overflow-hidden lg:mt-20">
            <div className="bg-blue-800 text-white p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold">No. of Rows</span>
              <span className="text-xl font-black">{noOfRows}</span>
            </div>
            <div className="bg-white text-blue-800 p-2 flex flex-col items-center justify-center border-l-2 border-blue-800">
              <span className="text-[10px] uppercase font-bold">Total PC</span>
              <span className="text-xl font-black">{totalPc}</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1">
          <div className="grid grid-cols-12 gap-x-4 gap-y-3">
            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Employee ID</label>
              <input
                type="text"
                ref={empInputRef}
                list="employee-codes"
                value={searchCode}
                onChange={handleIdChange}
                required
                className="w-full bg-yellow-50 border border-gray-400 p-3 font-bold"
              />
              <datalist id="employee-codes">
                {employees.map(emp => (
                  <option key={emp.code} value={emp.code}>{emp.employee}</option>
                ))}
              </datalist>
            </div>

            <div className="col-span-6">
              <label className="block text-blue-700 font-bold mb-1">Employee Name</label>
              <input readOnly value={selectedEmp.name} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-2 flex items-end justify-center">
              {selectedEmp.photo && (
                <img src={selectedEmp.photo} alt="Staff" className="md:h-30 md:w-30 lg:h-40 lg:w-40 border border-gray-300 rounded shadow-sm object-cover" />
              )}
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">JobNo</label>
              <input readOnly value={formData.jobno} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Top/bott</label>
              <input readOnly value={formData.topbottom_des} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Combo Colour</label>
              <input readOnly value={formData.clrcombo} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Portion Id</label>
              <input readOnly value={formData.porid} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Portion Desc</label>
              <input readOnly value={formData.pordesc} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Size</label>
              <input readOnly value={formData.size} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">LotNo</label>
              <input readOnly value={formData.lotno} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>

            <div className="col-span-3">
              <label className="block text-blue-700 font-bold mb-1">Ratio.No</label>
              <input readOnly value={formData.ratio} className="w-full border border-gray-300 p-3 bg-gray-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 border border-gray-300 overflow-x-auto sm:h-[200px] md:h-[300px] lg:h-[600px]">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-blue-800 text-white text-[11px] uppercase">
            <tr>
              <th className="p-3">RATIO QR ID</th>
              <th className="p-3">Emp Id</th>
              <th className="p-3">Emp Name</th>
              <th className="p-3">JobNo</th>
              <th className="p-3">Top/Bott</th>
              <th className="p-3">Combo Colour</th>
              <th className="p-3">Size</th>
              <th className="p-3">Lot.No</th>
              <th className="p-3">Ratio.No</th>
              <th className="p-3">Plan.No</th>
              <th className="p-3">Plan.Sl</th>
              <th className="p-3">PC</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                <td className="p-2">{row.ratio_id ?? row.sl }</td>
                <td className="p-2">{row.employee_id ??  searchCode}</td>
                <td className="p-2">{row.employee_name ?? selectedEmp.name}</td>
                <td className="p-2">{row.jobno}</td>
                <td className="p-2">{row.topbottom_des}</td>
                <td className="p-2">{row.clrcombo}</td>
                <td className="p-2">{row.size}</td>
                <td className="p-2">{row.lotno}</td>
                <td className="p-2">{row.ratio_no ?? row.ratio}</td>
                <td className="p-2">{row.planno}</td>
                <td className="p-2">{row.plansl}</td>
                <td className="p-2">{row.pc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-2 flex justify-end gap-2 border-t border-gray-300">
        {/* <button
          onClick={() => {
            fetch('https://app.herofashion.com/stick_dtls/')
              .then(res => res.json())
              .then(data => {
                setTableData(Array.isArray(data) ? data : [data]);
                setNewRows([]);
                setIsUpdated(false);
              });
          }}
          className="px-6 py-1 bg-white border border-gray-400 hover:bg-red-50"
        >
          Show Details
        </button> */}

        <button onClick={handleClearForm} className="px-6 py-1 bg-blue-600 text-white hover:bg-blue-700">
          Clear Form 
        </button>

        <button
          onClick={() => { setTableData([]); setNewRows([]); setIsUpdated(false);     
            setTimeout(() => {
              empInputRef.current?.focus();
            }, 100); }}
          className="px-6 py-1 bg-white border border-gray-400 hover:bg-red-50"
        >
          Clear Table
        </button>

        <button onClick={handleUpdate} className="px-6 py-1 bg-blue-600 text-white hover:bg-blue-700">
          Update
        </button>

        <button onClick={() => navigate('/stick-prod/sticker-report')} className="px-6 py-1 bg-white border border-gray-400 hover:bg-gray-50">
         Report
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default Sticker;
