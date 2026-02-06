import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, ChevronDown, Rocket, Crown, MoreHorizontal, X, Menu, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsPanel from './NotificationsPanel';

const Topbar = ({ onMobileMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const bellButtonRef = useRef(null);
    const searchInputRef = useRef(null);
    const userMenuRef = useRef(null);

    const topbarStyles = `
        .topbar {
            height: 60px;
            background-color: var(--bg-card);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            position: sticky;
            top: 0;
            z-index: 100;
            gap: 16px;
        }

        .topbar-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }

        .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 8px;
            color: var(--text-main);
            border-radius: 4px;
            transition: all 0.2s;
            min-width: 32px;
            height: 32px;
        }

        .mobile-menu-btn:hover {
            background-color: var(--bg-hover);
            color: var(--primary-color);
        }

        .workspace-selector {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-main);
            transition: background 0.2s;
            max-width: 200px;
        }

        .workspace-selector:hover {
            background: var(--bg-hover);
        }
        .workspace-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #ffcb00 0%, #ff9800 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #fff;
            font-size: 12px;
            flex-shrink: 0;
        }

        .workspace-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .topbar-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 1;
            justify-content: flex-end;
            min-width: 0;
        }

        .search-container {
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
        }

        .search-input {
            width: 260px;
            height: 32px;
            padding: 0 12px 0 32px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.2s;
            background: var(--bg-page);
            color: var(--text-main);
        }

        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(0, 133, 255, 0.1);
        }

        .search-icon-inside {
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-secondary);
            pointer-events: none;
        }

        .icon-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            color: var(--text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            position: relative;
        }

        .icon-btn:hover {
            background: var(--bg-hover);
        }

        .notification-badge {
            position: absolute;
            top: 2px;
            right: 2px;
            background: var(--danger-color);
            color: white;
            border-radius: 10px;
            padding: 2px 4px;
            font-size: 9px;
            font-weight: 700;
            min-width: 14px;
            text-align: center;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color) 0%, #00c8ff 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            flex-shrink: 0;
            border: none;
            transition: box-shadow 0.2s;
        }

        .user-avatar:hover {
            box-shadow: 0 0 0 2px rgba(0, 133, 255, 0.3);
        }

        .user-menu-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            min-width: 200px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 300;
            overflow: hidden;
        }

        .user-menu-header {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border-color);
        }

        .user-menu-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-main);
        }

        .user-menu-role {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 2px;
            text-transform: capitalize;
        }

        .user-menu-logout {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 10px 14px;
            background: none;
            border: none;
            font-size: 14px;
            color: var(--text-main);
            cursor: pointer;
            transition: background 0.15s;
            text-align: left;
        }

        .user-menu-logout:hover {
            background: var(--bg-hover);
            color: var(--danger-color);
        }

        .upgrade-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: linear-gradient(135deg, #ffcb00 0%, #ff9800 100%);
            color: #fff;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: transform 0.2s;
            white-space: nowrap;
            height: 32px;
            flex-shrink: 0;
        }

        .upgrade-btn:hover {
            transform: translateY(-1px);
        }

        .mobile-search-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-card);
            display: flex;
            align-items: center;
            padding: 0 16px;
            z-index: 200;
        }

        .mobile-search-input {
            flex: 1;
            height: 40px;
            border: none;
            font-size: 16px;
            outline: none;
            margin-left: 12px;
            background: transparent;
            color: var(--text-main);
        }

        @media (max-width: 768px) {
            .mobile-logo-container {
                display: flex;
                align-items: center;
                gap: 8px;
                color: var(--text-main);
                font-weight: 800;
                font-size: 1.2rem;
            }
        }
    `;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        if (userMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [userMenuOpen]);

    const handleSearchClick = () => {
        if (window.innerWidth <= 768) {
            setSearchActive(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            navigate('/search');
        }
    };

    const handleAction = (msg) => {
        alert(msg); // Simple pro-active feedback
    };

    return (
        <div className="topbar">
            <style>{topbarStyles}</style>

            {/* Mobile Search Overlay */}
            {searchActive && (
                <div className="mobile-search-overlay">
                    <Search size={20} color="var(--text-secondary)" />
                    <form
                        style={{ width: '100%', display: 'flex' }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const val = e.target.elements.mobileSearch.value;
                            if (val.trim()) {
                                navigate(`/search?q=${encodeURIComponent(val.trim())}`);
                                setSearchActive(false);
                            }
                        }}
                    >
                        <input
                            ref={searchInputRef}
                            name="mobileSearch"
                            type="text"
                            className="mobile-search-input"
                            placeholder="Search..."
                            onBlur={() => {
                                setTimeout(() => setSearchActive(false), 200);
                            }}
                        />
                    </form>
                    <button onClick={() => setSearchActive(false)} style={{ background: 'none', border: 'none', padding: '8px', color: 'var(--text-main)' }}>
                        <X size={24} />
                    </button>
                </div>
            )}

            <div className="topbar-left">
                {/* Branding and Workspace selector removed as per user request */}
            </div>

            <div className="topbar-right">
                <div className="search-container hide-mobile">
                    <Search size={16} className="search-icon-inside" />
                    <form
                        style={{ width: '100%', display: 'flex' }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const val = e.target.elements.searchInput.value;
                            if (val.trim()) {
                                navigate(`/search?q=${encodeURIComponent(val.trim())}`);
                            }
                        }}
                    >
                        <input
                            name="searchInput"
                            type="text"
                            className="search-input"
                            placeholder="Search everything..."
                        />
                    </form>
                </div>

                <button className="icon-btn mobile-search-btn" onClick={handleSearchClick} style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
                    <Search size={20} />
                </button>

                <button className="upgrade-btn hide-mobile" onClick={() => handleAction('Upgrade plan feature coming soon!')}>
                    <Crown size={18} />
                    <span className="upgrade-span">Upgrade</span>
                </button>

                <button
                    ref={bellButtonRef}
                    className="icon-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notifications"
                >
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                <button className="icon-btn hide-mobile" title="Apps" onClick={() => handleAction('Apps marketplace coming soon!')}>
                    <Rocket size={20} />
                </button>

                <button className="icon-btn hide-mobile" title="Settings" onClick={() => navigate('/settings')}>
                    <Settings icon size={20} />
                </button>

                <div className="user-avatar-wrap" ref={userMenuRef}>
                    <button
                        type="button"
                        className="user-avatar"
                        title={`${user?.username || ''} (${user?.role || ''})`}
                        onClick={() => setUserMenuOpen((o) => !o)}
                    >
                        {(user?.username || 'U').charAt(0).toUpperCase()}
                    </button>
                    {userMenuOpen && (
                        <div className="user-menu-dropdown">
                            <div className="user-menu-header">
                                <div className="user-menu-name">{user?.username}</div>
                                <div className="user-menu-role">{user?.role}</div>
                            </div>
                            <button
                                type="button"
                                className="user-menu-logout"
                                onClick={() => {
                                    logout();
                                    setUserMenuOpen(false);
                                    navigate('/login', { replace: true });
                                }}
                            >
                                <LogOut size={16} /> Log out
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className="mobile-menu-btn"
                    onClick={onMobileMenuClick}
                    style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
                >
                    <Menu size={24} />
                </button>
            </div>

            {showNotifications && (
                <NotificationsPanel
                    onClose={() => setShowNotifications(false)}
                    anchorRef={bellButtonRef}
                />
            )}
        </div>
    );
};

export default Topbar;
