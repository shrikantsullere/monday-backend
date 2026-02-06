import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { itemService } from '../services/api';

const MyWork = () => {
    const [myItems, setMyItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const styles = `
        .my-work-container { padding: 48px; background: var(--bg-page); height: 100%; overflow-y: auto; color: var(--text-main); }
        .header { margin-bottom: 32px; }
        .header h1 { font-size: 28px; display: flex; align-items: center; gap: 12px; }
        .work-grid { display: grid; gap: 24px; }
        .work-card { background: var(--bg-card); padding: 24px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .item-info h4 { margin: 0 0 4px 0; }
        .item-info p { margin: 0; color: var(--text-secondary); font-size: 14px; }
        .item-status { padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #fff; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('done')) return 'var(--success-color)';
        if (s.includes('working')) return 'var(--primary-color)';
        if (s.includes('stuck')) return 'var(--danger-color)';
        return 'var(--text-muted)';
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={40} className="spin" color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="my-work-container">
            <style>{styles}</style>
            <div className="header">
                <h1><Briefcase size={32} color="var(--primary-color)" /> My Work</h1>
                <p>Everything assigned to you, in one place.</p>
            </div>

            <div className="work-grid">
                {myItems.length > 0 ? (
                    myItems.map(item => (
                        <div key={item.id} className="work-card">
                            <div className="item-info">
                                <h4>{item.name}</h4>
                                <p>
                                    {item.Group?.Board?.name} • {item.Group?.title}
                                    {item.isSubItem && <span style={{ marginLeft: '8px', fontSize: '12px', background: 'var(--bg-hover)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px' }}>Subitem of {item.parentItem?.name}</span>}
                                </p>
                            </div>
                            <div className="item-status" style={{ background: getStatusColor(item.status) }}>
                                {item.status}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px' }}>
                        <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3>All caught up!</h3>
                        <p>You have no items assigned to you at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyWork;
