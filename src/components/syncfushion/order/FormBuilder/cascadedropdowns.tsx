import { FormRenderer, DataSchema, UISchema } from '@syncfusion/ej2-react-form-renderer';

const data: DataSchema = {
  "version": "0.1.0",
  "properties": {
    "country": {
      "id": "dropdown_1778222708405_814",
      "name": "dropdown_815",
      "type": "string",
      "label": "Country",
      "options": [
        "India",
        "USA"
      ]
    },
    "state": {
      "id": "dropdown_1778222747818_702",
      "name": "dropdown_308",
      "type": "string",
      "label": "State",
      "options": [
        "Tamil Nadu",
        "Kerala"
      ]
    },
    "state_77": {
      "id": "dropdown_1778222759439_77",
      "name": "dropdown_997",
      "type": "string",
      "label": "State",
      "options": [
        "New York",
        "Texas"
      ]
    },
    "city": {
      "id": "dropdown_1778222778660_737",
      "name": "dropdown_62",
      "type": "string",
      "label": "City",
      "options": [
        "Madurai",
        "Chennai",
        "Coimbatore",
        "Theni"
      ]
    },
    "city_78": {
      "id": "dropdown_1778223273858_78",
      "name": "dropdown_657",
      "type": "string",
      "label": "City",
      "options": [
        "Trivandrum",
        "Kannur",
        "Cochin"
      ]
    },
    "city_795": {
      "id": "dropdown_1778223338364_795",
      "name": "dropdown_556",
      "type": "string",
      "label": "City",
      "options": [
        "New York City",
        "Buffalo"
      ]
    },
    "city_91": {
      "id": "dropdown_1778223433393_91",
      "name": "dropdown_687",
      "type": "string",
      "label": "City",
      "options": [
        "Houston",
        "Dallas"
      ]
    },
    "submit": {
      "id": "submit_button_initial",
      "type": "button",
      "label": "Submit",
      "buttonType": "submit"
    }
  }
}

const uischema: UISchema = {
  "properties": {
    "country": {
      "widget": "dropdown",
      "labelPosition": "top"
    },
    "state": {
      "widget": "dropdown",
      "labelPosition": "top",
      "conditions": {
        "visibleWhen": {
          "condition": "and",
          "rules": [
            {
              "label": "Country",
              "field": "dropdown_1778222708405_814",
              "operator": "equal",
              "type": "string",
              "value": "India"
            }
          ]
        }
      }
    },
    "state_77": {
      "widget": "dropdown",
      "conditions": {
        "visibleWhen": {
          "condition": "and",
          "rules": [
            {
              "label": "Country",
              "field": "dropdown_1778222708405_814",
              "operator": "equal",
              "type": "string",
              "value": "USA"
            }
          ]
        }
      }
    },
    "city": {
      "widget": "dropdown",
      "conditions": {
        "visibleWhen": {
          "condition": "and",
          "rules": [
            {
              "label": "State",
              "field": "dropdown_1778222747818_702",
              "operator": "equal",
              "type": "string",
              "value": "Tamil Nadu"
            }
          ]
        }
      },
      "labelPosition": "top"
    },
    "city_78": {
      "widget": "dropdown",
      "conditions": {
        "visibleWhen": {
          "condition": "and",
          "rules": [
            {
              "label": "State",
              "field": "dropdown_1778222747818_702",
              "operator": "equal",
              "type": "string",
              "value": "Kerala"
            }
          ]
        }
      }
    },
    "city_795": {
      "widget": "dropdown",
      "conditions": {
        "visibleWhen": {
          "condition": "and",
          "rules": [
            {
              "label": "State",
              "field": "dropdown_1778222759439_77",
              "operator": "equal",
              "type": "string",
              "value": "New York"
            }
          ]
        }
      },
      "labelPosition": "top"
    },
    "city_91": {
      "widget": "dropdown",
      "labelPosition": "top",
      "conditions": {
        "visibleWhen": {
          "condition": "and",
          "rules": [
            {
              "label": "State",
              "field": "dropdown_1778222759439_77",
              "operator": "equal",
              "type": "string",
              "value": "Texas"
            }
          ]
        }
      }
    },
    "submit": {
      "widget": "button",
      "style": "primary",
      "position": "left"
    }
  },
  "layout": [
    {
      "type": "field",
      "propertyId": "country"
    },
    {
      "type": "field",
      "propertyId": "state"
    },
    {
      "type": "field",
      "propertyId": "state_77"
    },
    {
      "type": "field",
      "propertyId": "city"
    },
    {
      "type": "field",
      "propertyId": "city_78"
    },
    {
      "type": "field",
      "propertyId": "city_795"
    },
    {
      "type": "field",
      "propertyId": "city_91"
    },
    {
      "type": "field",
      "propertyId": "submit"
    }
  ]
};


function Formbuilder() {
  return (
    <FormRenderer
      dataSchema={data}
      uiSchema={uischema}
      onSubmit={async ({ data: formData }) => {
        console.log('Form data:', formData);
      }}
    />
  );
}
export default Formbuilder;
