import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent, SwitchComponent } from '@syncfusion/ej2-react-buttons';
import { SpeechToTextComponent, TextAreaComponent } from '@syncfusion/ej2-react-inputs';
import './style.css';
import { useEffect, useRef, useState } from 'react';

const Default = () => {

    const [isSupportedBrowser, setIsSupportBrowser] = useState(true);
    const [languageDropdownEnabled, setLanguageDropdownEnabled] = useState(true);
    const [interimSwitchDisabled, setInterimSwitchDisabled] = useState(false);

    const speechToTextObj = useRef(null);
    const textareaObj = useRef(null);
    const copyButtonObj = useRef(null);

    const miColor = [
        { text: "Normal", value: "" },
        { text: "Primary", value: "e-primary" },
        { text: "Success", value: "e-success" },
        { text: "Warning", value: "e-warning" },
        { text: "Danger", value: "e-danger" },
        { text: "Flat", value: "e-flat" },
        { text: "Info", value: "e-info" }
    ];
    const languageTypes = [
        { text: "English, US", value: "en-US" },
        { text: "German, DE", value: "de-DE" },
        { text: "Chinese, CN", value: "zh-CN" },
        { text: "French, FR", value: "fr-FR" },
        { text: "Arabic, SA", value: "ar-SA" }
    ];

    const micField = { text: "text", value: "value" };
    const languageField = { text: "text", value: "value" };

    const onTranscriptChanged = (args: any) => {
        if (!args.isInterimResult)
            args.transcript += ' ';

        textareaObj.current.value = args.transcript;
        toggleCopyButtonState();
    };
    const onListeningStart = () => {
        if (isSupportedBrowser) {
            if (textareaObj.current.value)
                speechToTextObj.current.transcript = textareaObj.current.value + '\n';

            updateStatus('Listening... Speak now...');
        } else {
            updateStatus('For unsupported browsers, use event callbacks to handle Speech-to-Text actions.');
        }
        setLanguageDropdownEnabled(false);
        setInterimSwitchDisabled(true);
    };
    const onListeningStop = (args: any) => {
        if (isSupportedBrowser) {
            if (args.isInteracted)
                updateStatus('Click the mic button to start speaking...');
        } else {
            updateStatus('For unsupported browsers, use event callbacks to handle Speech-to-Text actions.');
        }
        setLanguageDropdownEnabled(true);
        setInterimSwitchDisabled(false);
    };
    const onErrorHandler = (args: any) => {
        updateStatus(args.errorMessage);
        if (args.error === 'unsupported-browser')
            setIsSupportBrowser(false);
    };
    const updateStatus = (status: any) => {
        (document.querySelector('.speech-recognition-status') as HTMLElement).innerText = status;
    };
    const handleMiColor = (args: any) => {
        speechToTextObj.current.cssClass = args.value;
    };
    const handleLanguageType = (args) => {
        speechToTextObj.current.lang = args.value;
    };
    const handleAllowInterimResults = (args) => {
        speechToTextObj.current.allowInterimResults = args.checked;
    };
    const handleShowTooltip = (args) => {
        speechToTextObj.current.showTooltip = args.checked;
    };
    const handleIconWithText = (args) => {
        speechToTextObj.current.buttonSettings = {
            content: args.checked ? 'Start Listening' : '',
            stopContent: args.checked ? 'Stop Listening' : ''
        };
    };
    const handleCopyButton = () => {
        const copyText = textareaObj.current.value;
        const copyBtnElem = document.querySelector('#transcript-copy-button') as HTMLElement;

        if (copyText && navigator.clipboard) {
            navigator.clipboard.writeText(copyText).then(function () {
                copyBtnElem.innerText = 'Copied!';
                setTimeout(function () {
                    copyBtnElem.innerText = 'Copy';
                }, 1000);
            }).catch(function (err) {
                console.error('Clipboard write failed', err);
            });
        }
    };

    const handleClearButton = () => {
        textareaObj.current.value = speechToTextObj.current.transcript = '';
        toggleCopyButtonState();
    };

    const toggleCopyButtonState = () => {
        var hasText = textareaObj.current.element.value.trim() !== '';
        copyButtonObj.current.disabled = hasText ? false : true;
    }

    return (
        <div className="control-pane">
            <div className="col-lg-8 control-section">
                <div className="default-speechToText-section">
                    <div className="speechToText-container">
                        <SpeechToTextComponent
                            id="speech-to-text"
                            ref={speechToTextObj}
                            transcriptChanged={onTranscriptChanged}
                            onStart={onListeningStart}
                            onStop={onListeningStop}
                            onError={onErrorHandler}
                        />
                        <mark className="speech-recognition-status">Click the mic button to start speaking...</mark>
                    </div> 
                    <div className="output-container">
                        <h4>Live Speech Transcription</h4>
                        <TextAreaComponent
                            id="output-textarea"
                            ref={textareaObj}
                            cssClass="e-outline"
                            resizeMode="None"
                            rows={10}
                            placeholder="Transcribed text will appear here..."
                            input={toggleCopyButtonState}
                        />
                        <div className="output-options">
                            <ButtonComponent id="transcript-copy-button" className="e-btn" onClick={handleCopyButton} disabled={true} ref={copyButtonObj}>Copy</ButtonComponent>
                            <ButtonComponent id="transcript-clear-button" className="e-btn" onClick={handleClearButton}>Clear</ButtonComponent>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-4 default-speechToText property-section">
                <div className="property-panel-header">Properties</div>
                <div className="property-panel-content">
                    <table>
                        <tbody>
                            <tr>
                                <td>Styling</td>
                                <td>
                                    <DropDownListComponent
                                        id="stt-styling-ddl"
                                        dataSource={miColor}
                                        fields={micField}
                                        change={handleMiColor}
                                        index={0}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Language</td>
                                <td>
                                    <DropDownListComponent
                                        id="stt-lang-ddl"
                                        dataSource={languageTypes}
                                        fields={languageField}
                                        change={handleLanguageType}
                                        index={0}
                                        enabled={languageDropdownEnabled}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Interim results</td>
                                <td>
                                    <SwitchComponent id="interim-switch" type="checkbox" checked={true} change={handleAllowInterimResults} disabled={interimSwitchDisabled} />
                                </td>
                            </tr>
                            <tr>
                                <td>Show tooltip</td>
                                <td>
                                    <SwitchComponent id="tooltip-switch" type="checkbox" checked={true} change={handleShowTooltip} />
                                </td>
                            </tr>
                            <tr>
                                <td>Show icon with text</td>
                                <td>
                                    <SwitchComponent id="icon-with-text-switch" type="checkbox" checked={false} change={handleIconWithText} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
export default Default;