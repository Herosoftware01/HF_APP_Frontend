import { useEffect, useState, useContext } from "react";
import { api } from "../../../auth/auth";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../UserContext";

export default function QC() {

  const [units, setUnits] = useState([]);
  const [activeUnit, setActiveUnit] = useState(null);
  const { role } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("qcapp/lines/")
      .then((res) => {
        setUnits(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const toggleUnit = (unitId) => {
    setActiveUnit(activeUnit === unitId ? null : unitId);
  };

  //  Role-based filtering
  const filteredUnits = units.filter((unit) => {
    if (!role) return false;

    if (role === "admin" || role === "production" || role === "Nantha") return true;

    const match = role.match(/\d+/);
    return match && unit.unit.toString() === match[0];
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-4xl mx-auto space-y-4 mt-14">

        {/* ❌ Access Denied UI */}
        {filteredUnits.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-10 text-center border">

            <div className="text-5xl mb-4">🚫</div>

            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Access Denied
            </h2>

            <p className="text-gray-600">
              You do not have permission to view this content.
            </p>

          </div>
        ) : (

          /* ✅ Units List */
          filteredUnits.map((unit) => (

            <div
              key={unit.unit}
              className="bg-white rounded-xl shadow border p-4"
            >

              {/* UNIT HEADER */}
              <div
                className={`flex justify-between items-center cursor-pointer p-3 rounded-lg 
                ${activeUnit === unit.unit ? "bg-green-100 border border-green-400" : "bg-gray-50"}`}
                onClick={() => toggleUnit(unit.unit)}
              >

                <div className="flex items-center gap-3">
                  <div className="bg-green-500 text-white p-2 rounded-lg">
                    ⬜
                  </div>

                  <h2 className="text-lg font-semibold">
                    Unit {unit.unit}
                  </h2>
                </div>

                {activeUnit === unit.unit && (
                  <span className="text-green-600 font-bold">✔</span>
                )}

              </div>

              {/* LINES */}
              {activeUnit === unit.unit && (

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">

                  {unit.lines.map((line, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 text-center p-3 rounded-lg font-medium hover:bg-gray-300 cursor-pointer"
                      onClick={() => navigate(`/qc-admin/line/${unit.unit}/${line}`)}
                    >
                      Line {line}
                    </div>
                  ))}

                </div>

              )}

            </div>

          ))

        )}

      </div>

    </div>
  );
}