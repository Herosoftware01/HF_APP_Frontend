import React, { useRef } from 'react';
import {
    DocumentEditorContainerComponent,
    Toolbar,
    Ribbon
} from '@syncfusion/ej2-react-documenteditor';
import './style.css';

// Inject required modules
DocumentEditorContainerComponent.Inject(Toolbar, Ribbon);

function Word() {
    const container = useRef<DocumentEditorContainerComponent | null>(null);

    const formatMap: Record<
        string,
        { format: 'Docx' | 'Dotx' | 'Txt' | 'Sfdt'; extension: string; mime: string }
    > = {
        saveas_sfdt: {
            format: 'Sfdt',
            extension: 'sfdt',
            mime: 'application/json'
        },
        saveas_docx: {
            format: 'Docx',
            extension: 'docx',
            mime:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        },
        saveas_dotx: {
            format: 'Dotx',
            extension: 'dotx',
            mime:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.template'
        },
        saveas_txt: {
            format: 'Txt',
            extension: 'txt',
            mime: 'text/plain'
        }
    };

    const fileMenuItemClick = async (args: any) => {
        if (!container.current) {
            return;
        }

        const saveConfig = formatMap[args.item?.id];
        if (!saveConfig) {
            return;
        }

        const blob = await container.current.documentEditor.saveAsBlob(saveConfig.format);

        if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: `sample.${saveConfig.extension}`,
                types: [
                    {
                        description: `${saveConfig.extension.toUpperCase()} File`,
                        accept: {
                            [saveConfig.mime]: [`.${saveConfig.extension}`]
                        }
                    }
                ]
            });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            container.current.documentEditor.save('sample', saveConfig.format);
        }
    };

    return (
        <DocumentEditorContainerComponent
            id="container"
            ref={container}
            height="100%"
            toolbarMode="Ribbon"
            serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
            enableToolbar={true}
            fileMenuItems={[
                'New',
                'Open',
                'Export',
                {
                    text: 'Save As',
                    iconCss: 'e-icons e-save',
                    id: 'save',
                    items: [
                        { text: 'Syncfusion Document Text (*.sfdt)', id: 'saveas_sfdt' },
                        { text: 'Word Document (*.docx)', id: 'saveas_docx' },
                        { text: 'Word Template (*.dotx)', id: 'saveas_dotx' },
                        { text: 'Plain Text (*.txt)', id: 'saveas_txt' }
                    ]
                },
                'Print'
            ]}
            fileMenuItemClick={fileMenuItemClick}
        />
    );
}

export default Word;