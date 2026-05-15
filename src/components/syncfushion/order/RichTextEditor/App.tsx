
import * as React from 'react';
import { addClass, removeClass, Browser, getComponent } from '@syncfusion/ej2-base';
import { RichTextEditorComponent, Toolbar, Inject, Image, Link, HtmlEditor, Count, QuickToolbar, Table, EmojiPicker, Video, Audio, FormatPainter, PasteCleanup, ImportExport, SlashMenu, CodeBlock, ClipBoardCleanup, AutoFormat } from '@syncfusion/ej2-react-richtexteditor';
import { type ToolbarSettingsModel, type ActionBeginEventArgs, FileManager, type FileManagerSettingsModel, type QuickToolbarSettingsModel, type SlashMenuSettingsModel } from '@syncfusion/ej2-react-richtexteditor';
import { createElement } from '@syncfusion/ej2-base';
import { MentionComponent } from '@syncfusion/ej2-react-dropdowns';
import * as CodeMirror from 'codemirror';
import { Editor as ICodeMirror } from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import './App.css';
import { Sidebar } from '@syncfusion/ej2-navigations';
import { Query, DataManager, WebApiAdaptor } from '@syncfusion/ej2-data';

function App() {

    let editor: RichTextEditorComponent;
    let mention: MentionComponent;
    let codeMirror: ICodeMirror;

    const hostUrl: string = 'https://services.syncfusion.com/react/production/';

    // Rich Text Editor items list
    const items: any = [
        'Undo', 'Redo', '|', 
        'Bold', 'Italic', 'Underline', 'StrikeThrough', 'InlineCode', '|', 'CreateLink', 'Image', 'CreateTable', 'CodeBlock',
        'HorizontalLine', 'Blockquote', '|', 'LineHeight', 'Formats', 'Alignments', '|', 'BulletFormatList', 'NumberFormatList', 'Checklist', '|', 'Outdent', 'Indent', '|',
        'FontColor', 'BackgroundColor', 'FontName', 'FontSize', '|', 'LowerCase', 'UpperCase', '|', 'SuperScript', 'SubScript', '|',
        'EmojiPicker', 'FileManager', 'Video', 'Audio', '|', 'FormatPainter', 'ClearFormat',
        '|', 'Print', 'FullScreen', '|', 'SourceCode']

    const dataSource = new DataManager({
        url: 'https://services.syncfusion.com/react/production/api/Employees',
        adaptor: new WebApiAdaptor(),
        crossDomain: true
    });

    const query = new Query().select(['FirstName', 'EmployeeID']).take(7).requiresCount();
  

    const fileManagerSettings: FileManagerSettingsModel = {
        enable: true,
        path: '/Pictures/Food',
        ajaxSettings: {
            url: 'https://ej2-aspcore-service.azurewebsites.net/api/FileManager/FileOperations',
            getImageUrl: 'https://ej2-aspcore-service.azurewebsites.net/api/FileManager/GetImage',
            uploadUrl: 'https://ej2-aspcore-service.azurewebsites.net/api/FileManager/Upload',
            downloadUrl: 'https://ej2-aspcore-service.azurewebsites.net/api/FileManager/Download'
        }
    }

    const quickToolbarSettings: QuickToolbarSettingsModel = {
        table: ['Tableheader', 'TableRemove', '|', 'TableRows', 'TableColumns', 'TableCell', '|', 'TableEditProperties', 'TableCellProperties','Styles', 'BackgroundColor', 'Alignments', 'TableCellVerticalAlign'],
        text: ['Formats', '|', 'Bold', 'Italic', 'Fontcolor', 'BackgroundColor', '|', 'CreateLink', 'Image', 'CreateTable', 'Blockquote', '|' , 'Unorderedlist', 'Orderedlist', 'Indent', 'Outdent'],
        showOnRightClick: true,
    }
    const insertImageSettings: any = {
        saveUrl: hostUrl + 'api/RichTextEditor/SaveFile',
        removeUrl: hostUrl + 'api/RichTextEditor/DeleteFile',
        path: hostUrl + 'RichTextEditor/'
    }

    //Rich Text Editor ToolbarSettings
    const toolbarSettings: ToolbarSettingsModel = {
        items: items
    };

    const slashMenuSettings: SlashMenuSettingsModel = {
        enable: true,
        items: ['Paragraph', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'OrderedList', 'UnorderedList',
            'CodeBlock', 'Blockquote', 'Link', 'Image', 'Video', 'Audio', 'Table', 'Emojipicker',
        ]
    };

  
    function mirrorConversion(e?: any): void {
        const id: string = editor.getID() + 'mirror-view';
        const rteContainer: HTMLElement = editor.element.querySelector('.e-rte-container') as HTMLElement;
        let mirrorView: HTMLElement = editor.element.querySelector('#' + id) as HTMLElement;
        if (e.targetItem === 'Preview') {
            editor.value = codeMirror.getValue();
            editor.dataBind();
            rteContainer.classList.remove('e-rte-code-mirror-enabled');
            editor.focusIn();
        } else {
            rteContainer.classList.add('e-rte-code-mirror-enabled');
            rteContainer.classList.remove('e-source-code-enabled');
            const editorVlaue: string = (editor.element.querySelector('.e-rte-srctextarea') as HTMLTextAreaElement).value;
            if (!mirrorView) {
                mirrorView = createElement('div', { className: 'rte-code-mirror', id: id, styles: 'display: none;' });
                rteContainer.appendChild(mirrorView);
                renderCodeMirror(mirrorView, editorVlaue === null ? '' : editorVlaue);
            }
            else {
                codeMirror.setValue(editorVlaue);
            }
            codeMirror.focus();
        }
    }
    function renderCodeMirror(mirrorView: HTMLElement, content: string): void {
        codeMirror = CodeMirror(mirrorView, {
            value: content,
            lineNumbers: true,
            mode: 'text/html',
            lineWrapping: true,
        });
    }
    function actionCompleteHandler(e: any): void {
        if (e.targetItem && (e.targetItem === 'SourceCode' || e.targetItem === 'Preview')) {
            mirrorConversion(e);
        }
    }

    function actionBeginHandler(e: ActionBeginEventArgs): void {
        if (e.requestType === 'EnterAction' && mention && mention.element.classList.contains('e-popup-open')) {
            e.cancel = true;
        }
        if (e.requestType === 'Maximize' || e.requestType === 'Minimize') {
            handleFullScreen(e);
        }
    }

    function handleFullScreen(e: any): void {
        let sbCntEle: HTMLElement = document.querySelector('.sb-content.e-view') as HTMLElement;
        let sbHdrEle: HTMLElement = document.querySelector('.sb-header.e-view') as HTMLElement;
        const sideBarElem: HTMLElement = document.body.querySelector('#left-sidebar');
        const sideBar: Sidebar = getComponent(sideBarElem, 'sidebar');
        let leftBar: HTMLElement;
        let transformElement: HTMLElement;
        if (Browser.isDevice) {
            leftBar = document.querySelector('#right-sidebar') as HTMLElement;
            transformElement = document.querySelector('.sample-browser.e-view.e-content-animation') as HTMLElement;
        } else {
            leftBar = document.querySelector('#left-sidebar') as HTMLElement;
            transformElement = document.querySelector('#right-pane') as HTMLElement;
        }
        if (e.targetItem === 'Maximize') {
            if (Browser.isDevice && Browser.isIos) { addClass([sbCntEle, sbHdrEle], ['hide-header']); }
            sideBar.hide();
            if (!Browser.isDevice) { transformElement.style.marginLeft = '0px'; }
            transformElement.style.transform = 'inherit';
        } else if (e.targetItem === 'Minimize') {
            if (Browser.isDevice && Browser.isIos) { removeClass([sbCntEle, sbHdrEle], ['hide-header']); }
            sideBar.show();
            if (!Browser.isDevice) {
                addClass([leftBar], ['e-open']);
                transformElement.style.marginLeft = leftBar.offsetWidth + 'px';
            }
            transformElement.style.transform = 'translateX(0px)';
        }
    }

    return (
        <div className='control-pane'>
            <div className='control-section' id="rteTools">
                <div className='rte-control-section'>
                    <RichTextEditorComponent id="toolsRTE" ref={(richtexteditor: RichTextEditorComponent) => { editor = richtexteditor }}
                       showCharCount={true} actionBegin={actionBeginHandler.bind(this)}
                        actionComplete={actionCompleteHandler.bind(this)} toolbarSettings={toolbarSettings}
                        fileManagerSettings={fileManagerSettings} quickToolbarSettings={quickToolbarSettings} enableTabKey={true}
                        insertImageSettings={insertImageSettings} enableXhtml={true} placeholder='Type something or use @ to tag a user...'
                        slashMenuSettings={slashMenuSettings}>
                        <Inject services={[Toolbar, Image, Link, HtmlEditor, Count, QuickToolbar, Table, FileManager, EmojiPicker, Video, Audio, FormatPainter, PasteCleanup, SlashMenu, ImportExport, CodeBlock, ClipBoardCleanup, AutoFormat]} />
                          <p>
              Hello{' '}
              <span contentEditable={false} className="e-mention-chip">
                <a href="mailto:maria@gmail.com" title="maria@gmail.com">
                  @Maria
                </a>
              </span>
              ,{' '}
            </p>
            <p>
              Welcome to Mention demo, it easily integrates any editable element
              like input, textarea or any contenteditable supported element.
            </p>
                    </RichTextEditorComponent>
                    <MentionComponent id='editorMention' ref={(mention: MentionComponent) => { mention = mention }} dataSource={dataSource} query={query} target="#toolsRTE_rte-edit-view" fields={{ text: 'FirstName', value: 'EmployeeID' }} popupWidth='250px' popupHeight='200px' sortOrder='Ascending' allowSpaces={true}></MentionComponent>
                </div>
            </div>

        </div>
    );
}
export default App;