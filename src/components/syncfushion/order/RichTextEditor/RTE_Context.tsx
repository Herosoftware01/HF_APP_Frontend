import * as React from "react";
import {
  HtmlEditor,
  Inject,
  Link,
  RichTextEditorComponent,
  Toolbar,
  Image
} from "@syncfusion/ej2-react-richtexteditor";

import {
  ContextMenuComponent,
  type MenuItemModel,
  type MenuEventArgs
} from "@syncfusion/ej2-react-navigations";

import { DialogComponent } from "@syncfusion/ej2-react-popups";

import "./App.css";

function RTE_Context() {
  const dialogRef = React.useRef<DialogComponent>(null);
  const rteRef = React.useRef<RichTextEditorComponent>(null);

  const [selectedText, setSelectedText] = React.useState<string>("");
  const [dialogHeader, setDialogHeader] =
    React.useState<string>("Action Dialog");

  // ✅ Menu Items
  const menuItems: MenuItemModel[] = [
    { text: "Create Task", id: "createTask" },
    { text: "Create Order", id: "createOrder" }
  ];

  // ✅ Initial RTE value
  const rteValue: string = `<p>Hello Team,</p>
    <p>Please create a task for the highlighted issue.</p>
    <p>Order ID: <b>ORD-1023</b></p>`;

  // ✅ Context Menu Select
  const onMenuSelect = (args: MenuEventArgs): void => {
    const text = window.getSelection()?.toString() || "";

    if (!text) {
      alert("Please select text inside the editor.");
      return;
    }

    setSelectedText(text);

    const dialogText = document.getElementById("dialogText");
    if (dialogText) {
      dialogText.innerText = text;
    }

    if (args.item.id === "createTask") {
      setDialogHeader("Create Task");
    } else {
      setDialogHeader("Create Order");
    }

    dialogRef.current?.show();
  };

  // ✅ Close Dialog
  const closeDialog = (): void => {
    dialogRef.current?.hide();
  };

  // ✅ Save Data
  const saveData = (): void => {
    const payload = {
      dt: new Date().toISOString(),
      ordid: "ORD" + Math.floor(Math.random() * 10000),
      mail_content: selectedText
    };

    fetch("https://hfapi.herofashion.com/syncfushion/mail/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Success:", data);
        alert("Saved successfully!");
        dialogRef.current?.hide();
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Failed to save data.");
      });
  };

  return (
    <div id="rte-container">

      {/* ✅ Dialog */}
      <DialogComponent
        ref={dialogRef}
        width="500px"
        visible={false}
        showCloseIcon={true}
        header={dialogHeader}
        buttons={[
          {
            buttonModel: { content: "Save", isPrimary: true },
            click: saveData
          },
          {
            buttonModel: { content: "Cancel" },
            click: closeDialog
          }
        ]}
      >
        <p id="dialogText"></p>
      </DialogComponent>

      {/* ✅ Rich Text Editor */}
      <RichTextEditorComponent
        ref={rteRef}
        height="400px"
        value={rteValue}
      >
        <Inject services={[Toolbar, Image, Link, HtmlEditor]} />
      </RichTextEditorComponent>

      {/* ✅ Context Menu */}
      <ContextMenuComponent
        target=".e-content"
        items={menuItems}
        select={onMenuSelect}
        beforeOpen={(args) => {
          const text = window.getSelection()?.toString();
          if (!text) {
            args.cancel = true; // ✅ Prevent open if no selection
          }
        }}
      />
    </div>
  );
}

export default RTE_Context;