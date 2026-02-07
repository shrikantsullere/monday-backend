import React from 'react';
import {
    X, Send, Paperclip, Clock, MessageSquare, File, Activity,
    User, Calendar, Smile, Hash, Sparkles,
    MoreHorizontal, Download, Trash2, Edit3, Image as ImageIcon,
    Check
} from 'lucide-react';

const ItemDetailPanel = ({
    item,
    isOpen,
    onClose,
    onUpdate,
    statusOptions = [],
    allPersons = []
}) => {
    const [activeTab, setActiveTab] = React.useState('updates');
    const [updateText, setUpdateText] = React.useState('');
    const [updates, setUpdates] = React.useState([]);
    const [files, setFiles] = React.useState([]);
    const [activity, setActivity] = React.useState([]);

    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

    const handleAddUpdate = () => {
        if (!updateText.trim()) return;
        const newUpdate = {
            id: Date.now(),
            user: 'You',
            text: updateText,
            time: 'Just now',
            reactions: []
        };
        setUpdates([newUpdate, ...updates]);
        setUpdateText('');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsUploading(false);
                    const newFile = {
                        id: Date.now(),
                        name: file.name,
                        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                        type: file.type.includes('image') ? 'image' : 'pdf',
                        user: 'You',
                        time: 'Just now'
                    };
                    setFiles([newFile, ...files]);
                }, 500);
            }
        }, 80);
    };

    if (!item) return null;

    const currentStatus = statusOptions.find(o => o.label === item.status) || statusOptions[0];

    return (
        <div className={`detail-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="detail-panel" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="panel-header">
                    <div className="header-top">
                        <div className="item-title-container">
                            <h2
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => onUpdate({ name: e.target.innerText })}
                                className="editable-name"
                            >
                                {item.name}
                            </h2>
                        </div>
                        <button className="close-panel-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="panel-tabs">
                        <button className={`panel-tab ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')}>
                            <MessageSquare size={16} /> Updates
                        </button>
                        <button className={`panel-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
                            <Paperclip size={16} /> Files <span className="tab-count">{files.length}</span>
                        </button>
                        <button className={`panel-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                            <Clock size={16} /> Activity Log
                        </button>
                    </div>
                </div>

                <div className="panel-body">
                    <div className="panel-main-content">
                        {activeTab === 'updates' && (
                            <div className="updates-tab">
                                {/* Editor */}
                                <div className="update-editor">
                                    <div className="editor-input-wrapper">
                                        <textarea
                                            placeholder="Write an update..."
                                            value={updateText}
                                            onChange={(e) => setUpdateText(e.target.value)}
                                        />
                                        <div className="editor-toolbar">
                                            <div className="toolbar-left">
                                                <button className="toolbar-btn"><Hash size={16} /></button>
                                                <button className="toolbar-btn"><User size={16} /></button>
                                                <button className="toolbar-btn"><Smile size={16} /></button>
                                                <button className="toolbar-btn spark-btn"><Sparkles size={16} /> AI</button>
                                            </div>
                                            <button className="update-btn" onClick={handleAddUpdate}>Update</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Feed */}
                                <div className="updates-feed">
                                    {updates.map(upd => (
                                        <div key={upd.id} className="update-card">
                                            <div className="update-user">
                                                <div className="avatar-med">{upd.user[0]}</div>
                                                <div className="user-meta">
                                                    <span className="user-name">{upd.user}</span>
                                                    <span className="update-time">{upd.time}</span>
                                                </div>
                                                <button className="more-btn"><MoreHorizontal size={16} /></button>
                                            </div>
                                            <div className="update-text">{upd.text.split(/(@\w+)/).map((part, i) =>
                                                part.startsWith('@') ? <span key={i} className="mention">{part}</span> : part
                                            )}</div>
                                            <div className="update-footer">
                                                {upd.reactions.map((r, i) => (
                                                    <span key={i} className="reaction-chip">{r} 1</span>
                                                ))}
                                                <button className="add-reaction-btn"><Smile size={14} /> Add reaction</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className="files-tab">
                                <div className="file-dropzone">
                                    <label>
                                        <input type="file" hidden onChange={handleFileUpload} />
                                        <div className="dropzone-content">
                                            <Download size={32} color="#0085ff" />
                                            <h3>Drag & Drop files here</h3>
                                            <p>or click to browse from computer</p>
                                        </div>
                                    </label>
                                </div>

                                {isUploading && (
                                    <div className="upload-progress-item">
                                        <div className="progress-label">Uploading file... {uploadProgress}%</div>
                                        <div className="progress-track">
                                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                <div className="files-list">
                                    {files.map(file => (
                                        <div key={file.id} className="file-card">
                                            <div className="file-icon-box">
                                                {file.type === 'image' ? <ImageIcon size={24} color="#0085ff" /> : <File size={24} color="#676879" />}
                                            </div>
                                            <div className="file-info">
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-meta">{file.size} • {file.user} • {file.time}</span>
                                            </div>
                                            <div className="file-actions">
                                                <button className="file-action-btn"><Download size={16} /></button>
                                                <button className="file-action-btn delete"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="activity-tab">
                                <div className="activity-timeline">
                                    {activity.map(act => (
                                        <div key={act.id} className="activity-item">
                                            <div className="activity-marker"></div>
                                            <div className="activity-content">
                                                <div className="activity-user-row">
                                                    <span className="act-user">{act.user}</span>
                                                    <span className="act-time">{act.time}</span>
                                                </div>
                                                <div className="act-text">{act.action}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Side Bar Field Editor */}
                    <div className="panel-side-fields">
                        <div className="field-group">
                            <label>Status</label>
                            <div className="status-selector" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                                <div className="status-preview" style={{ background: currentStatus?.color }}>
                                    {item.status}
                                </div>
                                {showStatusDropdown && (
                                    <div className="side-dropdown">
                                        {statusOptions.map(opt => (
                                            <div
                                                key={opt.label}
                                                className="side-dropdown-item"
                                                onClick={() => {
                                                    onUpdate({ status: opt.label });
                                                    setShowStatusDropdown(false);
                                                }}
                                            >
                                                <div className="color-dot" style={{ background: opt.color }}></div>
                                                {opt.label}
                                                {item.status === opt.label && <Check size={14} style={{ marginLeft: 'auto' }} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="field-group">
                            <label>Person</label>
                            <div className="field-input-box">
                                <User size={14} className="field-icon" />
                                <span>{Array.isArray(item.person) ? item.person.join(', ') : (item.person || 'Unassigned')}</span>
                            </div>
                        </div>

                        <div className="field-group">
                            <label>Timeline</label>
                            <div className="field-input-box">
                                <Calendar size={14} className="field-icon" />
                                <span>{item.timeline || 'Set dates'}</span>
                            </div>
                        </div>

                        <div className="field-group">
                            <label>Priority</label>
                            <div className="field-input-box">
                                <Activity size={14} className="field-icon" />
                                <span>{item.priority || 'Medium'}</span>
                            </div>
                        </div>

                        <div className="panel-footer">
                            <button className="delete-item-btn"><Trash2 size={16} /> Delete Item</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .detail-panel-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.1);
                    z-index: 2000;
                    display: flex;
                    justify-content: flex-end;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .detail-panel-overlay.open { opacity: 1; pointer-events: auto; }

                .detail-panel {
                    width: 750px;
                    max-width: 95vw;
                    background: #fff;
                    height: 100%;
                    box-shadow: -8px 0 32px rgba(0,0,0,0.2);
                    display: flex;
                    flex-direction: column;
                    transform: translateX(100%);
                    transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
                }
                .detail-panel-overlay.open .detail-panel { transform: translateX(0); }

                .panel-header {
                    padding: 24px 24px 0 24px;
                    border-bottom: 1px solid #e1e1e1;
                    background: #fff;
                }
                .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
                .item-title-container { flex: 1; margin-right: 16px; }
                .editable-name { margin: 0; font-size: 24px; color: #333; outline: none; border-radius: 4px; padding: 4px; cursor: text; line-height: 1.2; }
                .editable-name:hover { background: #f5f6f8; }
                .editable-name:focus { background: #fff; box-shadow: 0 0 0 2px #0085ff; }

                .close-panel-btn { background: transparent; border: none; cursor: pointer; color: #676879; border-radius: 50%; padding: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .close-panel-btn:hover { background: #f1f1f1; color: #333; }

                .panel-tabs { display: flex; gap: 8px; }
                .panel-tab {
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: #676879;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .panel-tab:hover { color: #333; }
                .panel-tab.active { color: #0085ff; border-bottom-color: #0085ff; }
                .tab-count { background: #eee; padding: 1px 6px; border-radius: 10px; font-size: 11px; }

                .panel-body { flex: 1; display: flex; overflow: hidden; background: #fff; }
                .panel-main-content { flex: 1; overflow-y: auto; padding: 24px; background: #fff; border-right: 1px solid #f1f1f1; }
                .panel-side-fields { width: 280px; padding: 24px; overflow-y: auto; background: #fafbfc; }

                /* Updates styling */
                .update-editor { margin-bottom: 24px; }
                .editor-input-wrapper { border: 1px solid #c3c6d4; border-radius: 8px; background: #fff; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .editor-input-wrapper textarea { width: 100%; border: none; padding: 16px; min-height: 100px; resize: none; outline: none; font-size: 14px; color: #333; }
                .editor-toolbar { padding: 8px 12px; background: #f8f9fb; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e1e1e1; }
                .toolbar-left { display: flex; gap: 4px; }
                .toolbar-btn { background: transparent; border: none; padding: 6px; color: #676879; cursor: pointer; border-radius: 4px; display: flex; align-items: center; }
                .toolbar-btn:hover { background: #eee; color: #333; }
                .spark-btn { color: #a25ddc; font-weight: 600; gap: 6px; padding: 6px 10px; }
                .update-btn { background: #0085ff; color: #fff; border: none; padding: 6px 18px; border-radius: 4px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(0,133,255,0.2); }

                .update-card { border: 1px solid #e1e1e1; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: #fff; }
                .update-user { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                .avatar-med { width: 36px; height: 36px; background: #00c875; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
                .user-meta { display: flex; flex-direction: column; flex: 1; }
                .user-name { font-weight: 600; font-size: 14px; color: #333; }
                .update-time { font-size: 11px; color: #676879; }
                .update-text { font-size: 14px; line-height: 1.6; color: #333; }
                .mention { color: #0085ff; font-weight: 500; cursor: pointer; }
                .update-footer { display: flex; gap: 8px; margin-top: 16px; }
                .reaction-chip { background: #f1f6ff; padding: 4px 10px; border-radius: 12px; font-size: 12px; border: 1px solid #d0e4ff; color: #0085ff; font-weight: 500; }
                .add-reaction-btn { background: transparent; border: 1px solid #e1e1e1; border-radius: 12px; padding: 4px 10px; font-size: 11px; color: #676879; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
                .add-reaction-btn:hover { border-color: #0085ff; color: #0085ff; }

                /* Files styling */
                .file-dropzone { border: 2px dashed #c0e0ff; border-radius: 8px; padding: 32px; text-align: center; background: #f8fbff; cursor: pointer; margin-bottom: 24px; transition: all 0.2s; }
                .file-dropzone:hover { border-color: #0085ff; background: #f0f7ff; }
                .dropzone-content h3 { margin: 12px 0 4px; font-size: 18px; color: #333; }
                .dropzone-content p { color: #676879; margin: 0; font-size: 14px; }
                
                .upload-progress-item { margin-bottom: 20px; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #e1e1e1; }
                .progress-label { font-size: 12px; color: #333; margin-bottom: 6px; font-weight: 600; }
                .progress-track { height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
                .progress-fill { height: 100%; background: #0085ff; transition: width 0.1s; }

                .file-card { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e1e1e1; border-radius: 8px; margin-bottom: 12px; background: #fff; transition: all 0.2s; }
                .file-card:hover { border-color: #0085ff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .file-icon-box { background: #f5f6f8; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
                .file-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .file-name { font-weight: 600; font-size: 14px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .file-meta { font-size: 11px; color: #676879; margin-top: 2px; }
                .file-action-btn { background: transparent; border: none; padding: 6px; cursor: pointer; color: #676879; border-radius: 4px; }
                .file-action-btn:hover { background: #f1f1f1; color: #333; }
                .file-action-btn.delete:hover { color: #e2445c; background: #fff1f1; }

                /* Activity styling */
                .activity-timeline { border-left: 2px solid #e1e1e1; margin-left: 10px; padding-left: 24px; position: relative; }
                .activity-item { position: relative; margin-bottom: 32px; }
                .activity-marker { position: absolute; left: -31px; top: 4px; width: 12px; height: 12px; background: #fff; border: 2px solid #0085ff; border-radius: 50%; box-shadow: 0 0 0 4px #fff; }
                .act-user { font-weight: 600; font-size: 14px; margin-right: 8px; color: #333; }
                .act-time { font-size: 11px; color: #676879; }
                .act-text { font-size: 13px; color: #333; margin-top: 6px; line-height: 1.4; }

                /* Side fields editor */
                .field-group { margin-bottom: 24px; position: relative; }
                .field-group label { display: block; font-size: 11px; color: #676879; margin-bottom: 8px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
                .status-selector { position: relative; cursor: pointer; }
                .status-preview { padding: 8px 12px; border-radius: 4px; color: #fff; font-weight: 600; font-size: 13px; text-align: center; }
                .side-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff; border: 1px solid #e1e1e1; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 100; padding: 4px; }
                .side-dropdown-item { padding: 8px 12px; font-size: 13px; color: #333; display: flex; align-items: center; gap: 10px; border-radius: 4px; }
                .side-dropdown-item:hover { background: #f1f6ff; color: #0085ff; }
                .color-dot { width: 12px; height: 12px; border-radius: 2px; }

                .field-input-box { background: #fff; border: 1px solid #e1e1e1; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: #333; cursor: pointer; transition: all 0.2s; }
                .field-input-box:hover { border-color: #0085ff; background: #fff; }
                .field-icon { color: #b2b2b2; }

                .panel-footer { border-top: 1px solid #e1e1e1; padding-top: 32px; margin-top: 48px; }
                .delete-item-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid #e1e1e1; border-radius: 4px; color: #e2445c; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .delete-item-btn:hover { background: #fff1f1; border-color: #e2445c; }

                @media (max-width: 900px) {
                    .detail-panel { width: 100%; max-width: 100vw; }
                    .panel-body { flex-direction: column; }
                    .panel-side-fields { width: 100%; border-left: none; border-top: 1px solid #e1e1e1; background: #fff; }
                }
            `}</style>
        </div>
    );
};

export default ItemDetailPanel;
