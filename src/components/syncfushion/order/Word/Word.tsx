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

    type SaveFormat = 'Docx' | 'Dotx' | 'Txt' | 'Sfdt';

    interface SaveConfig {
        format: SaveFormat;
        extension: string;
        mime: string;
        description: string;
    }

    const SAVE_FORMATS: Record<string, SaveConfig> = {
        saveas_docx: {
            format: 'Docx',
            extension: 'docx',
            mime:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            description: 'Word Document'
        },

        saveas_dotx: {
            format: 'Dotx',
            extension: 'dotx',
            mime:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
            description: 'Word Template'
        },

        saveas_txt: {
            format: 'Txt',
            extension: 'txt',
            mime: 'text/plain',
            description: 'Plain Text'
        },

        saveas_sfdt: {
            format: 'Sfdt',
            extension: 'sfdt',
            mime: 'application/json',
            description: 'Syncfusion Document Text'
        }
    };


    const fileMenuItemClick = async (args: any) => {
        if (!container.current) return;

        const config = SAVE_FORMATS[args.item?.id];
        if (!config) return;

        const { format, extension, mime, description } = config;

        const blob = await container.current.documentEditor.saveAsBlob(format);

        if ('showSaveFilePicker' in window) {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: `sample.${extension}`,
                types: [
                    {
                        description,
                        accept: {
                            [mime]: [`.${extension}`]
                        }
                    }
                ]
            });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            container.current.documentEditor.save('sample', format);
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