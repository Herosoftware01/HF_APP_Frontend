import { useEffect, useRef } from 'react';
import { ImageEditorComponent } from '@syncfusion/ej2-react-image-editor';
import { Browser, isNullOrUndefined, getComponent } from '@syncfusion/ej2-base';
import './style.css';

const ImageEditor = () => {
    let imgObj = useRef<ImageEditorComponent>(null);
    const imageEditorCreated = (): void => {
        if (Browser.isDevice) {
            imgObj.current.open("src/image-editor/images/flower.png");
        } else {
            imgObj.current.open("src/image-editor/images/default.png");
        }
        if (imgObj.current.theme && window.location.href.split("#")[1]) {
            imgObj.current.theme = window.location.href.split("#")[1].split("/")[1];
        }
    };
    // Handler used to reposition the tooltip on page scroll
    const onScroll = (): void => {
        if (document.getElementById("image-editor_sliderWrapper")) {
            let slider: any = getComponent(
                document.getElementById("image-editor_sliderWrapper"),
                "slider"
            );
            slider.refreshTooltip(slider.tooltipTarget);
        }
    };
    if (!isNullOrUndefined(document.getElementById("right-pane"))) {
        document
            .getElementById("right-pane")
            .addEventListener("scroll", onScroll.bind(this));
    }
    return (
        <div className="control-pane">
            <div className="control-section">
                <div className="row">
                    <div className="col-lg-12 control-section">
                        <div className="e-img-editor-sample">
                            <ImageEditorComponent
                                id="image-editor"
                                ref={imgObj}
                                created={imageEditorCreated}
                            ></ImageEditorComponent>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ImageEditor;