import React, { useState } from 'react';
import { FormRenderer } from '@syncfusion/ej2-react-form-renderer';
import { formData, uiSchema } from './data';
 
function Formbuilder() {
  // Key state to reset the form after a successful submission
  const [formKey, setFormKey] = useState(0);
 
  return (
    <FormRenderer
      key={formKey}
      dataSchema={formData}
      uiSchema={uiSchema}
      onSubmit={async ({ data: formData }) => {
        console.log("Form data:", formData);
 
        // Map form fields to match your backend payload requirements
        const payload = {
          ordid: formData['Order ID'],
          planno: formData['Plan No'],
          shipreqd: formData['Ship Reqd']
        };
 
        try {
          const response = await fetch(
            "https://app.herofashion.com/order_ship_plan/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            }
          );
 
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
 
          const result = await response.json();
          console.log("API Success:", result);
 
          // Increment key to force-reset the Syncfusion form component
          setFormKey(prev => prev + 1);
        } catch (error) {
          console.error("API Error:", error);
        }
      }}
    />
  );
}
 
export default Formbuilder;
 
 