import { createRoot } from 'react-dom/client';
import './index.css';
import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { BlockEditorComponent } from '@syncfusion/ej2-react-blockeditor';

import * as data from './blockData.json';

const TemplateGallery = () => {
    const editorRef = useRef(null);
    const cards = data["blockTemplate"][0].page;
    const [selectedCardName, setSelectedCardName] = useState(null);
    const [selectedCardIcon, setSelectedCardIcon] = useState(null);
    const onEditorCreated = useCallback(() => {
        editorRef.current.focusIn();
    }, []);
    const loadPage = (pageData) => {
        setSelectedCardName(pageData.name);
        setSelectedCardIcon(pageData.icon);
        if (editorRef.current && typeof editorRef.current.renderBlocksFromJson === 'function') {
            editorRef.current.renderBlocksFromJson(pageData.blocks, true);
        }
    };
    const handleCardClick = (page) => {
        editorRef.current.focusIn();
        loadPage(page);
    };
    useEffect(() => {
        loadPage(cards[1]);
    }, []);
    return (<div className="control-pane">
      <div className="control-section blockeditor-template">

        <div className="cards-wrapper">
          <div className="fade left"/>
          <div className="cards-container">
            {cards.map((card) => (<div key={card?.name} className={`template-card ${selectedCardName === card?.name ? 'active' : ''}`} onClick={() => handleCardClick(card)} title={card?.name}>
                <div className="card-icon-left"><span className="icon">{card?.icon}</span></div>
                <div className="card-content">
                  <div className="card-title">{card?.name}</div>
                  <div className="card-subtitle">{card?.subtitle}</div>
                </div>
              </div>))}
          </div>
          <div className="fade right"/>
        </div>
        
        <div className="header-label" contentEditable={true} suppressContentEditableWarning>
          <span className="selectedTitle" aria-placeholder="Untitle">
            {selectedCardIcon || ''}{selectedCardName || ''}
          </span>
        </div>


        <BlockEditorComponent height="500px" ref={editorRef} id="template-gallery-blockeditor" created={onEditorCreated}/>

      </div>

    </div>);
};
export default TemplateGallery;
