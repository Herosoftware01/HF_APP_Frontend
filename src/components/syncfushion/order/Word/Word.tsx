import {
    DocumentEditorContainerComponent, Toolbar
} from '@syncfusion/ej2-react-documenteditor';
import './style.css';
DocumentEditorContainerComponent.Inject(Toolbar);
function Word() {
    return (
    <DocumentEditorContainerComponent id="container" height={'590px'} serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/" enableToolbar={true} />);
}
export default Word