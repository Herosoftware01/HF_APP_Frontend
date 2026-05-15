import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';
import TopToolbar from './topToolbar';
import { useLocation, useNavigate } from 'react-router-dom';

DocumentEditorContainerComponent.Inject(Toolbar);
function DocEditor() {
    const location = useLocation()
    const navigate = useNavigate()
    const data = location.state;
    let container: DocumentEditorContainerComponent | null = null;
    
    function created(): void {
        container?.documentEditor.open(data.url);
    }

    function handleBackClick(): void {
        if (container !== null) {
            container.destroy();
        }
        const query = {
            preview: data.name,
            path: data.path
        };
        navigate('/sy-order/explor', { state: { query } });
    }
    return (

        <div className="control-section">
            <TopToolbar onBackClick={handleBackClick} fileName={data.name}></TopToolbar>

            <DocumentEditorContainerComponent
                id="container"
                ref={(s: DocumentEditorContainerComponent | null) => {
                    container = s;
                }}
                height="calc(100vh - 70px)"
                width="100%"
                created={created}
                serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
                enableToolbar={true}
            />

        </div>
    );

}
export default DocEditor

