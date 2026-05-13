import { Ajax } from '@syncfusion/ej2-base';
import React, { useState, useRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Inject,
  Filter,
  Group,
  Reorder,
  Search,
  Edit,
  Toolbar,
  AddEventArgs,
  SaveEventArgs,
  EditEventArgs,
  DeleteEventArgs,
  ActionEventArgs,
} from '@syncfusion/ej2-react-grids';

interface OrderData {
  OrderNo: string;
  BuyerID: string | number;
  BuyerName: string;
}

const Stored: React.FC = () => {
  const [dataSource, setDataSource] = useState<OrderData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const[showingCount, setShowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('2025-01-01');
  const [toDate, setToDate] = useState<string>('2027-01-01');

  const gridRef = useRef<GridComponent>(null);
  const searchTimeout = useRef<any>(null);
  const searchableFields = ['OrderNo', 'BuyerID', 'BuyerName'];

  const fetchOrderList = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    try {
      setLoading(true);

      // GET request method
      const response = await fetch(
        `https://app.herofashion.com/order_list/?from_date=${fromDate}&to_date=${toDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      const data: OrderData[] = jsonResponse.data ||[];

      setDataSource(data);
      setTotalCount(data.length);
      setShowingCount(data.length);

    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: any) => {
    if (!searchKey || text === undefined || text === null) return text;
    const stringText = String(text);
    const escapedKey = searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = stringText.split(new RegExp(`(${escapedKey})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchKey.toLowerCase() ? (
            <span key={i} className="custom-highlight">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const genericHighlighter = (field: keyof OrderData) => (props: OrderData) => (
    <>{highlightText(props[field])}</>
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKey(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (gridRef.current) gridRef.current.search(value);
    }, 400);
  };

  const updateCounts = () => {
    if (gridRef.current) {
      const records = gridRef.current.getFilteredRecords();
      setShowingCount(records ? (records as object[]).length : 0);
    }
  };

  let serverUpdated = false;
  let newPrimaryKey:number | null = null;
  const actionBegin = (args: AddEventArgs|SaveEventArgs|EditEventArgs|DeleteEventArgs|ActionEventArgs) => {
    const ajax = new Ajax({
      onSuccess: function (response: string) {
        serverUpdated = true;
        newPrimaryKey = JSON.parse(response).order_id;
        debugger
        gridRef.current?.endEdit();
      },
      onFailure: function (xhr: XMLHttpRequest) {
        gridRef.current?.closeEdit();
      },
    });
    if (args.requestType === 'delete') {
      const primaryKeyField: any = gridRef.current?.getPrimaryKeyFieldNames()[0];
      // const primaryKeyValue = (args as any).data[primaryKeyField];
      const primaryKeyValue = (args as any).data[0][primaryKeyField];
 
      debugger
      if (!serverUpdated) {
          args.cancel = true;
          ajax.url = 'https://app.herofashion.com/delete_order/' + primaryKeyValue;
          ajax.type = 'DELETE';
          ajax.data = JSON.stringify((args as any).data);
      }
      ajax.send();
    }
    if (args.requestType === 'save') {
      if ((args as any).action === 'add') {
        if (!serverUpdated) {
          args.cancel = true;
          ajax.url = 'https://app.herofashion.com/save_order/';
          ajax.type = 'POST';
          ajax.data = JSON.stringify((args as any).data);
          ajax.send();
        } else {
          if (newPrimaryKey) {
            (args as any).index = (gridRef.current?.dataSource as object[]).length;
            (args as any).data.order_id = newPrimaryKey;
          }
        }
      } else if ((args as any).action === 'edit') {
        const primaryKeyField: any = gridRef.current?.getPrimaryKeyFieldNames()[0];
        const primaryKeyValue = (args as any).data[primaryKeyField];
 
        if (!serverUpdated) {
          args.cancel = true;
          ajax.url =
            'https://app.herofashion.com/save_order/';
          ajax.type = 'POST';
          ajax.data = JSON.stringify((args as any).data);
          ajax.send();
        }
      }
    }
  };
  const actionComplete = (args: AddEventArgs|SaveEventArgs|EditEventArgs|DeleteEventArgs|ActionEventArgs) => {
    if (args.requestType === 'beginEdit') {
      // buyerIdVal = args.rowData['buyerid_id'];
    }
    if (args.requestType === 'save') {
       // integrate your WhatsApp Integration code logic here
      serverUpdated = false;
      newPrimaryKey = null;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      
      {/* CSS Styles for Responsiveness */}
      <style>{`
        .custom-highlight { background-color: #fff9c4 !important; color: #d32f2f !important; font-weight: bold; }
        
        /* Responsive Header Container */
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          flex-wrap: wrap; /* Allows wrapping on smaller screens */
          gap: 15px;
        }

        /* Responsive Date Filters */
        .date-filters {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          width: 300px;
          padding: 6px 15px;
          border-radius: 20px;
          border: 1px solid #ccc;
          outline: none;
        }

        .fetch-btn {
          padding: 6px 15px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .fetch-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        /* Media Query For Mobile Devices */
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            align-items: stretch; /* Stretch items to full width on mobile */
            padding: 15px;
          }
          .date-filters {
            flex-direction: column;
            align-items: stretch;
          }
          .date-filters input, .date-filters button {
            width: 100%; /* Full width in mobile */
            padding: 8px;
          }
          .search-box-container {
            width: 100%;
          }
          .search-box {
            width: 100%;
          }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="header-container">
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#007bff' }}>
          Records: {showingCount} / {totalCount}
        </div>

        <div className="date-filters">
          <label style={{ fontSize: '12px', fontWeight: 'bold', alignSelf: 'center' }}>From:</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <label style={{ fontSize: '12px', fontWeight: 'bold', alignSelf: 'center' }}>To:</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <button className="fetch-btn" onClick={fetchOrderList} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Orders'}
          </button>
        </div>

        <div className="search-box-container">
          <input
            type="text"
            className="search-box"
            placeholder="Search whole grid..."
            value={searchKey}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {/* GRID SECTION */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <GridComponent
          ref={gridRef}
          dataSource={dataSource}
          dataBound={updateCounts}
          editSettings={{
              allowDeleting: true,
              allowEditing: true,
              allowAdding: true,
            }}
            actionBegin={actionBegin}
            actionComplete={actionComplete}
            width="100%"
            height="100%"
            allowSorting={true}
            allowFiltering={true}
            filterSettings={{ type: 'Excel' }}
            gridLines="Both"
            searchSettings={{ fields: searchableFields, operator: 'contains', ignoreCase: true }}
            toolbar={['Add', 'Edit', 'Delete', 'Cancel', 'Update']}
        >
          <ColumnsDirective>
            <ColumnDirective field="order_id" isPrimaryKey={true} isIdentity={true} type='number' headerText="Id" width="150" />
            <ColumnDirective field="OrderNo" headerText="Order No" width="150" template={genericHighlighter('OrderNo')} />
            <ColumnDirective field="BuyerID" headerText="Buyer ID" width="120" template={genericHighlighter('BuyerID')} />
            <ColumnDirective field="BuyerName" headerText="Buyer Name" width="200" template={genericHighlighter('BuyerName')} />
            <ColumnDirective field="Fabname" headerText="Fname" width="200" />
            <ColumnDirective field="Mcategory" headerText="Mcategory" width="200" />
            <ColumnDirective field="Unitid" headerText="UnitID" width="200"/>
          </ColumnsDirective>
          
          
          <Inject services={[Sort, Filter, Group, Reorder, Search, Edit, Toolbar]} />
        </GridComponent>
      </div>
    </div>
  );
};

export default Stored;