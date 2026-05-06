import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Defects from "../pages/mes_details"

export default function ProductionDetails() {

  const navigate = useNavigate();
  const location = useLocation();

  const [jobNo, setJobNo] = useState("");
  const [product, setProduct] = useState("");
  const [colour, setColour] = useState("");
  const [size, setSize] = useState("");
  const [bundleNo, setBundleNo] = useState("");
  const [pieces, setPieces] = useState("");
  const [bundleid, setBundleid] = useState("");

  const [isScanning, setIsScanning] = useState(false);

  const [bfIroning, setBfIroning] = useState(false);
  const [afIroning, setAfIroning] = useState(false);
  const [alreadyChecked, setAlreadyChecked] = useState(false);


  const canContinue = jobNo && product && pieces && !alreadyChecked;
  
 

const checkIroningStatus = async (jobNo, bundleNo) => {
  try {
    const res = await fetch(
      `https://hfapi.herofashion.com/qcapp/check-ironing-status/?jobno=${jobNo}&bundle_no=${bundleNo}`
    );

    const data = await res.json();

    if (data.status === "new") {
      setBfIroning(true);
      setAfIroning(false);
      setAlreadyChecked(false);
    }

    if (data.status === "exists") {
      if (data.bf_ironing && !data.af_ironing) {
        setBfIroning(false);
        setAfIroning(true);
        setAlreadyChecked(false);
      } 
      else if (data.bf_ironing && data.af_ironing) {
        setAlreadyChecked(true);
        setBfIroning(false);
        setAfIroning(false);
      }
      else {
        //  fallback safety
        setBfIroning(true);
        setAfIroning(false);
        setAlreadyChecked(false);
      }
    }

  } catch (err) {
    console.error(err);
  }
};

const fillBundleData = async (bundle) => {
  if (!bundle) return;

  try {
    const response = await fetch(
      `https://hfapi.herofashion.com/qcapp/get_bundle_data/?bundle_id=${bundle}`
      // `http://10.1.21.110:7003/qcapp/get_bundle_data/?bundle_id=${bundle}`
    );

    const data = await response.json();
    //  If message 
    if (data.message) {
      alert(data.message);

      // reset fields
      setJobNo("");
      setProduct("");
      setColour("");
      setSize("");
      setPieces("");
      setBundleNo("");
      setBundleid("");

      return;
    }

    if (!data || data.length === 0) {
      alert("Bundle Not Found");
      return;
    }

    const item = data[0];

    // Correct case-sensitive mapping
    setJobNo(item.JobNo || "");
    setProduct(item.TopBottom_des || "");
    setColour(item.comboclr || "");
    setSize(item.sizename || "");
    setPieces(item.pc || "");
    setBundleNo(item.Bdl || "");
    setBundleid(item.bundid || "");

    await checkIroningStatus(item.JobNo, item.Bdl);

  } catch (error) {
    console.error("API Error:", error);
    alert("Server error");
  }
};
  
  useEffect(() => {
    let scanner = null;
     if (isScanning) {
       scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } });
      scanner.render(onScanSuccess, onScanError);
     } 

      function onScanSuccess(decodedText) {
       setBundleNo(decodedText);
       fillBundleData(decodedText);
       setIsScanning(false);
       if (scanner) scanner.clear();
      }

     function onScanError(err) {}

     return () => {
       if (scanner) scanner.clear();
     };
   }, [isScanning]);



  const handleBundleChange = (value) => {
    setBundleNo(value);
    fillBundleData(value);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    // navigate(Defects);
    navigate(`/cut_sample/mes_details/`, {
    state: {
      bundleNo,
      jobNo,
      product,
      colour,
      size,
      pieces,
      bundle_id: bundleid,
      bf_ironing: bfIroning,
      af_ironing: afIroning
    },
  });

  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 flex flex-col items-center">

      {/* Scanner Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div id="reader"></div>
            <button
              onClick={() => setIsScanning(false)}
              className="w-full mt-4 py-3 bg-red-500 text-white font-bold rounded-xl"
            >
              Close Camera
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[800px] bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="mt-6 space-y-3">

  {alreadyChecked ? (
    <div className="text-green-600 font-bold text-lg">
      ✅ Already Checked
    </div>
  ) : (
    <>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={bfIroning}
          disabled
        />
        Before Ironing
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={afIroning}
          disabled
        />
        After Ironing
      </label>
    </>
  )}

</div>

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A]">Order Measurement Details</h1>
            <p className="text-slate-400 font-medium text-lg">Enter or scan Order information</p>
           
          </div>
          <button
            onClick={() => setIsScanning(true)}
            className="h-14 w-14 bg-[#0F172A] rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H10V10H4V4ZM4 14H10V20H4V14ZM14 4H20V10H14V4ZM14 14H17V17H14V14ZM17 17H20V20H17V17ZM17 14H20V17H17V14ZM14 17H17V20H14V17Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

          <div >
            <label htmlFor="Bundle No" className="text-gray-500 font-semibold">Bundle No :</label>
            <input
              type="text"
              value={bundleNo}
           
              onChange={(e) => handleBundleChange(e.target.value)}
              placeholder="Bundle No"
              className="w-full h-[60px] px-5 rounded-2xl border border-slate-200"
            />
            
          </div>
          
          <div>
            <label htmlFor="jobno" className="text-gray-500 font-semibold">Job No :</label>
            <input
            type="text"
            value={jobNo}
            disabled
            onChange={(e) => setJobNo(e.target.value)}
            placeholder="Job No"
            className="w-full h-[60px] px-5 rounded-2xl border border-slate-200"
          />
          </div>

          <div className="">
            <label htmlFor="product" className="text-gray-500 font-semibold">Product :</label>
            <input
            type="text"
            value={product}
            disabled
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Product"
            className="w-full h-[60px] px-5 rounded-2xl border border-slate-200"
          />
          </div>

          <div>
            <label htmlFor="Colour" className="text-gray-500 font-semibold">Colour :</label>
            <input
            type="text"
            value={colour}
            disabled
            onChange={(e) => setColour(e.target.value)}
            placeholder="Colour"
            className="w-full h-[60px] px-5 rounded-2xl border border-slate-200"
          />
          </div>

          <div>
             <label htmlFor="size" className="text-gray-500 font-semibold">Size :</label>
            <input
            type="text"
            value={size}
            disabled
            onChange={(e) => setSize(e.target.value)}
            placeholder="Size"
            className="w-full h-[60px] px-5 rounded-2xl border border-slate-200"
          />
          </div>

          

          <div>
            <label htmlFor="Pieces" className="text-gray-500 font-semibold">Pieces :</label>
            <input
            type="number"
            value={pieces}
            disabled
            onChange={(e) => setPieces(e.target.value)}
            placeholder="Pieces"
            className="w-full h-[60px] px-5 rounded-2xl border border-slate-200"
          />
          </div>

          

        </div>

        <div className="p-2">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full h-[70px] rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
              canContinue
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed opacity-60'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}