import React, { useState, useEffect, useRef } from 'react';
import {
    Bell, User, MessageCircle, CheckSquare, Clock,
    Calendar, AlertCircle, X, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/api';

const NotificationsPanel = ({ isOpen, onClose, anchorRef }) => {
    const navigate = useNavigate();
    const panelRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await notificationService.getNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target) &&
                anchorRef?.current && !anchorRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    const getIcon = (type) => {
        switch (type) {
            case 'assignment': return <User size={18} />;
            case 'comment': return <MessageCircle size={18} />;
            case 'status': return <CheckSquare size={18} />;
            case 'deadline': return <Clock size={18} />;
            case 'system': return <AlertCircle size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'assignment': return { bg: '#e5f4ff', color: '#0085ff' };
            case 'comment': return { bg: '#f0f4ff', color: '#5559df' };
            case 'status': return { bg: '#e5ffe5', color: '#00c875' };
            case 'deadline': return { bg: '#fff0e5', color: '#fdab3d' };
            case 'system': return { bg: '#f5f5f5', color: '#333' };
            default: return { bg: '#f5f5f5', color: '#676879' };
        }
    };

    const getRelativeTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const markAsRead = async (id, e) => {
        e?.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            // Assuming backend supports batch update or loop through
            // Ideally backend should have a 'mark all read' endpoint
            // For now, loop through unread
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        onClose();

        if (notification.link) {
            navigate(notification.link);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div ref={panelRef} className="notifications-panel">
            <div className="panel-header">
                <div className="header-left">
                    <Bell size={18} />
                    <h3>Notifications</h3>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </div>
                <div className="header-actions">
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={markAllAsRead}>
                            <Check size={14} />
                            Mark all as read
                        </button>
                    )}
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={40} style={{ opacity: 0.2 }} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => {
                        const iconStyle = getIconColor(notification.type);
                        return (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {!notification.isRead && <div className="unread-indicator" />}

                                <div
                                    className="notification-icon"
                                    style={{ background: iconStyle.bg, color: iconStyle.color }}
                                >
                                    {getIcon(notification.type)}
                                </div>

                                <div className="notification-content">
                                    <div className="notification-text">
                                        {notification.content}
                                    </div>
                                    <div className="notification-time">{getRelativeTime(notification.createdAt)}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                .notifications-panel {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 420px;
                    max-height: 600px;
                    background: var(--bg-card);
                    border-radius: 8px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    z-index: 1000;
                    color: var(--text-main);
                }

                .panel-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .header-left h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .unread-badge {
                    background: var(--danger-color);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .mark-all-btn {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 13px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                }

                .mark-all-btn:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary-color);
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    border-radius: 4px;
                }

                .close-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-main);
                }

                .notifications-list {
                    overflow-y: auto;
                    max-height: 500px;
                }

                .notification-item {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    gap: 12px;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.2s;
                }

                .notification-item:hover {
                    background: var(--bg-hover);
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-item.unread {
                    background: rgba(0, 133, 255, 0.05);
                }

                .notification-item.unread:hover {
                    background: rgba(0, 133, 255, 0.08);
                }

                .unread-indicator {
                    position: absolute;
                    left: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 6px;
                    height: 6px;
                    background: var(--primary-color);
                    border-radius: 50%;
                }

                .notification-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-text {
                    font-size: 14px;
                    color: var(--text-main);
                    line-height: 1.4;
                    margin-bottom: 4px;
                }

                .notification-text strong {
                    font-weight: 600;
                    color: var(--primary-color);
                }

                .notification-message {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-style: italic;
                    margin-bottom: 4px;
                    line-height: 1.3;
                }

                .notification-time {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .empty-state {
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .empty-state p {
                    margin: 12px 0 0 0;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .notifications-panel {
                        width: calc(100vw - 32px);
                        max-width: 420px;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationsPanel;
