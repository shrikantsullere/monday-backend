import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, CheckCircle, Clock, Loader2, AlertCircle, PlayCircle, ExternalLink, ChevronDown } from 'lucide-react';
import { itemService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MyWork = () => {
    const navigate = useNavigate();
    const [myItems, setMyItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('in_progress');
    const [activeStatusMenu, setActiveStatusMenu] = useState(null);

    const statusOptions = [
        { label: 'Working on it', color: '#fdab3d' },
        { label: 'Done', color: '#00c875' },
        { label: 'Stuck', color: '#e2445c' },
        { label: 'Waiting', color: '#0085ff' },
        { label: 'For Client Review', color: '#ffcb00' },
        { label: 'Waiting for Details', color: '#0086c0' },
        { label: 'Waiting for VSS Cert', color: '#e2445c' },
        { label: '90% Payment', color: '#a25ddc' }
    ];

    useEffect(() => {
        fetchMyItems();
    }, []);

    const fetchMyItems = async () => {
        try {
            const res = await itemService.getMyItems();
            setMyItems(res.data);
        } catch (err) {
            console.error('Failed to fetch my items:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            await itemService.updateItem(itemId, { status: newStatus });
            setMyItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
            ));
            setActiveStatusMenu(null);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.label === status);
        return option ? option.color : '#c4c4c4';
    };

    const styles = `
        .my-work-container { padding: 40px; background: #fff; height: 100%; overflow-y: auto; color: #323338; }
        .header { margin-bottom: 32px; }
        .header h1 { font-size: 32px; font-weight: 700; color: #323338; display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0; }
        .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid #e1e1e1; }
        .tab-btn { padding: 12px 24px; border: none; background: transparent; cursor: pointer; color: #676879; font-weight: 400; font-size: 14px; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .tab-btn:hover { background: #f5f6f8; color: #323338; }
        .tab-btn.active { color: #0085ff; border-bottom-color: #0085ff; font-weight: 500; }
        .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; background: #eee; color: #323338; }
        
        .work-grid { display: grid; gap: 12px; }
        .work-card { background: #fff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e1e1e1; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; position: relative; }
        .work-card:hover { border-color: #0085ff; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
        
        .item-main { display: flex; align-items: center; gap: 16px; flex: 1; }
        .item-info h4 { margin: 0 0 4px 0; font-size: 16px; font-weight: 500; color: #323338; }
        .item-meta { display: flex; align-items: center; gap: 8px; color: #676879; font-size: 13px; }
        .board-link { display: flex; align-items: center; gap: 4px; color: #0085ff; text-decoration: none; cursor: pointer; }
        .board-link:hover { text-decoration: underline; }
        
        .item-actions { display: flex; align-items: center; gap: 16px; position: relative; }
        .status-pill-trigger { padding: 8px 16px; border-radius: 4px; font-size: 13px; font-weight: 500; color: #fff; min-width: 140px; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        
        .status-menu { position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #e1e1e1; border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); z-index: 100; min-width: 200px; padding: 8px; margin-top: 4px; }
        .status-menu-item { padding: 8px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: background 0.2s; }
        .status-menu-item:hover { background: #f5f6f8; }
        .status-color-dot { width: 12px; height: 12px; border-radius: 2px; }

        .empty-state { text-align: center; padding: 80px; color: #676879; background: #f5f6f8; border-radius: 8px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;

    const completedItems = myItems.filter(i => (i.status || '').toLowerCase() === 'done');
    const stuckItems = myItems.filter(i => (i.status || '').toLowerCase() === 'stuck');
    const inProgressItems = myItems.filter(i =>
        (i.status || '').toLowerCase() !== 'done' &&
        (i.status || '').toLowerCase() !== 'stuck'
    );

    const activeItems = activeTab === 'in_progress' ? inProgressItems : activeTab === 'completed' ? completedItems : stuckItems;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={40} className="spin" color="#0085ff" />
            </div>
        );
    }

    return (
        <div className="my-work-container">
            <style>{styles}</style>
            <div className="header">
                <h1>My Work</h1>
                <p>Manage all tasks assigned to you across all boards.</p>
            </div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`} onClick={() => setActiveTab('in_progress')}>
                    <PlayCircle size={16} /> In Progress <span className="badge">{inProgressItems.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'stuck' ? 'active' : ''}`} onClick={() => setActiveTab('stuck')}>
                    <AlertCircle size={16} /> Stuck <span className="badge">{stuckItems.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                    <CheckCircle size={16} /> Completed <span className="badge">{completedItems.length}</span>
                </button>
            </div>

            <div className="work-grid">
                {activeItems.length > 0 ? (
                    activeItems.map(item => {
                        const boardName = item.Group?.Board?.name || item.group?.Board?.name || 'Main Workspace';
                        const boardId = item.Group?.Board?.id || item.group?.Board?.id;

                        return (
                            <div key={item.id} className="work-card">
                                <div className="item-main">
                                    <div className="item-info">
                                        <h4>{item.name}</h4>
                                        <div className="item-meta">
                                            <span className="board-link" onClick={() => boardId && navigate(`/board/${boardId}`)}>
                                                <ExternalLink size={12} /> {boardName}
                                            </span>
                                            <span>•</span>
                                            <span>{item.Group?.title || item.group?.title || 'General'}</span>
                                            {item.timeline && (
                                                <>
                                                    <span>•</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {item.timeline}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <div
                                        className="status-pill-trigger"
                                        style={{ background: getStatusColor(item.status) }}
                                        onClick={() => setActiveStatusMenu(activeStatusMenu === item.id ? null : item.id)}
                                    >
                                        {item.status || 'No Status'}
                                        <ChevronDown size={14} />
                                    </div>

                                    {activeStatusMenu === item.id && (
                                        <div className="status-menu">
                                            {statusOptions.map(opt => (
                                                <div
                                                    key={opt.label}
                                                    className="status-menu-item"
                                                    onClick={() => handleStatusUpdate(item.id, opt.label)}
                                                >
                                                    <div className="status-color-dot" style={{ background: opt.color }}></div>
                                                    <span>{opt.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-state">
                        <h3>No items in {activeTab.replace('_', ' ')}</h3>
                        <p>Items assigned to you with this status will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyWork;
