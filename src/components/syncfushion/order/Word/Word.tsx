import React, { useRef, useEffect, useState } from 'react';
import {
    DocumentEditorContainerComponent,
    Toolbar,
    Ribbon
} from '@syncfusion/ej2-react-documenteditor';
import { SwitchComponent } from '@syncfusion/ej2-react-buttons';
import './style.css';

// Inject required modules
DocumentEditorContainerComponent.Inject(Toolbar, Ribbon);

function Word() {
    const container = useRef<DocumentEditorContainerComponent | null>(null);

    let contentChanged = false;
    const autoSaveEnabled = useRef(false);
    const [autoSaveChecked, setAutoSaveChecked] = useState(false);

    const saveDocument = async () => {
        if (!container.current) return;

        const blob = await container.current.documentEditor.saveAsBlob('Docx');

        let formData = new FormData();
        formData.append('fileName', 'sample.docx');
        formData.append('data', blob);

        await fetch('http://localhost:62871/api/documenteditor/AutoSave', {
            method: 'POST',
            body: formData
        });

    };

    const startAutoSaveLoop = () => {
        setInterval(() => {
            if (autoSaveEnabled.current && contentChanged) {
                saveDocument();
                contentChanged = false;
            }
        }, 1000);
    };

    const onContentChange = () => {
        if (autoSaveEnabled.current) {
            contentChanged = true;
        }
    };

    const handleAutoSaveChange = (args: any) => {
        autoSaveEnabled.current = args.checked;
        setAutoSaveChecked(args.checked);

        if (args.checked) {
            console.log("Auto Save ON");
            saveDocument();
        } else {
            console.log("Auto Save OFF");
        }

        // Trigger layout recalculation after state change
        setTimeout(() => {
            if (container.current?.documentEditor) {
                container.current.documentEditor.resize();
            }
        }, 50);
    };

    useEffect(() => {
        const editor = container.current?.documentEditor;
        if (!editor) return;

        let spellChecker = editor.spellChecker;
        if (spellChecker) {
            spellChecker.languageID = 1033;
            spellChecker.removeUnderline = false;
            spellChecker.allowSpellCheckAndSuggestion = true;
        }

        startAutoSaveLoop();
        editor.contentChange = onContentChange;

    }, []);

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
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            description: 'Word Document'
        },
        saveas_dotx: {
            format: 'Dotx',
            extension: 'dotx',
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100%',
            overflow: 'hidden' 
        }}>
            {/* Auto Save Switch Container */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '10px 10px',
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #e0e0e0',
                minHeight: '40px',
                height: '40px',
                flexShrink: 0,
                boxSizing: 'border-box'
            }}>
                <label style={{ fontSize: '14px', fontWeight: '500', margin: '0' }}>Auto Save:</label>
                <SwitchComponent
                    id="autoSaveSwitch"
                    change={handleAutoSaveChange}
                    checked={autoSaveChecked}
                />
            </div>

            {/* Document Editor */}
            <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                overflow: 'hidden'
            }}>
                <DocumentEditorContainerComponent
                    id="container"
                    ref={container}
                    height="100%"
                    toolbarMode="Ribbon"
                    ribbonLayout="Classic"
                    serviceUrl="http://localhost:6002/api/documenteditor/"
                    enableToolbar={true}
                    enableSpellCheck={true}
                    contentChange={onContentChange}
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
            </div>
        </div>
    );
}

export default Word;