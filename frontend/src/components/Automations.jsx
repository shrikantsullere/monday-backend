import React from 'react';
import { Zap, Plus, ArrowRight, Play, Settings, Trash2, Edit, Power, PowerOff } from 'lucide-react';

const Automations = () => {
    const [automations, setAutomations] = React.useState([
        {
            id: 1,
            trigger: 'Status changes to',
            triggerValue: 'Done',
            action: 'Move item to',
            actionValue: 'Completed Folder',
            enabled: true
        },
        {
            id: 2,
            trigger: 'Date arrives',
            triggerValue: 'Due Date',
            action: 'Send notification to',
            actionValue: 'Assignee',
            enabled: true
        },
        {
            id: 3,
            trigger: 'New item created',
            triggerValue: '',
            action: 'Assign person',
            actionValue: 'Project Manager',
            enabled: false
        }
    ]);

    const [showBuilder, setShowBuilder] = React.useState(false);
    const [newAutomation, setNewAutomation] = React.useState({
        trigger: 'Status changes to',
        triggerValue: '',
        action: 'Send notification to',
        actionValue: ''
    });

    const triggerOptions = [
        'Status changes to',
        'Date arrives',
        'New item created',
        'Person assigned',
        'Column value changes'
    ];

    const actionOptions = [
        'Send notification to',
        'Move item to',
        'Assign person',
        'Change status to',
        'Create new item',
        'Send email'
    ];

    const handleSaveAutomation = () => {
        if (newAutomation.triggerValue && newAutomation.actionValue) {
            setAutomations([...automations, {
                id: Date.now(),
                ...newAutomation,
                enabled: true
            }]);
            setNewAutomation({
                trigger: 'Status changes to',
                triggerValue: '',
                action: 'Send notification to',
                actionValue: ''
            });
            setShowBuilder(false);
        }
    };

    const toggleAutomation = (id) => {
        setAutomations(automations.map(auto =>
            auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
        ));
    };

    const deleteAutomation = (id) => {
        setAutomations(automations.filter(auto => auto.id !== id));
    };

    const styles = `
        .automations-container {
            padding: 48px;
            background: #f5f6f8;
            height: 100%;
            overflow-y: auto;
        }

        .automations-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }

        .automations-header h1 {
            font-size: 28px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
        }

        .canvas {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .automation-card {
            background: #fff;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #e1e1e1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.2s;
        }

        .automation-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .automation-card.disabled {
            opacity: 0.5;
            background: #f9f9f9;
        }

        .flow {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 16px;
            flex: 1;
        }

        .token {
            padding: 4px 12px;
            background: #f1f1f1;
            border-radius: 4px;
            font-weight: 600;
            color: #0085ff;
        }

        .btn-primary {
            background: #0085ff;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
        }

        .btn-primary:hover {
            background: #0073e6;
        }

        .badge-ai {
            background: #a25ddc;
            color: #fff;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 700;
        }

        .automation-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .action-icon {
            cursor: pointer;
            color: #676879;
            transition: color 0.2s;
        }

        .action-icon:hover {
            color: #0085ff;
        }

        .action-icon.delete:hover {
            color: #e2445c;
        }

        .builder-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .builder-content {
            background: white;
            padding: 32px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
        }

        .builder-content h2 {
            margin: 0 0 24px 0;
            font-size: 24px;
        }

        .builder-section {
            margin-bottom: 24px;
        }

        .builder-section label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }

        .builder-section select,
        .builder-section input {
            width: 100%;
            padding: 10px;
            border: 1px solid #c3c6d4;
            border-radius: 4px;
            font-size: 14px;
        }

        .builder-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .btn-secondary {
            background: white;
            color: #676879;
            border: 1px solid #c3c6d4;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-secondary:hover {
            background: #f5f6f8;
        }

        @media (max-width: 768px) {
            .automations-container {
                padding: 16px;
            }

            .flow {
                flex-wrap: wrap;
                font-size: 14px;
            }

            .automation-card {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
        }
    `;

    return (
        <div className="automations-container">
            <style>{styles}</style>
            <div className="automations-header">
                <h1><Zap size={32} color="#a25ddc" /> Automations <span className="badge-ai">AI-POWERED</span></h1>
                <button className="btn-primary" onClick={() => setShowBuilder(true)}>
                    <Plus size={18} /> Create New Automation
                </button>
            </div>

            <div className="canvas">
                {automations.map(auto => (
                    <div key={auto.id} className={`automation-card ${!auto.enabled ? 'disabled' : ''}`}>
                        <div className="flow">
                            <span>When</span>
                            <span className="token">{auto.trigger}</span>
                            {auto.triggerValue && <span className="token" style={{ color: '#00c875' }}>{auto.triggerValue}</span>}
                            <ArrowRight size={20} color="#676879" />
                            <span>{auto.action}</span>
                            <span className="token">{auto.actionValue}</span>
                        </div>
                        <div className="automation-actions">
                            {auto.enabled ? (
                                <Power className="action-icon" size={18} onClick={() => toggleAutomation(auto.id)} />
                            ) : (
                                <PowerOff className="action-icon" size={18} onClick={() => toggleAutomation(auto.id)} />
                            )}
                            <Edit className="action-icon" size={18} />
                            <Trash2 className="action-icon delete" size={18} onClick={() => deleteAutomation(auto.id)} />
                        </div>
                    </div>
                ))}

                <div className="automation-card" style={{ borderStyle: 'dashed', background: '#fafbfc' }}>
                    <div className="flow" style={{ color: '#676879' }}>
                        <Zap size={20} color="#a25ddc" />
                        <span>AI Suggestion: "When project is 100% complete, generate PDF report and email to client."</span>
                    </div>
                    <button className="btn-primary" style={{ background: '#a25ddc' }}>Enable</button>
                </div>
            </div>

            {showBuilder && (
                <div className="builder-modal" onClick={() => setShowBuilder(false)}>
                    <div className="builder-content" onClick={e => e.stopPropagation()}>
                        <h2>Create New Automation</h2>

                        <div className="builder-section">
                            <label>WHEN (Trigger)</label>
                            <select
                                value={newAutomation.trigger}
                                onChange={e => setNewAutomation({ ...newAutomation, trigger: e.target.value })}
                            >
                                {triggerOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="builder-section">
                            <label>Trigger Value</label>
                            <input
                                type="text"
                                placeholder="e.g., Done, High Priority, etc."
                                value={newAutomation.triggerValue}
                                onChange={e => setNewAutomation({ ...newAutomation, triggerValue: e.target.value })}
                            />
                        </div>

                        <div className="builder-section">
                            <label>THEN (Action)</label>
                            <select
                                value={newAutomation.action}
                                onChange={e => setNewAutomation({ ...newAutomation, action: e.target.value })}
                            >
                                {actionOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="builder-section">
                            <label>Action Value</label>
                            <input
                                type="text"
                                placeholder="e.g., Project Manager, Completed Board, etc."
                                value={newAutomation.actionValue}
                                onChange={e => setNewAutomation({ ...newAutomation, actionValue: e.target.value })}
                            />
                        </div>

                        <div className="builder-actions">
                            <button className="btn-secondary" onClick={() => setShowBuilder(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveAutomation}>Save Automation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Automations;
