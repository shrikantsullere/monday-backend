import React, { useState, useEffect } from 'react';
import { Bell, User, MessageCircle, Loader2, CheckCircle } from 'lucide-react';
import { notificationService } from '../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const styles = `
        .notifications-container { padding: 40px; background: var(--bg-card); height: 100%; overflow-y: auto; color: var(--text-main); }
        .header { border-bottom: 1px solid var(--border-color); padding-bottom: 24px; margin-bottom: 24px; }
        .header h1 { font-size: 24px; display: flex; align-items: center; gap: 12px; }
        .notification-list { max-width: 800px; }
        .notification-item { padding: 16px 0; border-bottom: 1px solid var(--border-color); display: flex; gap: 16px; position: relative; }
        .notification-item.unread { background: rgba(0, 133, 255, 0.03); }
        .icon-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; color: var(--primary-color); flex-shrink: 0; }
        .content { flex: 1; min-width: 0; }
        .content b { color: var(--text-main); }
        .content p { margin: 0; color: var(--text-main); font-size: 14px; line-height: 1.5; word-wrap: break-word; }
        .time { color: var(--text-muted); font-size: 12px; margin-top: 6px; display: block; }
        .read-badge { 
            font-size: 11px; 
            color: var(--primary-color); 
            cursor: pointer; 
            padding: 4px 8px;
            background: rgba(0, 133, 255, 0.1);
            border-radius: 4px;
            white-space: nowrap;
            height: fit-content;
        }

        @media (max-width: 600px) {
            .notifications-container { padding: 20px 16px; }
            .notification-item { padding: 12px 0; }
            .icon-circle { width: 32px; height: 32px; }
            .header h1 { font-size: 20px; }
            .notification-item { position: relative; flex-direction: column; gap: 8px; }
            .notification-row { display: flex; gap: 12px; width: 100%; }
            .read-badge { align-self: flex-start; margin-left: 44px; }
            .hide-mobile { display: none; }
            .show-mobile-only { display: block; }
        }
        @media (min-width: 601px) {
            .show-mobile-only { display: none; }
        }
    `;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <Loader2 size={40} className="spin" color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="notifications-container">
            <style>{styles}</style>
            <div className="header">
                <h1><Bell size={24} /> Notifications</h1>
            </div>

            <div className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                            <div className="notification-row">
                                <div className="icon-circle"><Bell size={20} /></div>
                                <div className="content">
                                    <p>{n.content}</p>
                                    <span className="time">{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                                {!n.isRead && (
                                    <div className="read-badge hide-mobile" onClick={() => handleMarkAsRead(n.id)}>
                                        Mark as read
                                    </div>
                                )}
                            </div>
                            {!n.isRead && (
                                <div className="read-badge show-mobile-only" onClick={() => handleMarkAsRead(n.id)}>
                                    Mark as read
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px' }}>
                        <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <h3>No notifications</h3>
                        <p>When you have new updates, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
