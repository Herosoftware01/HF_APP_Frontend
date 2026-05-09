import {
    DocumentEditorContainerComponent, Toolbar, Ribbon
} from '@syncfusion/ej2-react-documenteditor';
import './style.css';
DocumentEditorContainerComponent.Inject(Toolbar, Ribbon);
function Word() {
    return (
    <DocumentEditorContainerComponent id="container" height={"100%"} toolbarMode="Ribbon" serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/" enableToolbar={true} />);
}
export default Word