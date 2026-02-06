import React from 'react';
import { X } from 'lucide-react';

const RightPanel = ({ isOpen, onClose, title, children }) => {
    const panelStyles = `
        .right-panel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: ${isOpen ? 'block' : 'none'};
            transition: opacity 0.3s ease;
        }

        .right-panel {
            position: fixed;
            top: 0;
            right: ${isOpen ? '0' : '-600px'};
            width: 600px;
            max-width: 90vw;
            height: 100vh;
            background: #fff;
            box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
        }

        .right-panel-header {
            padding: 16px 24px;
            border-bottom: 1px solid #e1e1e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .right-panel-header h2 {
            margin: 0;
            font-size: 1.25rem;
            color: #323338;
        }

        .close-panel-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #676879;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-panel-btn:hover {
            background: #f1f1f1;
        }

        .right-panel-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }
    `;

    return (
        <>
            <style>{panelStyles}</style>
            <div className="right-panel-overlay" onClick={onClose} />
            <div className="right-panel">
                <div className="right-panel-header">
                    <h2>{title || 'Details'}</h2>
                    <button className="close-panel-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="right-panel-content">
                    {children}
                </div>
            </div>
        </>
    );
};

export default RightPanel;
