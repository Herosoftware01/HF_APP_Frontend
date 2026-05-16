/// <reference types="vite/client" />
import React, { useEffect, useRef, useState } from 'react';
import { ItemDirective, ItemsDirective, SidebarComponent, ToolbarComponent, TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import '../ShowCase/layout.css';
import { FileManagerComponent,Toolbar ,DetailsView,Inject, FileOpenEventArgs, BeforeImageLoadEventArgs } from '@syncfusion/ej2-react-filemanager';
import { useNavigate} from "react-router-dom";
import UserImage from '../User1.png';

function Layout() {
  const navigate = useNavigate();
  const fileObj = useRef<FileManagerComponent | null>(null);
  let dialogInstance: DialogComponent | null = null;
  let hostUrl: string = 'http://localhost:62870/';
  let ajaxSettings = {
    url: hostUrl + 'api/FileManager/FileOperations',
    getImageUrl: hostUrl + 'api/FileManager/GetImage',
    uploadUrl: hostUrl + 'api/FileManager/Upload',
    downloadUrl: hostUrl + 'api/FileManager/Download'
  };
  
  let continents: { [key: string]: Object }[] = [
    { id: '01', name: 'All Files', Icon: "sf-icon-Allfiles", selected: true },
    { id: '02', name: 'Recent Files', Icon: "sf-icon-RecentFiles", selected: false },
    { id: '03', name: 'About', Icon: "sf-icon-About", selected: false }
  ];
  const [status, setStatus] = useState<boolean>(false);
  let buttons = [
    {
      click: dlgButtonClick,
      buttonModel: {
        content: 'OK',
        isPrimary: true,
      }
    }
  ];
  let fileName : string;
  let filePath : string;
  let isImageOpen = false;
  let isPDF = false;
  let currentImageUrl :any;
  let currentUrl: any;
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [fileOverlayDisplay, setFileOverlayDisplay] = useState("");
  const [popupVisibility, setPopupVisibility] = useState<boolean>(false); 

  function onFileOpen(args : FileOpenEventArgs) : void{
    let file = (args as any).fileDetails;
    fileName = file.name;
    filePath = file.path;
    let path: string = file.filterPath.replace(/\\/g, "/") + fileName;

    if (file.isFile) {
      switch (file.type) {
        case ".jpg":
        case ".png":
        case ".dib":
        case ".jpeg":
        case ".jpe":
        case ".jfif":
        case ".gif":
        case ".tif":
        case ".tiff":
        case ".ico":
          isImageOpen= true;
          break;
        case ".pdf":
        case ".pptx":
          isPDF=true ;
          getFileStream(path, true);
          break;
        case '.docx':
        case '.doc':
        case '.rtf':
        case '.txt':
          isPDF= false;
          getFileStream(path, isPDF);
          break;
        case ".xlsx":
          getBlob(fileName, path);
          break;
        default:         
          setStatus(true);

          if (dialogInstance) {
            dialogInstance.header = fileName;
          }


          break;
      }
    }
  }

  function beforeImageLoad(args: BeforeImageLoadEventArgs){
    if (isImageOpen) {
      let file = (args as any).fileDetails;
        currentImageUrl = args.imageUrl;
        fileName = file[0].name;
        filePath = file[0].filterPath;
        isImageOpen = false;
        navigate('imageViewer',{state:{imageUrl: currentImageUrl,name:fileName,path:filePath}});     

    }
  }

  function beforeSend(args: any) {
    if (args.action !== "upload") {
      args.ajaxSettings.beforeSend = function (args: any) {        
        args.httpRequest.setRequestHeader('Authorization', selectedTree.current);
    };     
    }    
  }

  function getFileStream(path: any, isPDF: boolean) {
    let ajax: XMLHttpRequest = new XMLHttpRequest();
    ajax.open("POST", hostUrl + "api/FileManager/GetDocument", true);
    ajax.setRequestHeader("content-type", "application/json");
    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4) {
        if (ajax.status === 200 || ajax.status === 304) {
          onFileLoad(ajax.responseText, isPDF);
        }
      }
    };
    ajax.send(JSON.stringify({ "FileName": path, "Action": (!isPDF ? "ImportFile" : "LoadPDF") }));
  }

  function onFileLoad(response: string, isPDF: boolean) {
    currentUrl = response;
    if (isPDF) {
      navigate('pdfViewer',{state:{url: currentUrl,name:fileName,path:filePath}});  
    }
    else {
      navigate('docEditor',{state:{url: currentUrl,name:fileName,path:filePath}});  
    }
  }

  function getBlob(fileName: string, Path: string) {
    const request: XMLHttpRequest = new XMLHttpRequest();
    request.responseType = "blob";
    request.onload = () => {
      const file: any = new File([request.response], fileName);
      getExcel(fileName, file);
    };
    request.open("GET", `${hostUrl}api/FileManager/GetExcel?FileName=${Path}`);
    request.send();
  } 

  function getExcel(fileName : string, file :object)
  {
      navigate('Spreadsheet',{state:{name: fileName,file:file}})
  }

  function newClick():void{
      fileObj.current?.createFolder();
  }

  function dlgButtonClick():void{
    setStatus(false);
    dialogInstance?.hide();
  }

     // State to store selected tree items
     const [selectedTreeItems] = useState<string[]>([]);
     let selectedTree = useRef<string>('');
     // Event handler for when a tree node is selected
     const [toolItems, setToolItems] = useState(['Upload', 'SortBy', 'Refresh', 'Delete', 'Download', 'Rename', 'View', 'Details']);
     const [fileMenu, setFileMenu] = useState([]);
     const [folderMenu, setFolderMenu] = useState([]);
     const [layoutMenu, setLayoutMenu] = useState([]);
     const isProduction = import.meta.env.VITE_ENVIRONMENT === 'PRODUCTION';

     useEffect(() => {
      if (isProduction) {
        setToolItems(['SortBy', 'Refresh', 'Delete', 'Download', 'Rename', 'View', 'Details']);
      } else {
        setToolItems(['Upload', 'SortBy', 'Refresh', 'Delete', 'Download', 'Rename', 'View', 'Details']);
      }
    }, [isProduction]);
  
    const profile = () => {
      return (
        <div>
          <img className="profile-img" src={UserImage} alt="" />
        </div>
      );
    }    
     const header = () => {
      return (
        <span className="e-icons e-hamburger-icon"></span>
      );
    }
    const headerlogo = () => {
      return (
          <span className="e-folder-logo e-header-icon">
           <img width="30px" src="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMzIgMzIiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojZWJiODI0O30uY2xzLTIsLmNscy0ze2ZpbGw6I2ZmZjt9LmNscy0ye29wYWNpdHk6MC42NTt9LmNscy0ze29wYWNpdHk6MC40O30uY2xzLTR7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCk7fTwvc3R5bGU+PGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQiIHgxPSIxNiIgeTE9IjM0LjgyIiB4Mj0iMTYiIHkyPSIxNS40NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2FkZDdmZiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzZhYmNmZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjx0aXRsZT5Mb2dvPC90aXRsZT48cmVjdCBjbGFzcz0iY2xzLTEiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgcng9IjYuMDgiLz48cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yLjg4LDYuNzJoMjYuNEEuMzIuMzIsMCwwLDEsMjkuNiw3djEwLjRoLTI3VjdBLjMyLjMyLDAsMCwxLDIuODgsNi43MloiLz48cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Ik00LjMyLDQuNDhIMjhhLjMyLjMyLDAsMCwxLC4zMi4zMlY2LjcySDRWNC44QS4zMi4zMiwwLDAsMSw0LjMyLDQuNDhaIi8+PHBhdGggY2xhc3M9ImNscy00IiBkPSJNMS42LDkuOEg5YTEuNjEsMS42MSwwLDAsMSwxLjEuNDRsNCwzLjgxYTEuNTksMS41OSwwLDAsMCwxLjA3LjQ0bDE1LjI4LjI4QTEuNjEsMS42MSwwLDAsMSwzMiwxNi4zN3Y5LjU1QTYuMDgsNi4wOCwwLDAsMSwyNS45MiwzMkg2LjA4QTYuMDgsNi4wOCwwLDAsMSwwLDI1LjkyVjExLjRBMS42LDEuNiwwLDAsMSwxLjYsOS44WiIvPjwvc3ZnPg==" alt="header-img" />
          </span>
      );
  }
  // Define function to handle tree node selection
  const handleTreeSelect = (args: any) => {

    if (fileObj.current) {
      fileObj.current.clearSelection();
      fileObj.current.path = '';
    }

       const treeNode = args.nodeData.id;
       let flag = false;
       let newToolItems: any = [];
       let newFileMenu: any = [];
       let newFolderMenu: any = [];
       let newLayoutMenu: any = [];
       if(treeNode === "03"){
        flag = true;
       }
       switch (treeNode) {
         case "02":
           newToolItems = ["Download", "Rename", "SortBy", "Refresh", "Selection", "View", "Details"];
           newFileMenu = ["Open", "Delete", "Download", "Rename", "Details"];
           newFolderMenu = ["Open", "Delete", "Download", "Rename", "Details"];
           newLayoutMenu = ["SortBy", "View", "Refresh", "NewFolder", "Details", "SelectAll"];

           selectedTree.current = "Recent";
           (fileObj as any).ajaxSettings.url = hostUrl + 'api/FileManager/FileOperations';
           (fileObj as any).ajaxSettings.getImageUrl = hostUrl + 'api/FileManager/GetImage';
           (fileObj as any).ajaxSettings.downloadUrl = hostUrl + 'api/FileManager/Download';
           break;
         case "03":
           navigate('about');
           break;
         default:
          if (isProduction) {
            newToolItems = ["Delete", "Download", "Rename", "SortBy", "Refresh", "Selection", "View", "Details"];
          } else {
            newToolItems = ["Upload", "Delete", "Download", "Rename", "SortBy", "Refresh", "Selection", "View", "Details"];
          }
           
            newFileMenu = ["Open", "Delete", "Download", "Rename", "Details"];
            newFolderMenu = ["Open", "Delete", "Download", "Rename", "Details"];
            newLayoutMenu = ["SortBy", "View", "Refresh", "NewFolder", "Details", "SelectAll"];

           selectedTree.current = "AllFiles";
           (fileObj as any).ajaxSettings.url = hostUrl + 'api/FileManager/FileOperations';
           (fileObj as any).ajaxSettings.getImageUrl = hostUrl + 'api/FileManager/GetImage';
           (fileObj as any).ajaxSettings.uploadUrl = hostUrl + 'api/FileManager/Upload';
           (fileObj as any).ajaxSettings.downloadUrl = hostUrl + 'api/FileManager/Download';
           break;
       }
       if (!flag) {
        (fileObj as any).path = "/";
        (fileObj as any).refresh();
       }
       setToolItems(newToolItems);
       setFileMenu(newFileMenu);
       setFolderMenu(newFolderMenu);
       setLayoutMenu(newLayoutMenu);
     };

     function beforeDownload(args: any) {
      if (selectedTree.current === "Recent") {
        var modifiedPath = args.data.data[0].filterPath;
        args.data.path = modifiedPath;
      }  
    }
     const openClick = () => {
       setFileOverlayDisplay("e-file-show-overlay");
       setSidebarToggle(true);
     };
     
     const closeClick = () => {
       setFileOverlayDisplay("e-file-hide-overlay");
       setSidebarToggle(false);
     };
     
     const hamburgerClick = () => {
       setSidebarToggle(!sidebarToggle);
     };
  return (
    <div className="control-section" style={{ height: '100%' }}>     
      <div className="e-full-layout" style={{ height: '100%' }}>
        {/* LayoutHeader */}
        <div id="LayoutHeader" className="e-Header">
          <ToolbarComponent className="e-HeaderToolbar" id="headerTool" height={'60px'}>
            <ItemsDirective>
              <ItemDirective cssClass="e-hamburger" click={hamburgerClick}  template={header} tooltipText="Menu" align="Left"></ItemDirective>
              <ItemDirective template={headerlogo} tooltipText="Logo" align="Left"></ItemDirective>
              <ItemDirective id="doc-header" text="Document Explorer" align="Left"></ItemDirective>
            </ItemsDirective>
          </ToolbarComponent>
        </div>
        {/* ContentSection  */}
        <div id="LayoutContent" className="e-mainLayout-content">
        <SidebarComponent animate={false} type="Over" className="e-sidebar-content" isOpen={sidebarToggle} target=".e-mainLayout-content" mediaQuery="(min-width: 601px)"  enableGestures={false} open={openClick} close={closeClick}>
                <div id="LeftButtonContainer" className="e-left-button-contain">
                    <ButtonComponent className="newbutton" iconCss="e-add e-icons e-plus" onClick={newClick} isPrimary={true}>New Folder</ButtonComponent>
                </div>
                <div className="e-card e-side-card">
                <div className="e-card-header">
                    <div id="User-Img" className="e-user-img e-avatar e-avatar-circle"> </div>
                    <div className="e-card-header-caption e-user-name">
                      <div className="e-card-header-title"> Angellina</div>
                      <div className="e-card-sub-title"><a>Change Picture</a></div>
                    </div>
                </div>
            </div>
                {/* sidebar options */}
                <div id="LeftTreeContainer" className="e-left-tree-contain">               
                <TreeViewComponent id='treeelement' fields={{ dataSource: continents, id: 'id', text: 'name', iconCss: 'Icon' }} cssClass='e-left-tree'  nodeSelected={handleTreeSelect} selectedNodes={selectedTreeItems} />                    
                </div>
                <div className="e-card e-side-card e-side-bottom-card">
                    <div className="e-card-content"><a className="e-empty-link">My Profile</a></div>
                    <div className="e-card-content"><a className="e-empty-link">Settings</a></div>
                    <div className="e-card-content"><a className="e-empty-link">Sign Out</a></div>
                </div>
            </SidebarComponent>
            <div id="RightLayout" className="e-right-layout" style={{ height: '100%' , marginLeft:'260px' }}>
                <FileManagerComponent id="file-manager" 
ref={(s: FileManagerComponent | null) => {
    fileObj.current = s;
  }}
 height={'100%'} ajaxSettings = {ajaxSettings} toolbarSettings={{ items: toolItems }} fileOpen={onFileOpen} beforeImageLoad={beforeImageLoad} beforeSend={beforeSend} beforeDownload={beforeDownload} enablePersistence={true}
                 >
                <Inject services={[ DetailsView, Toolbar]}/>
                </FileManagerComponent>
                <div id="file-overlay" className={`e-file-overlay ${fileOverlayDisplay}`}></div>
            </div>
        </div>
      </div>
    {/* popup containing user options like profile, sign out/in  */}
      <div id="user-Popup" className={`e-notch e-icons e-user-Popup ${popupVisibility ? 'e-show-popup ' : 'e-hide-popup '}`}>
      <div className={`e-card ${popupVisibility ? 'e-show-popup ' : 'e-hide-popup '}`}>
            <div className="e-card-header">
                <div id="User-Img" className="e-user-img e-avatar e-avatar-circle"> </div>
                <div className="e-card-header-caption e-user-name">
                    <div className="e-card-header-title"> Angellina</div>
                    <div className="e-card-sub-title">Change Picture</div>
                </div>
            </div>
            <div className="e-card-content">
                <div className="e-storage-progress progress">
                    <div className="progress-bar">
                    </div>
                </div>
                <div className="e-storage-value">70% storage used</div>
            </div>
            <div className="e-card-content">My Profile</div>
            <div className="e-card-content">Settings</div>
            <div className="e-card-content">Sign Out</div>
        </div>
    </div>
    <div id='dialog-target'>
      <DialogComponent  
ref={(dialog: DialogComponent | null) => {
    dialogInstance = dialog;
  }}
 minHeight='50px' isModal={true} width='350px' content='This is a Dialog with contentThis type of file cannot be previewed.' buttons={buttons} visible={status} target='#dialog-target'></DialogComponent>
      </div>
    </div>
  );
}

export default Layout;