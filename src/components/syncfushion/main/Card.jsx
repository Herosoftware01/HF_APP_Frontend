import React from "react";
import { 
  FaChartPie, FaCheck, FaWallet, FaViadeo, FaAudible, FaDiceD20, FaDisease, FaDrupal,FaAngellist, FaDice,
  FaDribbble, FaRegSmileWink, FaTencentWeibo, FaMixcloud,FaHeartbeat, FaMailchimp, FaDrum, FaFeatherAlt,
  FaCodepen, FaAirbnb, FaDove, FaPushed, FaRaspberryPi, FaPaw, FaGithub,
  FaRegPaperPlane, FaVirus, FaBity , FaVolleyballBall,
  FaReact, FaGalacticRepublic,FaCodiepie, FaDemocrat, FaGrav
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5 flex flex-col">

      {/* Breadcrumb */}
      <ol className="flex items-center whitespace-nowrap p-6 flex-shrink-0">
        <li className="inline-flex items-center">
          <a className="flex items-center text-sm text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/dashboard">
            <svg className="shrink-0 me-3 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Dashboard
          </a>
          <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </li>
        <li className="inline-flex items-center">
          <a className="flex items-center text-sm text-muted-foreground-1 hover:text-primary-focus focus:outline-hidden focus:text-primary-focus" href="/#/sy-order">
            <svg className="shrink-0 me-3 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="14" y="3" rx="1"/>
              <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/>
            </svg>
            Order
            <svg className="shrink-0 mx-2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </li>
      </ol>

      {/* Cards container */}
        <div className="flex-1 overflow-x-hidden pl-2 pt-3 pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1 */}
          <div
            onClick={() => navigate("order")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden 
            transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-orange-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaViadeo className="text-orange-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition">
              Order syncfushion - B,K,D
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage the Grid and datas
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigate("HrReportGrid")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaChartPie className="text-blue-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
              Hr - B
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Working Status
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigate("card1")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaCheck className="text-green-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition">
              Order Card - K 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Card view and details
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => navigate("card2")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-purple-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaWallet className="text-purple-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition">
              Order Card Detail - K 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Overall card details
            </p>
          </div>

          {/* Card 5 */}

          <div  onClick={() => navigate("HeroFashionGrid131")}  className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-red-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaAudible className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition">
              Printing Syncfusion - B,K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Printing Details
            </p>
          </div>

          {/* Card 7 */}
          <div
            onClick={() => navigate("sample")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-amber-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaRegSmileWink className="text-amber-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-amber-600 transition">
              Sample Grid - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Update Grid
            </p>
          </div>

          {/* Card 8 */}
          <div
            onClick={() => navigate("store")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-indigo-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaTencentWeibo className="text-indigo-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">
              StoreGrid - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Tbuyer and Torder Details
            </p>
          </div>

          {/* Card 9 */}
          <div
            onClick={() => navigate("fabric")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaMixcloud className="text-emerald-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition">
              Fabric - K 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Fabric Alias Form
            </p>
          </div>

          {/* Card 10 */}
          <div
            onClick={() => navigate("Excel")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-sky-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaCodepen className="text-sky-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-sky-600 transition">
              Order Oms - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              oms data using store procedure 
            </p>
          </div>

          {/* Card 11 */}
          <div
            onClick={() => navigate("PRN")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaVirus className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
              Prn Details - B
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Print order Details
            </p>
          </div>

          {/* Card 12 */}
          <div
            onClick={() => navigate("order_oms")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-cyan-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaRegPaperPlane className="text-cyan-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition">
              Order Oms1 - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Order detail using store procedure
            </p>
          </div>

          {/* Card 13 */}
          <div
            onClick={() => navigate("Schedule")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaRaspberryPi className="text-blue-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
              Calenda Details - B
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Calen order Details
            </p>
          </div>

         {/* Card 14 */}
           <div
            onClick={() => navigate("order_detail")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-purple-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDove className="text-purple-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition">
              Order Details - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Syncfusion order deatil with tooltip
            </p>
          </div>
          
         {/* Card 15 */}
           <div
            onClick={() => navigate("chart")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaAirbnb className="text-green-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition">
              Gantt Chart - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about Gantt Chart
            </p>
          </div>
          
        {/* Card 16 */}
          <div
            onClick={() => navigate("TemplateGallery")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-orange-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaPushed className="text-orange-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition">
             Editor Block - B
            </h2>
            <p className="text-gray-500 text-sm mt-1">
             Editor Block TemplateGallery
            </p>
          </div>

        {/* Card 17 */}
          <div
            onClick={() => navigate("sync_iframe")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-yellow-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaCodiepie className="text-yellow-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-yellow-600 transition">
             BoldBi iframe
            </h2>
            <p className="text-gray-500 text-sm mt-1">
             BoldBi iframe for order details
            </p>
          </div>

          {/* Card  */}
          <div
            onClick={() => navigate("forign")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-red-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaVolleyballBall className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition">
             ForignKey - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Connect two api using forign key
            </p>
          </div>

          {/* Card  */}
          <div
            onClick={() => navigate("pivot")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-indigo-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaReact className="text-indigo-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">
             PivotView - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order using Pivotview
            </p>
          </div>
         
           <div
            onClick={() => navigate("Ordloadbalan")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaBity className="text-blue-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
            Ordloadbalan
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order Load Balance using Pivotview
            </p>
          </div>

          {/* Card  */}
          <div
            onClick={() => navigate("adaptive")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-purple-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGalacticRepublic className="text-purple-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition">
             Adaptive - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order using adaptive
            </p>
          </div>


          {/* Card  */}
          <div
            onClick={() => navigate("kanban")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-sky-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDribbble className="text-sky-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-sky-600 transition">
             Kanban - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order using Kanban
            </p>
          </div>

          {/* Card  */}
          <div
            onClick={() => navigate("quary")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-pink-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDisease className="text-pink-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition">
             Query Builder 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order using Query Builder
            </p>
          </div>


          <div
            onClick={() => navigate("websocket")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-red-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDemocrat className="text-red-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition">
             WebSocket
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order using Websocket
            </p>
          </div>


          <div
            onClick={() => navigate("Weborder")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDrupal className="text-emerald-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition">
             Web Order
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Details about the order using Web order
            </p>
          </div>

          <div
            onClick={() => navigate("form")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-cyan-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDiceD20 className="text-cyan-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition">
              Form details - K
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Syncfusion form details
            </p>
          </div>
              
          <div
            onClick={() => navigate("Report")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-orange-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGrav className="text-orange-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition">
            Bold Reports details 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Syncfusion Bold Reports details 
            </p>
          </div>


          <div
            onClick={() => navigate("Embedd")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-purple-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaHeartbeat className="text-purple-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition">
              Bold Bi Embedd Edit details 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Embedd Edit Bold Bi Reports details 
            </p>
          </div>
        
          <div
            onClick={() => navigate("Dashboard")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaMailchimp className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition">
              Bold Bi Embedd Published details 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Embedd Bold Bi Published details 
            </p>
          </div>  

          <div
            onClick={() => navigate("pdf")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-yellow-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaPaw className="text-yellow-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-yellow-600 transition">
              Pdf Related Details
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Syncfusion Pdf Details and Editor 
            </p>
          </div>        

          <div
            onClick={() => navigate("HeroFashionGrid1311")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaAngellist className="text-blue-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
              Print Sync Reports details 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Print Sync Reports details 
            </p>
          </div>     


          <div
            onClick={() => navigate("optimize")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDice className="text-green-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition">
            order data optimize with Ai 
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Ai optimized code 
            </p>
          </div>    

          <div
            onClick={() => navigate("Formbuilder")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-pink-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaDrum className="text-pink-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-pink-600 transition">
            Form builder
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Ai optimized code 
            </p>
          </div>      

          <div
            onClick={() => navigate("word")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center  rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaFeatherAlt className="text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 transition">
            Word Document
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Word Document Details
            </p>
          </div>      

          <div
            onClick={() => navigate("xlsheet")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Xl Sheet
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Xl sheet details
            </p>
          </div>      

          <div
            onClick={() => navigate("smart")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Smart Paste
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

          <div
            onClick={() => navigate("speak")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            speak to text
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

          <div
            onClick={() => navigate("explor")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaFeatherAlt className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Document Explorer
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

          <div
            onClick={() => navigate("floor")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Floor Planner
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

          <div
            onClick={() => navigate("imgedit")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Image Editor
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

          <div
            onClick={() => navigate("circut")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Logic Circut
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

          <div
            onClick={() => navigate("webmail")}
            className="group cursor-pointer bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-200 rounded-full opacity-40 group-hover:scale-150 transition duration-500"></div>
            <div className="w-14 h-14 flex items-center justify-center bg-fuchsia-100 rounded-xl mb-4 group-hover:rotate-12 transition duration-300">
              <FaGithub className="text-fuchsia-500 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-fuchsia-600 transition">
            Web Mail
            </h2>
            <p className="text-gray-500 text-sm mt-1">
            Waiting
            </p>
          </div>      

        </div>
      </div>
    </div>
  );
};

export default Dashboard;