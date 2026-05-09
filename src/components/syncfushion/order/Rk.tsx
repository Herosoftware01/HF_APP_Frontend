import * as React from "react";
import { useEffect, useState, useRef } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Filter,
  Inject,
  Edit,
  Sort,
  Toolbar
} from "@syncfusion/ej2-react-grids";

interface OrderData {
  jobno: string;
  planno: string;
  sample_descr: string;
  topbottom_des: string;
  plan_kg: number;
  cutdt: string;
}

function Rk() {
  const gridRef = useRef(null);
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const toolbarOptions = ["Add", "Edit", "Delete", "Update", "Cancel", "Search"];

  // 🔥 Fetch APIs
  useEffect(() => {
    fetch("https://hfapi.herofashion.com/reports/cutdel/")
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
      });
  }, []);

  const dateTemplate = (r: OrderData) => {
   const [date = "", timewithZ = ""] = (r.cutdt || "").split("T");
    const time = timewithZ.replace("Z", "");
    return (
      <div>
        <p>{date}</p>
      </div>
    );
  };

  return (
    <div className="control-pane">
      <div className="control-section">
        <GridComponent
          dataSource={orderData}
          ref={gridRef}
          allowFiltering={true}
          allowSorting={true}
          editSettings={{
            allowEditing: true,
            allowDeleting: true,
            allowAdding: true
          }}
          filterSettings={{ type: "Menu" }}
          toolbar={toolbarOptions}
        >
          <ColumnsDirective>
            <ColumnDirective field="jobno" headerText="Job no" width="100" />
            <ColumnDirective field="planno" headerText="Plan no" width="100" />
            <ColumnDirective field="sample_descr" headerText="Style Sample" width="100" />
            <ColumnDirective field="topbottom_des" headerText="TobBottom" width='100' />
            <ColumnDirective field="plan_kg" headerText="Plan kg" width='100' />
            <ColumnDirective field="cutdt" headerText="Cutting Date" template={dateTemplate} width='100' />
          </ColumnsDirective>

          <Inject services={[Filter, Edit, Sort, Toolbar]} />
        </GridComponent>
      </div>
    </div>
  );  
}

export default Rk;