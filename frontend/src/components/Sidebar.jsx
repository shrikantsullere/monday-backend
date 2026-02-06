import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Briefcase,
    Bell,
    Search,
    Layout,
    Plus,
    FileText,
    Users,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Home,
    Folder,
    LayoutDashboard,
    File,
    Zap,
    X as CloseIcon
} from 'lucide-react';

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onMobileToggle, onCreateBoard, boardFolders, unreadCount }) => {
    const location = useLocation();
    const [openFolders, setOpenFolders] = useState(['f1', 'f2', 'f3']);

    const toggleFolder = (folderId) => {
        setOpenFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        );
    };

    const handleLinkClick = () => {
        // Close mobile sidebar when a link is clicked
        if (window.innerWidth <= 768) {
            onMobileToggle();
        }
    };

    const sidebarStyles = `
        .sidebar-container {
            width: ${isCollapsed ? '64px' : '260px'};
            background-color: var(--bg-sidebar);
            height: 100vh;
            display: flex;
            flex-direction: column;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-right: 1px solid var(--border-color);
            position: relative;
            z-index: 200;
        }

        .sidebar-header {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: ${isCollapsed ? 'center' : 'space-between'};
            min-height: 48px;
        }

        .logo-box {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #fff;
            font-weight: 800;
            font-size: 1.2rem;
            letter-spacing: -0.5px;
            white-space: nowrap;
            overflow: hidden;
        }

        .mobile-close-btn {
            display: none;
            background: transparent;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 4px;
        }

        .collapse-trigger {
            position: absolute;
            right: -12px;
            top: 24px;
            width: 24px;
            height: 24px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-main);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 10;
        }

        .sidebar-nav-scroll {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px 0;
            scrollbar-width: thin;
        }

        .sidebar-nav-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .nav-section {
            margin-bottom: 24px;
        }

        .section-label {
            padding: 0 20px 8px;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: ${isCollapsed ? 'none' : 'block'};
        }

        .sidebar-item {
            display: flex;
            align-items: center;
            padding: 8px 20px;
            color: var(--sidebar-text);
            text-decoration: none;
            gap: 12px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            cursor: pointer;
            border-left: 3px solid transparent;
        }

        .sidebar-item:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        .sidebar-item.active {
            background: var(--sidebar-active-bg);
            color: var(--primary-color);
            border-left-color: var(--primary-color);
        }

        .folder-item {
            display: flex;
            align-items: center;
            padding: 8px 12px 8px 20px;
            color: var(--sidebar-text);
            cursor: pointer;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
        }

        .folder-item:hover {
            color: #fff;
        }

        .folder-content {
            padding-left: 12px;
        }

        .board-item {
            display: flex;
            align-items: center;
            padding: 6px 20px 6px 32px;
            color: var(--sidebar-text);
            text-decoration: none;
            gap: 10px;
            font-size: 13px;
            transition: all 0.2s;
        }

        .board-item:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        .board-item.active {
            background: var(--sidebar-active-bg);
            color: var(--primary-color);
        }

        .create-btn-container {
            padding: 16px 20px;
        }

        .create-board-btn {
            width: 100%;
            padding: 8px;
            background: var(--primary-color);
            color: #fff;
            border: none;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .create-board-btn:hover {
            background: var(--primary-hover);
        }

        .sidebar-footer {
            padding: 16px 0;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .badge {
            background: var(--danger-color);
            color: #fff;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: auto;
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
            .sidebar-container {
                position: fixed;
                left: ${isMobileOpen ? '0' : '-100%'};
                width: 280px;
                top: 0;
                box-shadow: ${isMobileOpen ? '2px 0 8px rgba(0,0,0,0.5)' : 'none'};
                background-color: var(--bg-sidebar);
            }
            
            .collapse-trigger { 
                display: none; 
            }

            .mobile-close-btn {
                display: block;
            }

            .sidebar-header {
                justify-content: space-between;
            }
        }
    `;

    const getBoardPath = (board) => {
        if (typeof board === 'string') {
            switch (board) {
                case 'Project Pipeline': return '/pipeline';
                case 'AI Future Projects': return '/ai-future-projects';
                case 'AI R&D Roadmap': return '/ai-roadmap';
                case 'Commercial - SIRA': return '/commercial-sira';
                case 'DM Inquiries - Master Board': return '/dm-inquiries';
                default: return '/board';
            }
        }
        return `/board/${board.id}`;
    };

    return (
        <aside className="sidebar-container">
            <style>{sidebarStyles}</style>

            <div className="sidebar-header">
                <div className="logo-box">
                    <Zap size={24} fill="var(--primary-color)" color="var(--primary-color)" />
                    {!isCollapsed && <span>Work OS</span>}
                </div>
                <button className="mobile-close-btn" onClick={onMobileToggle}>
                    <CloseIcon size={24} />
                </button>
            </div>

            <div className="collapse-trigger" onClick={onToggle}>
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </div>

            <div className="sidebar-nav-scroll">
                <div className="nav-section">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <Home size={20} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink
                        to="/my-work"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <Briefcase size={20} />
                        {!isCollapsed && <span>My Work</span>}
                    </NavLink>
                    <NavLink
                        to="/notifications"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <Bell size={20} />
                        {!isCollapsed && (
                            <>
                                <span>Notifications</span>
                                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                            </>
                        )}
                    </NavLink>
                    <NavLink
                        to="/search"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <Search size={20} />
                        {!isCollapsed && <span>Search Everything</span>}
                    </NavLink>
                </div>

                {!isCollapsed && (
                    <div className="create-btn-container">
                        <button className="create-board-btn" onClick={onCreateBoard}>
                            <Plus size={18} />
                            <span>Create New Board</span>
                        </button>
                    </div>
                )}

                <div className="nav-section">
                    <div className="section-label">Favorites</div>
                    {/* Favorites content could go here */}
                </div>

                <div className="nav-section">
                    {!isCollapsed && boardFolders?.map(folder => (
                        <div key={folder.id} className="folder-container">
                            <div className="folder-item" onClick={() => toggleFolder(folder.id)}>
                                {openFolders.includes(folder.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <Folder size={18} fill={openFolders.includes(folder.id) ? "var(--warning-color)" : "transparent"} color="var(--warning-color)" />
                                <span>{folder.name}</span>
                            </div>
                            {openFolders.includes(folder.id) && (
                                <div className="folder-content">
                                    {folder.boards.map(board => (
                                        <NavLink
                                            key={typeof board === 'string' ? board : board.id}
                                            to={getBoardPath(board)}
                                            className={({ isActive }) => `board-item ${isActive ? 'active' : ''}`}
                                            onClick={handleLinkClick}
                                        >
                                            <Layout size={16} color="#00d1d1" />
                                            <span>{typeof board === 'string' ? board : board.name}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {isCollapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <Folder size={20} color="var(--warning-color)" />
                            <Folder size={20} color="var(--warning-color)" />
                            <Folder size={20} color="var(--warning-color)" />
                        </div>
                    )}
                </div>

                <div className="nav-section">
                    <div className="section-label">Tools</div>
                    <NavLink
                        to="/forms"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <FileText size={20} />
                        {!isCollapsed && <span>Forms</span>}
                    </NavLink>
                    <NavLink
                        to="/users"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <Users size={20} />
                        {!isCollapsed && <span>Users & Roles</span>}
                    </NavLink>
                    <NavLink
                        to="/files"
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={handleLinkClick}
                    >
                        <File size={20} />
                        {!isCollapsed && <span>Files</span>}
                    </NavLink>
                </div>
            </div>

            <div className="sidebar-footer">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                >
                    <SettingsIcon size={20} />
                    {!isCollapsed && <span>Settings</span>}
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
