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
    X as CloseIcon,
    User
} from 'lucide-react';

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onMobileToggle, onCreateBoard, boardFolders, unreadCount, user }) => {
    const location = useLocation();
    const [openFolders, setOpenFolders] = useState(['Active Projects', 'AI & Innovation', 'Commercial']);
    const isAdmin = user?.role === 'Admin';

    const toggleFolder = (folderId) => {
        setOpenFolders(prev =>
            prev.includes(folderId)
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        );
    };

    const handleLinkClick = () => {
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
            padding: 16px 20px 12px;
            font-size: 13px;
            font-weight: 800;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: ${isCollapsed ? 'none' : 'block'};
        }

        .sidebar-item {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            color: #abb4be;
            text-decoration: none;
            gap: 12px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            cursor: pointer;
        }

        .sidebar-item:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        .sidebar-item.active {
            background: #1b212c;
            color: #0085ff;
        }

        .folder-item {
            display: flex;
            align-items: center;
            padding: 8px 12px 8px 20px;
            color: #fff;
            cursor: pointer;
            gap: 10px;
            font-size: 14px;
            font-weight: 700;
        }

        .folder-item:hover {
            background: rgba(255,255,255,0.05);
        }

        .folder-content {
            padding-left: 0;
        }

        .board-item {
            display: flex;
            align-items: center;
            padding: 8px 20px 8px 48px;
            color: #abb4be;
            text-decoration: none;
            gap: 12px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .board-item:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }

        .board-item.active {
            background: #1b212c;
            color: #0085ff;
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

        @media (max-width: 768px) {
            .sidebar-container {
                position: fixed;
                left: ${isMobileOpen ? '0' : '-100%'};
                width: 280px;
                top: 0;
                box-shadow: ${isMobileOpen ? '2px 0 8px rgba(0,0,0,0.5)' : 'none'};
                background-color: var(--bg-sidebar);
            }
            .collapse-trigger { display: none; }
            .mobile-close-btn { display: block; }
            .sidebar-header { justify-content: space-between; }
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

                    {!isAdmin && (
                        <NavLink
                            to="/settings"
                            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={handleLinkClick}
                        >
                            <User size={20} />
                            {!isCollapsed && <span>Profile</span>}
                        </NavLink>
                    )}

                    {isAdmin && (
                        <NavLink
                            to="/search"
                            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={handleLinkClick}
                        >
                            <Search size={20} />
                            {!isCollapsed && <span>Search Everything</span>}
                        </NavLink>
                    )}
                </div>

                {isAdmin && (
                    <>
                        {!isCollapsed && (
                            <div className="create-btn-container">
                                <button className="create-board-btn" onClick={onCreateBoard}>
                                    <Plus size={18} />
                                    <span>Create New Board</span>
                                </button>
                            </div>
                        )}

                        <div className="nav-section">
                            <div className="section-label" style={{ paddingLeft: '20px', display: isCollapsed ? 'none' : 'block' }}>
                                Main Workspace
                            </div>
                            {!isCollapsed && boardFolders?.map(folder => (
                                <div key={folder.id} className="folder-container">
                                    <div className="folder-item" onClick={() => toggleFolder(folder.id)}>
                                        {openFolders.includes(folder.id) ? <ChevronDown size={14} color="#fff" /> : <ChevronRight size={14} color="#fff" />}
                                        <Folder size={18} fill="#ffcb00" color="#ffcb00" />
                                        <span>{folder.name}</span>
                                    </div>
                                    {openFolders.includes(folder.id) && (
                                        <div className="folder-content">
                                            {folder.boards.map(board => (
                                                <NavLink
                                                    key={board.id}
                                                    to={getBoardPath(board.name || board)}
                                                    className={({ isActive }) => `board-item ${isActive ? 'active' : ''}`}
                                                    onClick={handleLinkClick}
                                                >
                                                    <LayoutDashboard size={18} color="#00d1d1" />
                                                    <span>{board.name}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
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
                    </>
                )}
            </div>

            {isAdmin && (
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
            )}
        </aside>
    );
};

export default Sidebar;
