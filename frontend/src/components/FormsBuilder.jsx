import { useState } from 'react';
import {
    Plus, GripVertical, Settings as SettingsIcon, Eye, Save,
    Type, CheckSquare, Calendar, Hash, Clock, User,
    Trash2, ArrowLeft, Zap
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const FormsBuilder = () => {
    const navigate = useNavigate();
    const { id: boardId } = useParams();

    // Initial fields based on a default template
    const [fields, setFields] = useState([
        { id: 'f1', type: 'text', label: 'Task Name', required: true, description: '' },
        { id: 'f2', type: 'status', label: 'Status', required: true, description: '' },
        { id: 'f3', type: 'date', label: 'Due Date', required: false, description: '' }
    ]);

    const [selectedField, setSelectedField] = useState(null);
    const [formSettings, setFormSettings] = useState({
        title: 'New Request Form',
        description: 'Please fill out the details below to submit a new request to the board.',
        successMessage: 'Thank you! Your submission has been received.',
        redirectUrl: ''
    });

    const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview' | 'success'
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const availableFields = [
        { type: 'text', label: 'Short Text', icon: <Type size={16} /> },
        { type: 'long_text', label: 'Long Text', icon: <Type size={16} /> },
        { type: 'number', label: 'Number', icon: <Hash size={16} /> },
        { type: 'status', label: 'Status', icon: <CheckSquare size={16} /> },
        { type: 'date', label: 'Date', icon: <Calendar size={16} /> },
        { type: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
        { type: 'person', label: 'Person', icon: <User size={16} /> }
    ];

    // Drag & Drop Handlers
    const handleDragStart = (e, type) => {
        e.dataTransfer.setData('fieldType', type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleCanvasDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        setDragOverIndex(null);

        const fieldType = e.dataTransfer.getData('fieldType');
        if (fieldType) {
            // Adding a new field
            const fieldTemplate = availableFields.find(f => f.type === fieldType);
            const newField = {
                id: `f${Date.now()}`,
                type: fieldType,
                label: fieldTemplate?.label || 'New Field',
                required: false,
                description: ''
            };

            const newFields = [...fields];
            const insertIndex = index !== undefined ? index : newFields.length;
            newFields.splice(insertIndex, 0, newField);

            setFields(newFields);
            setSelectedField(newField);
        } else {
            // Reordering existing field (if logic implemented)
            // For simplicity, this block handles new fields primarily
        }
    };

    // Canvas Field Reordering Handlers
    const handleSortStart = (e, index) => {
        e.dataTransfer.setData('dragIndex', index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleSortDrop = (e, dropIndex) => {
        e.stopPropagation(); // Prevent canvas drop
        setDragOverIndex(null);
        const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));

        if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
            const newFields = [...fields];
            const [moved] = newFields.splice(dragIndex, 1);
            newFields.splice(dropIndex, 0, moved);
            setFields(newFields);
        } else {
            // Fallback to adding new field if type is present
            handleDrop(e, dropIndex);
        }
    };

    const updateField = (key, value) => {
        if (!selectedField) return;
        const updated = { ...selectedField, [key]: value };
        setSelectedField(updated);
        setFields(fields.map(f => f.id === selectedField.id ? updated : f));
    };

    const deleteField = (id) => {
        setFields(fields.filter(f => f.id !== id));
        if (selectedField?.id === id) setSelectedField(null);
    };

    const renderPreviewField = (field) => {
        const renderInput = () => {
            switch (field.type) {
                case 'long_text': return <textarea className="preview-input" rows={3} placeholder="Enter text..." disabled />;
                case 'status': return (
                    <select className="preview-input" disabled>
                        <option>Working on it</option>
                        <option>Done</option>
                        <option>Stuck</option>
                    </select>
                );
                case 'date': return <input type="date" className="preview-input" disabled />;
                case 'number': return <input type="number" className="preview-input" placeholder="0" disabled />;
                default: return <input type="text" className="preview-input" placeholder="Enter text..." disabled />;
            }
        };

        return renderInput();
    };

    if (viewMode === 'success') {
        return (
            <div className="forms-builder success-view">
                <div className="success-card">
                    <div className="success-icon">
                        <Zap size={40} fill="white" />
                    </div>
                    <h2>{formSettings.title}</h2>
                    <p className="success-msg">{formSettings.successMessage}</p>
                    <button className="primary-btn" onClick={() => setViewMode('edit')}>Back to Editor</button>
                    {formSettings.redirectUrl && (
                        <p className="redirect-hint">Redirecting to {formSettings.redirectUrl}...</p>
                    )}
                </div>
            </div>
        );
    }

    if (viewMode === 'preview') {
        return (
            <div className="forms-builder preview-mode">
                <div className="preview-bar">
                    <span>You are viewing the form as a responder</span>
                    <button className="close-preview" onClick={() => setViewMode('edit')}>
                        Back to Editor
                    </button>
                </div>
                <div className="form-canvas-wrapper">
                    <div className="form-canvas">
                        {/* Banner Image Placeholder */}
                        <div className="form-banner"></div>

                        <div className="form-header-preview">
                            <h1>{formSettings.title}</h1>
                            <p>{formSettings.description}</p>
                        </div>

                        <div className="form-body-preview">
                            {fields.map(f => (
                                <div key={f.id} className="preview-field-container">
                                    <label>
                                        {f.label} {f.required && <span className="req">*</span>}
                                    </label>
                                    {f.description && <span className="field-desc">{f.description}</span>}
                                    {renderPreviewField(f)}
                                </div>
                            ))}
                            <button className="submit-btn-preview" onClick={() => setViewMode('success')}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forms-builder">
            {/* Header */}
            <div className="builder-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
                    <div className="header-titles">
                        <h1>{formSettings.title}</h1>
                        <span className="badge">Draft</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="action-btn" onClick={() => setViewMode('preview')}><Eye size={16} /> Preview</button>
                    <button className="primary-btn"><Save size={16} /> Publish</button>
                </div>
            </div>

            <div className="builder-layout">
                {/* Left Sidebar: Fields */}
                <div className="builder-sidebar left">
                    <h3>Add Fields</h3>
                    <p className="sidebar-hint">Drag fields to the canvas</p>
                    <div className="field-types-list">
                        {availableFields.map(f => (
                            <div
                                key={f.type}
                                className="field-type-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, f.type)}
                                onClick={() => {
                                    // Click to add capability
                                    const newField = { id: `f${Date.now()}`, type: f.type, label: f.label, required: false };
                                    setFields([...fields, newField]);
                                    setSelectedField(newField);
                                }}
                            >
                                <div className="field-icon">{f.icon}</div>
                                <span>{f.label}</span>
                                <Plus size={14} className="add-icon" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center Canvas */}
                <div className="builder-canvas-area">
                    <div className="canvas-scroller">
                        <div
                            className="form-canvas editable"
                            onDragOver={(e) => handleCanvasDragOver(e, fields.length)}
                            onDrop={(e) => handleDrop(e, fields.length)}
                        >
                            <div className="form-banner"></div>
                            <div className="form-header-edit" onClick={() => setSelectedField('header')}>
                                <input
                                    value={formSettings.title}
                                    onChange={(e) => setFormSettings({ ...formSettings, title: e.target.value })}
                                    className="title-input"
                                    placeholder="Form Title"
                                />
                                <textarea
                                    value={formSettings.description}
                                    onChange={(e) => setFormSettings({ ...formSettings, description: e.target.value })}
                                    className="desc-input"
                                    placeholder="Add a description for this form"
                                    rows={1}
                                />
                            </div>

                            <div className="canvas-fields">
                                {fields.length === 0 && (
                                    <div className="empty-state">
                                        <p>Drag fields here from the left panel</p>
                                    </div>
                                )}

                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className={`canvas-field-item ${selectedField?.id === field.id ? 'selected' : ''} ${dragOverIndex === index ? 'drag-over-top' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleSortStart(e, index)}
                                        onDragOver={(e) => handleCanvasDragOver(e, index)}
                                        onDrop={(e) => handleSortDrop(e, index)}
                                        onClick={(e) => { e.stopPropagation(); setSelectedField(field); }}
                                    >
                                        <div className="item-drag-handle"><GripVertical size={16} /></div>
                                        <div className="item-content">
                                            <label>{field.label} {field.required && <span className="req">*</span>}</label>
                                            <div className="fake-input">
                                                {field.type === 'status' ? 'Select options' :
                                                    field.type === 'date' ? 'DD/MM/YYYY' :
                                                        `Enter ${field.type.replace('_', ' ')}`}
                                            </div>
                                        </div>
                                        <button className="item-delete" onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {/* Drop zone at the end */}
                                <div
                                    className="end-drop-zone"
                                    onDragOver={(e) => handleCanvasDragOver(e, fields.length)}
                                    onDrop={(e) => handleDrop(e, fields.length)}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Settings */}
                <div className="builder-sidebar right">
                    <div className="settings-header">
                        <SettingsIcon size={16} />
                        <h3>{selectedField === 'header' ? 'Form Settings' : selectedField ? 'Edit Field' : 'Settings'}</h3>
                    </div>

                    <div className="settings-body">
                        {selectedField === 'header' ? (
                            <div className="settings-group">
                                <label>Success Message</label>
                                <textarea
                                    value={formSettings.successMessage}
                                    onChange={(e) => setFormSettings({ ...formSettings, successMessage: e.target.value })}
                                />

                                <label style={{ marginTop: 16 }}>Redirect URL</label>
                                <input
                                    value={formSettings.redirectUrl}
                                    onChange={(e) => setFormSettings({ ...formSettings, redirectUrl: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>
                        ) : selectedField ? (
                            <div className="settings-group">
                                <label>Label</label>
                                <input
                                    value={selectedField.label}
                                    onChange={(e) => updateField('label', e.target.value)}
                                />

                                <label style={{ marginTop: 16 }}>Description</label>
                                <textarea
                                    value={selectedField.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Help text for the user"
                                />

                                <div className="toggle-setting">
                                    <label>Required</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedField.required}
                                        onChange={(e) => updateField('required', e.target.checked)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="empty-settings">
                                <p>Select a field to edit its settings</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .forms-builder {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #f5f6f8;
                    color: #333;
                }
                .success-view { alignItems: center; justifyContent: center; }
                .success-card { background: #fff; padding: 48px; border-radius: 12px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 500px; width: 90%; }
                .success-icon { width: 80px; height: 80px; background: #00c875; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; margin: 0 auto 24px; }
                .success-msg { color: #676879; margin-bottom: 32px; font-size: 16px; line-height: 1.5; }

                .preview-mode { background: #fff; }
                .preview-bar { background: #333; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; }
                .close-preview { background: rgba(255,255,255,0.2); border: none; padding: 6px 16px; color: #fff; border-radius: 4px; cursor: pointer; }
                .form-canvas-wrapper { flex: 1; overflow-y: auto; padding: 40px; background: #e5f4ff; display: flex; justify-content: center; }

                .builder-header { height: 60px; background: #fff; border-bottom: 1px solid #e1e1e1; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; z-index: 10; }
                .header-left { display: flex; align-items: center; gap: 16px; }
                .header-titles h1 { font-size: 18px; margin: 0; font-weight: 600; }
                .back-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; }
                .back-btn:hover { background: #f0f0f0; }
                .badge { background: #e1e1e1; color: #676879; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px; text-transform: uppercase; font-weight: 600; }
                
                .header-actions { display: flex; gap: 12px; }
                .action-btn { background: #fff; border: 1px solid #c3c6d4; padding: 8px 16px; border-radius: 4px; display: flex; gap: 8px; align-items: center; cursor: pointer; font-size: 14px; color: #333; }
                .primary-btn { background: #0085ff; border: none; color: #fff; padding: 8px 16px; border-radius: 4px; display: flex; gap: 8px; align-items: center; cursor: pointer; font-size: 14px; font-weight: 500; }
                .primary-btn:hover { background: #0073e6; }

                .builder-layout { flex: 1; display: flex; overflow: hidden; }
                
                .builder-sidebar { width: 260px; background: #fff; border-right: 1px solid #e1e1e1; display: flex; flex-direction: column; z-index: 2; }
                .builder-sidebar.right { border-left: 1px solid #e1e1e1; border-right: none; width: 300px; }
                .builder-sidebar h3 { font-size: 14px; text-transform: uppercase; color: #676879; margin: 24px 24px 8px; font-weight: 700; letter-spacing: 0.5px; }
                .sidebar-hint { font-size: 12px; color: #9aa5b1; margin: 0 24px 20px; }

                .field-types-list { padding: 0 16px; overflow-y: auto; flex: 1; }
                .field-type-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e6e9ef; margin-bottom: 8px; border-radius: 8px; cursor: grab; background: #fff; transition: all 0.2s; }
                .field-type-item:hover { border-color: #0085ff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-1px); }
                .field-icon { opacity: 0.6; }
                .add-icon { margin-left: auto; opacity: 0; color: #0085ff; }
                .field-type-item:hover .add-icon { opacity: 1; }

                .builder-canvas-area { flex: 1; background: #f5f7fa; position: relative; overflow: hidden; }
                .canvas-scroller { height: 100%; overflow-y: auto; padding: 40px; display: flex; justify-content: center; }
                
                .form-canvas { width: 100%; max-width: 640px; background: #fff; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); min-height: 500px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid transparent; }
                .form-canvas.editable { padding-bottom: 40px; }
                .form-banner { height: 120px; background: linear-gradient(135deg, #00c875 0%, #0085ff 100%); }

                .form-header-edit { padding: 32px 40px 16px; border-bottom: 1px solid transparent; cursor: pointer; transition: background 0.2s; }
                .form-header-edit:hover { background: #fafbfc; }
                .title-input { width: 100%; font-size: 32px; font-weight: 600; border: none; outline: none; margin-bottom: 8px; color: #333; background: transparent; }
                .desc-input { width: 100%; font-size: 16px; color: #676879; border: none; outline: none; resize: none; background: transparent; line-height: 1.5; }
                
                .form-header-preview { padding: 32px 40px; }
                .form-header-preview h1 { font-size: 32px; margin: 0 0 12px; }
                .form-header-preview p { color: #676879; font-size: 16px; margin: 0; }

                .canvas-fields { padding: 16px 40px; display: flex; flex-direction: column; gap: 8px; }
                .canvas-field-item { display: flex; gap: 12px; padding: 16px; border: 1px solid transparent; border-radius: 8px; cursor: pointer; background: #fff; transition: all 0.2s; position: relative; }
                .canvas-field-item:hover { border-color: #e1e1e1; background: #fafbfc; }
                .canvas-field-item.selected { border-color: #0085ff; background: #f0f7ff; }
                .canvas-field-item.selected label { color: #0085ff; }
                .canvas-field-item.drag-over-top { border-top: 2px solid #0085ff; }

                .item-drag-handle { color: #c3c6d4; cursor: grab; padding-top: 2px; opacity: 0; }
                .canvas-field-item:hover .item-drag-handle { opacity: 1; }
                .item-content { flex: 1; }
                .item-content label { display: block; font-weight: 500; font-size: 14px; margin-bottom: 8px; }
                .req { color: #e2445c; margin-left: 2px; }
                .fake-input { height: 40px; border: 1px solid #d0d4e4; border-radius: 4px; background: #fff; display: flex; align-items: center; padding: 0 12px; color: #9aa5b1; font-size: 14px; }
                
                .item-delete { background: #fff; border: 1px solid #e1e1e1; width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; color: #e2445c; transition: all 0.2s; }
                .item-delete:hover { background: #fff0f0; border-color: #e2445c; }
                .canvas-field-item:hover .item-delete { opacity: 1; }

                /* Preview Styles */
                .form-body-preview { padding: 0 40px 40px; }
                .preview-field-container { margin-bottom: 24px; }
                .preview-field-container label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #323338; }
                .field-desc { display: block; font-size: 12px; color: #676879; margin-bottom: 8px; }
                .preview-input { width: 100%; padding: 10px 12px; border: 1px solid #c3c6d4; border-radius: 4px; font-size: 14px; outline: none; transition: border 0.2s; }
                .preview-input:focus { border-color: #0085ff; }
                .submit-btn-preview { background: #0085ff; color: #fff; border: none; padding: 12px 32px; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 16px; transition: background 0.2s; }
                .submit-btn-preview:hover { background: #0073e6; }

                /* Settings Panel */
                .settings-header { padding: 20px 24px; border-bottom: 1px solid #e1e1e1; display: flex; align-items: center; gap: 8px; }
                .settings-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
                .settings-body { padding: 24px; }
                .settings-group { display: flex; flex-direction: column; gap: 16px; }
                .settings-group label { font-size: 13px; font-weight: 600; color: #323338; }
                .settings-group input, .settings-group textarea { width: 100%; border: 1px solid #c3c6d4; padding: 8px 12px; border-radius: 4px; font-size: 14px; outline: none; }
                .settings-group input:focus, .settings-group textarea:focus { border-color: #0085ff; }
                .settings-group textarea { resize: vertical; min-height: 80px; }
                .toggle-setting { display: flex; items-align: center; justify-content: space-between; margin-top: 8px; }
                .empty-settings { color: #676879; font-size: 14px; text-align: center; margin-top: 40px; }
                .end-drop-zone { height: 40px; transition: all 0.2s; }

                /* --- Responsive Design --- */
                @media (max-width: 1024px) {
                    .builder-sidebar.left { width: 220px; }
                    .builder-sidebar.right { width: 260px; }
                }

                @media (max-width: 768px) {
                    .builder-layout { flex-direction: column; overflow-y: auto; }
                    .builder-sidebar { width: 100% !important; height: auto; border: none; border-bottom: 1px solid #e1e1e1; }
                    .builder-sidebar.left { order: 2; padding-bottom: 24px; }
                    .builder-sidebar.right { order: 3; padding-bottom: 40px; }
                    .builder-canvas-area { order: 1; height: auto; overflow: visible; background: #fff; }
                    .canvas-scroller { padding: 16px; height: auto; }
                    .form-canvas { max-width: 100%; box-shadow: none; border: 1px solid #e1e1e1; }
                    
                    .field-types-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 24px; }
                    .field-type-item { margin-bottom: 0; }
                    
                    .builder-header { padding: 0 12px; }
                    .header-titles h1 { font-size: 14px; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .header-actions { gap: 8px; }
                    .action-btn, .primary-btn { padding: 6px 10px; font-size: 12px; }

                    .form-header-edit { padding: 24px 20px 12px; }
                    .title-input { font-size: 24px; }
                    .canvas-fields { padding: 12px 20px; }
                    .form-body-preview { padding: 0 20px 40px; }
                    .form-header-preview { padding: 24px 20px; }
                    .form-header-preview h1 { font-size: 24px; }
                }

                @media (max-width: 480px) {
                    .field-types-list { grid-template-columns: 1fr; }
                    .header-titles { display: flex; flex-direction: column; gap: 2px; }
                    .badge { margin-left: 0; width: fit-content; }
                    .primary-btn span { display: none; }
                }
            `}</style>
        </div>
    );
};

export default FormsBuilder;
