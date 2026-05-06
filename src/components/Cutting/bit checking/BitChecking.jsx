import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const BitChecking = () => {
    const [formData, setFormData] = useState({});

    const empInputRef = useRef(null);
    const qrInputRef = useRef(null);
    const MistakeRef = useRef(null);

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
    const [employees, setEmployees] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const [selectedEmp, setSelectedEmp] = useState({ name: '', photo: '' });
    const [stickList, setStickList] = useState([]);
    const [bitParts, setBitParts] = useState([]);
    const [mistakes, setMistakes] = useState({});

    const highestMistake = Object.values(mistakes).length
        ? Math.max(...Object.values(mistakes))
        : 0;

    const totalPcs = Number(formData.pc) || 0;
    const okPcs = Math.max(totalPcs - highestMistake, 0);

    const handleMistakeChange = (part, value) => {

        const totalPcs = Number(formData.pc) || 0;

        let val = Math.max(Number(value) || 0, 0);

        if (val > totalPcs) {
            val = totalPcs;                  // ✅ Hard limit
            toast.error(`Mistake cannot exceed ${totalPcs}`);
        }

        setMistakes(prev => ({
            ...prev,
            [part]: val
        }));
    };

    /* ✅ Time updater */
    useEffect(() => {
        const updateTime = () => setScanTime(getCurrentDateTime());
        updateTime();
        const interval = setInterval(updateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch('https://app.herofashion.com/stick/')
            .then(res => res.json())
            .then(data => setEmployees(Array.isArray(data) ? data : [data]))
            .catch(err => console.error("Employee fetch error:", err));
    }, []);

    useEffect(() => {
        fetch("https://app.herofashion.com/stick_list/")
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : [data];
                setStickList(list);

                // console.log("Stick List Loaded:", list); // debug safety
            })
            .catch(err => console.error("Stick list fetch error:", err));
    }, []);

    /* ✅ Auto focus on employee ID */
    useEffect(() => {
        if (empInputRef.current) {
            empInputRef.current.focus();
        }
    }, []);

    const handleIdChange = (e) => {
        const value = e.target.value;
        setSearchCode(value);

        const match = employees.find(
            emp => String(emp.code) === value
        );

        if (match) {
            setSelectedEmp({ name: match.employee || '', photo: match.photo || '' });

            setTimeout(() => {
                qrInputRef.current?.focus();
            }, 100);
        } else {
            setSelectedEmp({ name: '', photo: '' });
        }
    };

    const checkDuplicateRatio = async (ratioId) => {
        const res = await fetch(`https://app.herofashion.com/bit_checking/?ratio_id=${ratioId}`);
        const data = await res.json();
        return data.exists;
    };

    const handleQrChange = async (e) => {
        const val = e.target.value
            .trim()
            .replace(/\s+/g, '');   // ✅ Scanner-safe normalization

        console.log("QR VALUE:", val);

        const match = stickList.find(item =>
            String(item.sl) === val || String(item.sizeid) === val
        );

        if (!match) {
            toast.warn("Invalid QR Code");
            qrInputRef.current.value = "";
            return;
        }

        console.log("QR MATCH:", match);

        const ratioId = match.sl;

        const alreadyExists = await checkDuplicateRatio(ratioId);

        if (alreadyExists) {
            toast.warn("Already Scanned");
            qrInputRef.current.value = "";
            return;
        }

        setFormData(prev => ({
            ...prev,
            ratio_id: match.sl || '',
            jobno: match.jobno || '',
            topbottom_des: match.topbottom_des || '',
            topbott_id: match.topbott_id || '',
            clrcombo: match.clrcombo || '',
            size: match.size || '',
            lotno: match.lotno || '',
            ratio: match.ratio || '',
            sizeid: match.sizeid || '',
            plansl: match.plansl || '',
            planno: match.planno || '',
            pc: match.pc || '',
            porid: match.porid || '',
            portion_des: match.portion_des || ''
        }));

        try {
            const res = await fetch("https://app.herofashion.com/bitcheck/");
            const data = await res.json();

            const filtered = data.filter(row =>
                row.planno === match.planno &&
                row.topbottom_id === match.topbott_id
            );

            /* ✅ Extract UNIQUE MAIN PARTS */
            const uniqueParts = [...new Set(
                filtered.map(p => p.det_part)
            )];

            console.log("UNIQUE PARTS:", uniqueParts);

            setBitParts(uniqueParts);

        } catch (err) {
            console.error("Bitcheck fetch error:", err);
            toast.error("Bitcheck API Error");
        }

        setTimeout(() => {
            MistakeRef.current?.focus();
        }, 100);
    };

    const handleUpdate = async () => {

        if (!searchCode) {
            toast.warn("Employee ID Missing");
            return;
        }

        if (!formData.ratio_id) {
            toast.warn("Ratio ID Missing");
            return;
        }

        if (!formData.planno) {
            toast.warn("Plan No Missing");
            return;
        }

        if (!bitParts.length) {
            toast.warn("No Parts Found");
            return;
        }

        try {

            const requests = bitParts.map((part) => {
                const mistakeValue = mistakes[part] || 0;

                const payload = {
                    emp_id: Number(searchCode),
                    ratio_id: formData.ratio_id,
                    plan_no: formData.planno,
                    ind_part: part,
                    mistake: mistakeValue,
                    time: scanTime,
                    porid: formData.porid || '0',
                    portion_des: formData.portion_des,
                    emp_name: selectedEmp.name,
                    job_no: formData.jobno,
                    tobbot_des: formData.topbottom_des,
                    tobbot_id: formData.topbott_id,
                    clr_cmbo: formData.clrcombo,
                    size: formData.size,
                    lot_no: formData.lotno,
                    plan_sl: formData.plansl,
                    total_pcs: formData.pc,
                    mistake_pcs: highestMistake,
                    ok_pcs: okPcs
                };

                return fetch("https://app.herofashion.com/bit_checking/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            });

            const responses = await Promise.all(requests);
            const hasError = responses.some(res => !res.ok);

            if (hasError) {
                toast.error("Save Faild");
            } else {
                toast.success("Saved Successfully");
            }

            setFormData({});
            setMistakes({});
            setBitParts([]);
            setSelectedEmp({ name: '', photo: '' });
            setSearchCode('');
            qrInputRef.current.value = "";
            empInputRef.current?.focus();

        } catch (err) {
            console.error(err);
            toast.error("Save Failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="bg-white border border-gray-300 flex-1 p-3 shadow-sm mx-auto">

                {/* Top Row: Date, ID, Name */}
                <div className="grid grid-cols-12 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Date</label>
                        <input
                            type="datetime-local"
                            value={scanTime || ""}
                            onChange={(e) => setScanTime(e.target.value)}
                            className="w-full border border-gray-300 p-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Employee ID</label>
                        <input
                            type="text"
                            ref={empInputRef}
                            list="employee-codes"
                            value={searchCode}
                            onChange={handleIdChange}
                            required
                            className="w-full bg-yellow-50 border border-gray-400 p-1 font-bold"
                        />
                        <datalist id="employee-codes">
                            {employees.map(emp => (
                                <option key={emp.code} value={emp.code}>
                                    {emp.employee}
                                </option>
                            ))}
                        </datalist>
                    </div>
                    <div className="col-span-6">
                        <label className="block text-blue-700 font-bold mb-1">Employee Name</label>
                        <input
                            type="text"
                            value={selectedEmp.name}
                            readOnly
                            className="w-full border border-gray-300 p-1"
                        />
                    </div>
                    <div className="col-span-2 flex items-end justify-center">
                        {selectedEmp.photo && (
                            <img src={selectedEmp.photo} alt="Staff" className="md:h-30 md:w-30 lg:h-40 lg:w-40 border border-gray-300 rounded shadow-sm" />
                        )}
                    </div>
                </div>

                {/* Second Row: Job Details */}
                <div className="grid grid-cols-10 gap-2 mb-6">
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">RATIO ID</label>
                        <input type="text"
                            ref={qrInputRef}
                            onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                    handleQrChange(e);
                                }
                            }}
                            className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Job.No</label>
                        <input readOnly value={formData.jobno || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Top/Bottom</label>
                        <input readOnly value={formData.topbottom_des || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Colour/Combo</label>
                        <input readOnly value={formData.clrcombo || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Portion_Id</label>
                        <input readOnly value={formData.porid || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Portion_Desc</label>
                        <input readOnly value={formData.portion_des || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-blue-700 font-bold mb-1">Size</label>
                        <input readOnly value={formData.size || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-blue-700 font-bold mb-1">Lot.No</label>
                        <input readOnly value={formData.lotno || ''} className="w-full border border-gray-300 p-1" />
                    </div>
                </div>

                {/* Middle Section: Tables and Counters */}
                <div className="grid grid-cols-12 gap-8 mb-6">

                    {/* Left Table: Mistake Details */}
                    <div className="col-span-6">
                        <div className="border border-gray-400">
                            <div className="grid grid-cols-12 bg-blue-700 text-white font-bold p-1">
                                <div className="col-span-1 border-r border-white px-3">Sl</div>
                                <div className="col-span-5 border-r border-white px-3">Ind.Part</div>
                                <div className="col-span-6 px-3">Mistake Details</div>
                            </div>
                            <div className="grid grid-cols-12 bg-white items-start">
                                {/* SL Column */}
                                <div className="col-span-1 border-r border-gray-300 p-1 px-4">
                                    {bitParts.map((_, index) => (
                                        <div key={index} className="h-7">
                                            {index + 1}
                                        </div>
                                    ))}
                                </div>

                                {/* Ind.Part Column */}
                                <div className="col-span-5 border-r border-gray-300 p-1 px-4">
                                    {bitParts.map((part) => (
                                        <div key={part} className="h-7">
                                            {part}
                                        </div>
                                    ))}
                                </div>

                                {/* Mistake Column */}
                                <div className="col-span-6 p-1">
                                    {bitParts.map((part) => (
                                        <div key={part} className="h-7 px-2">
                                            <input
                                                type="number"
                                                ref={MistakeRef}
                                                min="0"
                                                max={formData.pc || 0}
                                                value={mistakes[part] || ""}
                                                className="w-20 border border-gray-300 px-4"
                                                onChange={(e) => handleMistakeChange(part, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="col-span-6 grid grid-cols-3 gap-2">
                        {/* Plan Fields */}
                        <div>
                            <label className="block text-blue-700 font-bold">Plan.No</label>
                            <input readOnly value={formData.planno || ''} className="w-full border border-gray-300 p-1" />
                        </div>
                        <div>
                            <label className="block text-blue-700 font-bold">Plan.Sl</label>
                            <input readOnly value={formData.plansl || ''} className="w-full border border-gray-300 p-1" />
                        </div>
                        <div>
                            <label className="block text-blue-700 font-bold">Top-Bot Id</label>
                            <input readOnly value={formData.topbott_id || ''} className="w-full border border-gray-300 p-1" />
                        </div>
                        {/* <div>
                            <label className="block text-blue-700 font-bold">Ratio No</label>
                            <input readOnly value={formData.ratio} className="w-full border border-gray-300 p-1" />
                        </div> */}

                        {/* Bundle Table */}
                        {/* <div className="col-span-3 mt-4">
                            <table className="w-full border-collapse border border-gray-400">
                                <thead className="bg-blue-700 text-white">
                                    <tr>
                                        <th className="border border-white p-1">Bdl.No</th>
                                        <th className="border border-white p-1">Bdl.Qty</th>
                                        <th className="border border-white p-1">Allot Qty</th>
                                        <th className="border border-white p-1">ID</th>
                                    </tr>
                                </thead>
                                <tbody className="h-8 bg-white">
                                    <tr>
                                        <td className="border border-gray-300"></td>
                                        <td className="border border-gray-300"></td>
                                        <td className="border border-gray-300"></td>
                                        <td className="border border-gray-300"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> */}

                        {/* Piece Counters */}
                        <div className="col-span-2 mt-4 space-y-4">
                            <div>
                                <label className="block text-blue-700 font-bold uppercase">Total Pieces</label>
                                <input readOnly value={formData.pc || ''} className="w-1/2 border border-gray-300 p-1" />
                            </div>
                            <div>
                                <label className="block text-blue-700 font-bold uppercase">Mistake Pcs</label>
                                <input
                                    readOnly
                                    value={highestMistake}
                                    className="w-1/2 border border-gray-300 p-1"
                                />
                            </div>
                            <div>
                                <label className="block text-blue-700 font-bold uppercase">Ok Pcs</label>
                                <input
                                    readOnly
                                    value={okPcs >= 0 ? okPcs : 0}
                                    className="w-1/2 border border-gray-300 p-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <label htmlFor="sticker" className="font-bold">Bit Checking</label>
                </div>

                <div className="flex space-x-1">
                    {['Refresh', 'Update', 'Clear', 'BiChart'].map((btn) => (
                        <button
                            key={btn}
                            onClick={() => {
                                if (btn === "Update") handleUpdate();
                                if (btn === "Refresh") window.location.reload();
                                if (btn === "BiChart") navigate("/stick-prod/bit-chart");
                                if (btn === "Clear") {
                                    setFormData({});
                                    setMistakes({});
                                    setBitParts([]);
                                    // setSelectedEmp({ name: '', photo: '' });
                                    // setSearchCode('');
                                    qrInputRef.current.value = "";
                                    empInputRef.current?.focus();
                                }
                            }}
                            className="px-6 py-1 bg-gray-200 border border-gray-400 text-blue-800 font-semibold hover:bg-gray-300 shadow-sm"
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>

            <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
        </div>
    );
};

export default BitChecking;
