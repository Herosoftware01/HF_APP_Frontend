import React from 'react';
import { ScheduleComponent, Day, Week, Month, WorkWeek, Year, Agenda, Inject } from '@syncfusion/ej2-react-schedule';
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';
import { registerLicense } from '@syncfusion/ej2-base';

// Theme imports...
import '@syncfusion/ej2-base/styles/tailwind3.css';
import '@syncfusion/ej2-react-schedule/styles/tailwind3.css';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF5cXGpCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdlWX1cdHRUQ2ddUkV3XUpWYEs=');

function Schedule() {
  const remoteData = new DataManager({
    url: 'https://app.herofashion.com/order_panda',
    adaptor: new WebApiAdaptor(),
    crossDomain: true
  });

  const onDataBinding = (e) => {
    let items = e.result || [];
    if (!Array.isArray(items)) items = items.items || items.result || [];

    let schedulerData = [];
    items.forEach(item => {
      let startDate = item.finaldelvdate ? new Date(item.finaldelvdate) : null;
      
      if (startDate) {
        // --- LOGIC TO MERGE/SPAN COLUMNS ---
        // Create an EndTime. For example, to span 2 columns (2 days):
        let endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); 

        schedulerData.push({
          Id: item.id || item.jobno_oms,
          Subject: item.jobno_oms || 'No Job',
          StartTime: startDate,
          EndTime: endDate, // If EndTime > StartTime, it merges cells automatically
          IsAllDay: true, 
          ImagePath: item.mainimagepath,
          Qty: item.quantity,
          Buyer: item.buyer1,
          PUnit: item.punit_sh,
          Description: `Buyer: ${item.buyer1} | Qty: ${item.quantity}`
        });
      }
    });
    e.result = schedulerData;
  };

  // Template to show details inside the event (as requested in your orderSummary snippet)
  const eventTemplate = (props) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px', height: '100%' }}>
        {props.ImagePath && (
          <img src={props.ImagePath} alt="job" style={{ width: '24px', height: '25px', borderRadius: '4px', marginRight: '8px' }} />
        )}
        <div style={{ fontSize: '11px', lineHeight: '1.2', color: 'white' }}>
          <strong>{props.Subject}</strong><br/>
          {/* <span>{props.Buyer}</span><br/> */}
          <span>{props.Qty}</span> 
        </div>
      </div>
    );
  };

  return (
    <div className="App" style={{ margin: '20px' }}>
      <ScheduleComponent 
        width='100%' 
        height='750px' 
        currentView='Month'
        eventSettings={{ 
          dataSource: remoteData,
          template: eventTemplate,
          fields: {
            id: 'Id',
            subject: { name: 'Subject' },
            startTime: { name: 'StartTime' },
            endTime: { name: 'EndTime' }
          }
        }}
        dataBinding={onDataBinding}
      >
        <Inject services={[Day, Week, WorkWeek, Month, Year, Agenda]} />
      </ScheduleComponent>
    </div>
  );
}

export default Schedule;
